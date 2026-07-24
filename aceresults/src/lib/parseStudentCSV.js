// src/lib/parseStudentCSV.js
import Papa from "papaparse";

const ROLL_RE = /^\d{2}[A-Z0-9]{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

// Canonical field -> list of acceptable header variants (already lowercased/stripped)
const HEADER_ALIASES = {
  rollNumber: ["rollnumber", "rollno", "roll no", "roll_no", "roll number", "rollnum", "htno", "ht no", "hallticketno", "hallticketnumber"],
  name: ["name", "studentname", "student name"],
  department: ["department", "dept", "branch"],
  section: ["section", "sec"],
  batch: ["batch", "year", "batchyear"],
  email: ["email", "emailid", "email id", "mailid"],
  mobile: ["mobile", "mobilenumber", "mobile number", "phone", "phonenumber", "phone number", "contact", "contactnumber"],
};

// Normalize a header string for comparison: lowercase, strip spaces/underscores/punctuation
function normalizeHeader(h) {
  return h.toLowerCase().replace(/[\s_\-.]/g, "");
}

// Build a map: normalized-input-header -> canonical field name
function buildHeaderMap(rawHeaders) {
  const map = {};
  for (const rawHeader of rawHeaders) {
    const normalized = normalizeHeader(rawHeader);
    for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
      const normalizedAliases = aliases.map((a) => normalizeHeader(a));
      if (normalizedAliases.includes(normalized)) {
        map[rawHeader] = canonical;
        break;
      }
    }
  }
  return map;
}

function normalizeRow(row, headerMap) {
  const out = { rollNumber: "", name: "", department: "", section: "", batch: "", email: "", mobile: "" };
  for (const [rawHeader, value] of Object.entries(row)) {
    const canonical = headerMap[rawHeader];
    if (!canonical) continue; // unrecognized column, ignore
    const v = (value ?? "").toString().trim();
    if (canonical === "rollNumber") out.rollNumber = v.toUpperCase();
    else if (canonical === "email") out.email = v.toLowerCase();
    else if (canonical === "mobile") out.mobile = v.replace(/\D/g, "");
    else out[canonical] = v;
  }
  return out;
}

function validateRow(row, rowIndex) {
  const errors = [];
  if (!row.rollNumber) errors.push("Missing Roll Number");
  else if (!ROLL_RE.test(row.rollNumber)) errors.push(`Invalid Roll Number format: ${row.rollNumber}`);

  if (!row.name) errors.push("Missing Name");

  if (row.email && !EMAIL_RE.test(row.email)) errors.push(`Invalid email: ${row.email}`);
  if (row.mobile && !MOBILE_RE.test(row.mobile)) errors.push(`Invalid mobile: ${row.mobile}`);

  return errors.length ? { rowIndex, row, errors } : null;
}

export function parseStudentCSV(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const parseErrors = parsed.errors.map((e) => `Row ${e.row}: ${e.message}`);

  const rawHeaders = parsed.meta.fields || [];
  const headerMap = buildHeaderMap(rawHeaders);

  // Check that we found a rollNumber column and a name column, regardless of what they were literally called
  const mappedCanonicals = new Set(Object.values(headerMap));
  const missingRequired = [];
  if (!mappedCanonicals.has("rollNumber")) missingRequired.push("Roll Number");
  if (!mappedCanonicals.has("name")) missingRequired.push("Name");

  if (missingRequired.length) {
    return {
      validRows: [],
      invalidRows: [],
      duplicateRollNumbers: [],
      parseErrors: [`Could not find required column(s): ${missingRequired.join(", ")}. Found headers: ${rawHeaders.join(", ")}`],
    };
  }

  const validRows = [];
  const invalidRows = [];
  const seen = new Map();
  const duplicateRollNumbers = new Set();

  parsed.data.forEach((rawRow, i) => {
    const row = normalizeRow(rawRow, headerMap);
    const validationErrors = validateRow(row, i + 2);

    if (validationErrors) {
      invalidRows.push(validationErrors);
      return;
    }

    if (seen.has(row.rollNumber)) {
      duplicateRollNumbers.add(row.rollNumber);
      invalidRows.push({ rowIndex: i + 2, row, errors: [`Duplicate Roll Number in file: ${row.rollNumber}`] });
      return;
    }
    seen.set(row.rollNumber, true);
    validRows.push(row);
  });

  return { validRows, invalidRows, duplicateRollNumbers: [...duplicateRollNumbers], parseErrors };
}