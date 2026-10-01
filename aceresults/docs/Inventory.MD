# ACE Results API Inventory (stage 2, step 1)

Snapshot of `src/app/api` as of this commit. Documented in `openapi.yaml`.

## Documented endpoints

| Method | Path | Auth | Role / rule |
|---|---|---|---|
| POST | /api/login | none | – |
| POST | /api/logout | none (cookie cleared) | – |
| POST | /api/register/request-otp | none | – |
| POST | /api/register/verify-otp | none | – |
| POST | /api/change-password/request-otp | student cookie | self |
| POST | /api/change-password/verify-otp | student cookie | self |
| GET | /api/student/me | student cookie | self |
| GET | /api/results/{rollNumber} | student cookie OR NextAuth | owner, ADMIN or HOD |
| POST, GET | /api/feedback | student cookie | self |
| POST, GET | /api/upload-students | NextAuth | HOD |
| POST | /api/upload | NextAuth | HOD |
| POST, GET | /api/admin/create-hod | NextAuth | ADMIN |
| GET | /api/security/confirm-login | signed token (query) | – |
| GET | /api/security/not-me | signed token (query) | – |
| * | /api/auth/[...nextauth] | NextAuth internals | – |

## Findings: fix these (priority order)

### Security
1. **`POST /api/change-password` (legacy) lets anyone change a password with only roll number + old password, no session, no OTP, no rate limit.** It bypasses the whole OTP flow and brute-force lock. Delete the route.
2. **`POST /api/results` (legacy) is unauthenticated and hard-codes roll number `23AG1A0501`.** Returns that student's result to anyone. Delete.
3. **`GET /api/add-student` is unauthenticated and creates a student with a hard-coded password.** Delete.
4. `GET /api/test` is a dev leftover. Delete or gate.
5. `/api/upload-tsheet/route.js` is entirely commented out (no handlers). Delete.
6. `/api/login` returns 404 "Student not found" vs 401 "Invalid password": lets an attacker enumerate valid roll numbers. Return the same 401 for both. Also failed attempts are only counted for existing accounts, and there is no IP-based rate limit.
7. `/api/register/request-otp` and both `request-otp` endpoints have no rate limit (email bombing / cost on Resend).
8. `/api/security/not-me` is a state-changing GET; email link scanners can trigger it. Safer: GET shows a confirm page, POST performs the action.
9. `/api/logout` doesn't bump `sessionVersion`; fine for normal use, but consider it for "log out everywhere".

### Bugs
10. `/api/login` response returns `student.branch`, but the model field is `department`, so it's always undefined.
11. Admin dashboard calls `DELETE /api/results/{rollNumber}`, which doesn't exist. Delete button always fails. Either implement (ADMIN only) or remove the UI.
12. `/api/upload` creates students with `branch` and `role` fields; `branch` is not in the Student schema (silently dropped). Use `department`.
13. `upload` for the HOD ignores `department` scoping: any HOD can upload results for any roll number. Consider checking roll prefix/department.
14. `mustChangePassword` is returned but never enforced server-side.
15. Feedback screenshots are stored as base64 inside MongoDB documents. Fine at small scale; won't be at 1000 students.

### Convention inconsistencies (for standardisation phase)
- Unauthenticated returns **401** in most routes but **403** in `/api/results/{rollNumber}`; HOD/ADMIN-role failures return 401 where 403 is correct.
- Success envelope: some `{ success, ... }`, some `{ message }` only (login, register, change-password).
- Error text lives in `message` in most routes but `error` in some uploads.
- `upload` / `upload-students` return HTTP 200 with `success:false` when nothing valid was parsed.
- No stable `code` field (e.g. `INVALID_OTP`) for clients to branch on.

## Suggested next step
Delete items 1-5 first (small, high value), then fix 10-12, then move on to the response/error standardisation.