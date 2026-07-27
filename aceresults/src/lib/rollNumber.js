// src/lib/rollNumber.js

// YY AG [1|5] A XXXX  e.g. 23AG1A0521, 24AG5A0521
export const ACE_ROLL_RE = /^\d{2}AG[15]A[0-9A-Z]{4}$/;

export function deriveBatch(rollNumber) {
  const entryYear = 2000 + parseInt(rollNumber.slice(0, 2), 10);
  const entryType = rollNumber[4]; // "1" regular, "5" lateral
  const gradYear = entryType === "5" ? entryYear + 3 : entryYear + 4;
  return {
    entryYear,
    gradYear,
    isLateral: entryType === "5",
    batch: `${entryYear}-${gradYear}`,
  };
}