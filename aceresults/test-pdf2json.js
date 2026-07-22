import fs from 'fs';
import PDFParser from 'pdf2json';

const decode = (t) => decodeURIComponent(t.R.map(r => r.T).join(''));

// Reconstruct each page into rows grouped by y-coordinate
function pageToRows(page) {
  const rows = new Map();
  for (const t of page.Texts) {
    const y = Math.round(t.y * 10) / 10; // bucket by rounded y
    const text = decode(t).trim();
    if (!text) continue;
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push({ x: t.x, text });
  }
  return [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, cells]) => cells.sort((a, b) => a.x - b.x).map(c => c.text));
}

const ROLL_RE = /^23AG1A[0-9A-Z]{4}$/;              // e.g. 23AG1A6601, 23AG1A66A0
const SUBCODE_RE = /^22[A-Z]{2}\d{3}([A-Z]{2})?$/;  // e.g. 22MA101BS, 22MC110 (no suffix)
const GRADE_RE = /^(O|A\+|A|B\+|B|C|F\(Ab\)|F)$/;
const STATUS_RE = /^[PF]$/;
const CREDIT_RE = /^\d+\.\d$/;         // subject credits always have 1 decimal: 4.0, 2.5, 0.0
const FOOTER_NUM_RE = /^\d+\.\d{2}$/;  // SGPA/CGPA/Total always have 2 decimals: 7.60, 20.00

// Domain constants — this ACE R22 Sem-1 t-sheet always lists 9 subjects/student.
// Adjust EXPECTED_SUBJECT_COUNT if you reuse this on a different regulation/semester sheet.
const EXPECTED_SUBJECT_COUNT = 9;
const MAX_CREDITS_PER_SUBJECT = 6;
const MIN_GPA = 0, MAX_GPA = 10;

const stats = {
  studentsParsed: 0,
  subjectsParsed: 0,
  failedStudents: 0,
  passedStudents: 0,
  studentsMissingSgpa: 0,
  skippedSubjects: 0,
  rejectedStudents: 0,
  parserErrors: 0,
};

/* ============================================================
 * ROW CLASSIFIER
 * Row -> Roll?  -> new student
 *      -> Subject? -> parse subject
 *      -> Footer?  -> accumulate footer tokens
 *      -> else     -> ignore (page headers, "Sl" numbers, furniture)
 * ============================================================ */
function classifyRow(row) {
  if (row.some(c => ROLL_RE.test(c))) return 'roll';
  if (row.some(c => SUBCODE_RE.test(c))) return 'subject';
  if (row.some(c => c === 'SGPA:' || c === 'CGPA:' || FOOTER_NUM_RE.test(c))) return 'footer';
  return 'ignore';
}

/* ============================================================
 * SUBJECT PARSING
 * Positional, not row[idx+1]: grade/status/credits are always the
 * last three cells of a subject row (verified against the full
 * source sheet), so the subject name is "everything collected
 * between the subject code and the grade" — safe for multi-word
 * names like "English Language and Communication Skills Laboratory".
 * ============================================================ */
function parseSubjectRow(row, rollNumber) {
  const subCode = row.find(c => SUBCODE_RE.test(c));
  const codeIdx = row.indexOf(subCode);
  const lastIdx = row.length - 1;

  const creditsCell = row[lastIdx];
  const statusCell = row[lastIdx - 1];
  const gradeCell = row[lastIdx - 2];
  const name = row.slice(codeIdx + 1, lastIdx - 2).join(' ').trim();

  const subject = {
    code: subCode,
    name,
    grade: gradeCell,
    status: statusCell,
    credits: CREDIT_RE.test(creditsCell) ? parseFloat(creditsCell) : null,
  };

  // Subject-level validation — every field required. Never silently default
  // a missing value (e.g. name=""), since that becomes garbage in Mongo later.
  const missing = [];
  if (!subject.code) missing.push('code');
  if (!subject.name) missing.push('name');
  if (!GRADE_RE.test(subject.grade)) missing.push('grade');
  if (!STATUS_RE.test(subject.status)) missing.push('status');
  if (subject.credits === null || subject.credits < 0 || subject.credits > MAX_CREDITS_PER_SUBJECT) {
    missing.push('credits');
  }

  if (missing.length) {
    console.error(`Skipping subject for ${rollNumber}: missing/invalid [${missing.join(', ')}] — row: ${JSON.stringify(row)}`);
    stats.skippedSubjects++;
    stats.parserErrors++;
    return null;
  }
  return subject;
}

/* ============================================================
 * FOOTER PARSING (see Step 4 note)
 * SGPA:/CGPA: labels and their 2-decimal values, plus the leftover
 * 2-decimal Total value, are collected across every row between one
 * roll number and the next — regardless of which row the PDF's
 * layout engine happened to split them onto.
 * ============================================================ */
function parseFooterTokens(footerTokens) {
  let sgpa = null, cgpa = null;
  const consumed = new Set();

  for (let i = 0; i < footerTokens.length; i++) {
    if (footerTokens[i] === 'SGPA:' && FOOTER_NUM_RE.test(footerTokens[i + 1])) {
      sgpa = parseFloat(footerTokens[i + 1]);
      consumed.add(i + 1);
    }
    if (footerTokens[i] === 'CGPA:' && FOOTER_NUM_RE.test(footerTokens[i + 1])) {
      cgpa = parseFloat(footerTokens[i + 1]);
      consumed.add(i + 1);
    }
  }

  let total = null;
  for (let i = 0; i < footerTokens.length; i++) {
    if (FOOTER_NUM_RE.test(footerTokens[i]) && !consumed.has(i)) total = parseFloat(footerTokens[i]);
  }
  return { sgpa, cgpa, total };
}

/* ============================================================
 * VALIDATION LAYER — separate from parsing.
 * The parser can produce a record; the validator decides whether
 * that record is even possible. Anything impossible gets rejected
 * and reported, never silently written to clean-output.json.
 * ============================================================ */
function validateStudent(student) {
  const errors = [];

  if (!ROLL_RE.test(student.rollNumber)) errors.push('missing/invalid roll number');
  if (student.subjects.length < 1) errors.push('subjects < 1 (empty record)');
  if (student.subjects.length !== EXPECTED_SUBJECT_COUNT) {
    errors.push(`subjects count = ${student.subjects.length}, expected ${EXPECTED_SUBJECT_COUNT}`);
  }

  const hasFail = student.subjects.some(s => s.status === 'F');

  for (const sub of student.subjects) {
    if (!GRADE_RE.test(sub.grade)) errors.push(`subject ${sub.code}: invalid grade`);
    if (!STATUS_RE.test(sub.status)) errors.push(`subject ${sub.code}: invalid status`);
    if (typeof sub.credits !== 'number' || sub.credits < 0 || sub.credits > MAX_CREDITS_PER_SUBJECT) {
      errors.push(`subject ${sub.code}: impossible credits (${sub.credits})`);
    }
    if (sub.status === 'F' && sub.credits !== 0) {
      errors.push(`subject ${sub.code}: failed but credits=${sub.credits}, expected 0`);
    }
  }

  if (hasFail) {
    if (student.sgpa !== null) errors.push(`has backlog but sgpa is not null (${student.sgpa})`);
    if (student.cgpa !== null) errors.push(`has backlog but cgpa is not null (${student.cgpa})`);
  } else {
    if (student.sgpa === null) errors.push('no backlog but sgpa is null');
    if (student.cgpa === null) errors.push('no backlog but cgpa is null');
  }

  if (student.sgpa !== null && (student.sgpa < MIN_GPA || student.sgpa > MAX_GPA)) {
    errors.push(`sgpa out of range: ${student.sgpa}`);
  }
  if (student.cgpa !== null && (student.cgpa < MIN_GPA || student.cgpa > MAX_GPA)) {
    errors.push(`cgpa out of range: ${student.cgpa}`);
  }
  if (student.total === null) errors.push('total is null');

  return errors;
}

/* ============================================================
 * PARSER — builds raw student records, no validation here.
 * ============================================================ */
function parseStudents(allRows) {
  const rawStudents = [];
  let current = null;
  let footerTokens = [];

  function closeCurrent() {
    if (!current) return;
    const { sgpa, cgpa, total } = parseFooterTokens(footerTokens);
    current.sgpa = sgpa;
    current.cgpa = cgpa;
    current.total = total;
    rawStudents.push(current);
  }

  for (const row of allRows) {
    const kind = classifyRow(row);

    if (kind === 'roll') {
      closeCurrent();
      const rollCell = row.find(c => ROLL_RE.test(c));
      current = { rollNumber: rollCell, subjects: [], sgpa: null, cgpa: null, total: null };
      footerTokens = [];
      // The roll number's row also carries that student's first subject
      // (same row in this sheet), so fall through to subject handling below.
    }

    if (!current) continue;

    if (kind === 'roll' || kind === 'subject') {
      const subject = parseSubjectRow(row, current.rollNumber);
      if (subject) {
        current.subjects.push(subject);
        stats.subjectsParsed++;
      }
      continue;
    }

    if (kind === 'footer') {
      for (const c of row) {
        if (c === 'SGPA:' || c === 'CGPA:' || FOOTER_NUM_RE.test(c)) footerTokens.push(c);
      }
      continue;
    }
    // kind === 'ignore': page headers, Sl numbers, table furniture — skip
  }
  closeCurrent();
  return rawStudents;
}

/* ============================================================
 * RUN: PDF -> Parser -> Validator -> clean-output.json
 * ============================================================ */
const pdfParser = new PDFParser();
pdfParser.on('pdfParser_dataError', e => console.error(e.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
  let allRows = [];
  for (const page of pdfData.Pages) {
    allRows = allRows.concat(pageToRows(page));
  }

  const rawStudents = parseStudents(allRows);
  stats.studentsParsed = rawStudents.length;

  const validStudents = [];
  const rejected = [];

  for (const student of rawStudents) {
    const errors = validateStudent(student);
    if (errors.length) {
      console.error(`Problem at student ${student.rollNumber}:`);
      errors.forEach(e => console.error('   -', e));
      rejected.push({ rollNumber: student.rollNumber, errors, student });
      stats.rejectedStudents++;
      stats.parserErrors += errors.length;
      continue; // reject — never written to clean-output.json
    }
    validStudents.push(student);
    const hasFail = student.subjects.some(s => s.status === 'F');
    if (hasFail) stats.failedStudents++; else stats.passedStudents++;
    if (student.sgpa === null) stats.studentsMissingSgpa++;
  }

  fs.writeFileSync('./clean-output.json', JSON.stringify(validStudents, null, 2));
  if (rejected.length) {
    fs.writeFileSync('./rejected-students.json', JSON.stringify(rejected, null, 2));
  }

  console.log('\n--- Parser Summary ---');
  console.log(`Students Parsed        : ${stats.studentsParsed}`);
  console.log(`Subjects Parsed        : ${stats.subjectsParsed}`);
  console.log(`Failed Students        : ${stats.failedStudents}`);
  console.log(`Passed Students        : ${stats.passedStudents}`);
  console.log(`Students Missing SGPA  : ${stats.studentsMissingSgpa}`);
  console.log(`Skipped Subjects       : ${stats.skippedSubjects}`);
  console.log(`Rejected Students      : ${stats.rejectedStudents}`);
  console.log(`Parser Errors          : ${stats.parserErrors}`);
});
pdfParser.loadPDF('./tsheet.pdf');