// src/lib/parseTsheet.js
import PDFParser from "pdf2json";

const ROLL_RE = /^\d{2}[A-Z0-9]{8}$/;
const SUBCODE_RE = /^\d{2}[A-Z]{2}\d{3}([A-Z]{2})?$/;
const GRADE_RE = /^(O|A\+|A|B\+|B|C|F\(Ab\)|F)$/;
const STATUS_RE = /^[PF]$/;
const CREDIT_RE = /^\d+\.\d$/;
const FOOTER_NUM_RE = /^\d+\.\d{2}$/;

const MAX_CREDITS_PER_SUBJECT = 6;
const MIN_GPA = 0, MAX_GPA = 10;

function decode(t) {
  return decodeURIComponent(t.R.map((r) => r.T).join(""));
}

function pageToRows(page) {
  const rows = new Map();
  for (const t of page.Texts) {
    const y = Math.round(t.y * 10) / 10;
    const text = decode(t).trim();
    if (!text) continue;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push({ x: t.x, text });
  }
  return [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map((c) => c.text));
}

function classifyRow(row) {
  if (row.some((c) => ROLL_RE.test(c))) return "roll";
  if (row.some((c) => SUBCODE_RE.test(c))) return "subject";
  if (row.some((c) => c === "SGPA:" || c === "CGPA:" || FOOTER_NUM_RE.test(c))) return "footer";
  return "ignore";
}

function parseSubjectRow(row, rollNumber, errors) {
  const subCode = row.find((c) => SUBCODE_RE.test(c));
  const codeIdx = row.indexOf(subCode);
  const lastIdx = row.length - 1;

  const creditsCell = row[lastIdx];
  const statusCell = row[lastIdx - 1];
  const gradeCell = row[lastIdx - 2];
  const name = row.slice(codeIdx + 1, lastIdx - 2).join(" ").trim();

  const subject = {
    code: subCode,
    name,
    grade: gradeCell,
    status: statusCell,
    credits: CREDIT_RE.test(creditsCell) ? parseFloat(creditsCell) : null,
  };

  const missing = [];
  if (!subject.code) missing.push("code");
  if (!subject.name) missing.push("name");
  if (!GRADE_RE.test(subject.grade)) missing.push("grade");
  if (!STATUS_RE.test(subject.status)) missing.push("status");
  if (subject.credits === null || subject.credits < 0 || subject.credits > MAX_CREDITS_PER_SUBJECT) {
    missing.push("credits");
  }

  if (missing.length) {
    errors.push(`Skipping subject for ${rollNumber}: missing/invalid [${missing.join(", ")}] — row: ${JSON.stringify(row)}`);
    return null;
  }
  return subject;
}

function parseFooterTokens(footerTokens) {
  let sgpa = null, cgpa = null;
  const consumed = new Set();

  for (let i = 0; i < footerTokens.length; i++) {
    if (footerTokens[i] === "SGPA:" && FOOTER_NUM_RE.test(footerTokens[i + 1])) {
      sgpa = parseFloat(footerTokens[i + 1]);
      consumed.add(i + 1);
    }
    if (footerTokens[i] === "CGPA:" && FOOTER_NUM_RE.test(footerTokens[i + 1])) {
      cgpa = parseFloat(footerTokens[i + 1]);
      consumed.add(i + 1);
    }
  }
  return { sgpa, cgpa };
}

function validateStudent(student, errors) {
  const localErrors = [];
  if (!ROLL_RE.test(student.rollNumber)) localErrors.push("missing/invalid roll number");
  if (student.subjects.length < 1) localErrors.push("subjects < 1 (empty record)");

  const hasFail = student.subjects.some((s) => s.status === "F");

  for (const sub of student.subjects) {
    if (!GRADE_RE.test(sub.grade)) localErrors.push(`subject ${sub.code}: invalid grade`);
    if (!STATUS_RE.test(sub.status)) localErrors.push(`subject ${sub.code}: invalid status`);
    if (typeof sub.credits !== "number" || sub.credits < 0 || sub.credits > MAX_CREDITS_PER_SUBJECT) {
      localErrors.push(`subject ${sub.code}: impossible credits (${sub.credits})`);
    }
    if (sub.status === "F" && sub.credits !== 0) {
      localErrors.push(`subject ${sub.code}: failed but credits=${sub.credits}, expected 0`);
    }
  }

  if (hasFail) {
    if (student.sgpa !== null) localErrors.push(`has backlog but sgpa is not null (${student.sgpa})`);
    if (student.cgpa !== null) localErrors.push(`has backlog but cgpa is not null (${student.cgpa})`);
  }
  if (student.sgpa !== null && (student.sgpa < MIN_GPA || student.sgpa > MAX_GPA)) {
    localErrors.push(`sgpa out of range: ${student.sgpa}`);
  }
  if (student.cgpa !== null && (student.cgpa < MIN_GPA || student.cgpa > MAX_GPA)) {
    localErrors.push(`cgpa out of range: ${student.cgpa}`);
  }

  if (localErrors.length) errors.push({ rollNumber: student.rollNumber, errors: localErrors });
  return localErrors.length === 0;
}

function parseStudents(allRows, errors) {
  const rawStudents = [];
  let current = null;
  let footerTokens = [];

  function closeCurrent() {
    if (!current) return;
    const { sgpa, cgpa } = parseFooterTokens(footerTokens);
    current.sgpa = sgpa;
    current.cgpa = cgpa;
    current.status = current.subjects.some((s) => s.status === "F") ? "FAIL" : "PASS";
    rawStudents.push(current);
  }

  for (const row of allRows) {
    const kind = classifyRow(row);

    if (kind === "roll") {
      closeCurrent();
      const rollCell = row.find((c) => ROLL_RE.test(c));
      current = { rollNumber: rollCell, subjects: [], sgpa: null, cgpa: null, status: null };
      footerTokens = [];
    }

    if (!current) continue;

    if (kind === "roll" || kind === "subject") {
      const subject = parseSubjectRow(row, current.rollNumber, errors);
      if (subject) current.subjects.push(subject);
      continue;
    }

    if (kind === "footer") {
      for (const c of row) {
        if (c === "SGPA:" || c === "CGPA:" || FOOTER_NUM_RE.test(c)) footerTokens.push(c);
      }
    }
  }
  closeCurrent();
  return rawStudents;
}

/**
 * Parses a T-Sheet PDF buffer into validated student records.
 * @param {Buffer} buffer
 * @returns {Promise<{ validStudents: object[], rejected: object[], parserErrors: string[] }>}
 */
export function parseTsheetBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    const parserErrors = [];

    pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let allRows = [];
      for (const page of pdfData.Pages) {
        allRows = allRows.concat(pageToRows(page));
      }

      const rawStudents = parseStudents(allRows, parserErrors);
      const validStudents = [];
      const rejected = [];

      for (const student of rawStudents) {
        const validationErrors = [];
        const ok = validateStudent(student, validationErrors);
        if (!ok) {
          rejected.push(...validationErrors);
        } else {
          validStudents.push(student);
        }
      }

      resolve({ validStudents, rejected, parserErrors });
    });

    pdfParser.parseBuffer(buffer);
  });
}