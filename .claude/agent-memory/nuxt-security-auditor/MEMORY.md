# Nuxt Security Auditor Memory

## Project Architecture
- See CLAUDE.md for full project structure
- Auth: h3 `useSession()` encrypted cookies via `server/utils/session.ts`
- Validation: `sanitize()` + `validateBody()` in `server/utils/validation.ts`
- RBAC: `server/utils/rbac.ts` on user management endpoints
- Uploads: Cloudinary with 10MB limit, MIME type validation

## Existing Security Measures
1. Session-based auth with encrypted cookies
2. bcrypt password hashing (with plaintext auto-migration)
3. Server middleware auth on admin API routes
4. NoSQL injection prevention via sanitize()
5. Yup validation on all POST/PUT endpoints
6. Password field excluded from API responses
7. File upload size/type limits

## Known Issues
- No nuxt-security module installed (no CSP, rate limiting, etc.)
- No CSRF protection module
- No rate limiting on login endpoint
- Legacy plaintext passwords may still exist in DB

## Notes
- Record vulnerability findings, hardening measures, and security audit results here
