# Cookie-Only Authentication Migration

Date: 2025-11-10

## Summary
Migrated authentication across Auth and Music services from mixed header (Authorization: Bearer) + cookie approach to **cookie-only** using an httpOnly `token` cookie. Frontend no longer stores JWT in memory or sends Authorization headers; all protected backend routes rely solely on `req.cookies.token`.

## Changes
- Removed Authorization header fallback logic in `Backend/music/src/middlewares/auth.middleware.js`.
- Simplified CORS configs in `Backend/auth/src/App.js` and `Backend/music/src/App.js` to a minimal version: `{ origin: FRONTEND_URL, credentials: true }`.
- Eliminated axios Authorization interceptor & token setter from `Frontend/src/api/axiosMusicConfig.jsx`.
- Removed token state and fetching from `Frontend/src/contexts/UserContext.jsx`.
- Deleted `setToken` usages from Login, Register, Header components.
- Auth service already issued cookies; retained `/api/auth/token` for potential debugging (can remove later if unused).

## Testing (Local)
Steps executed via curl:
1. `GET /api/auth/me` without cookie -> 401 Unauthorized.
2. `GET /api/music/` without cookie -> 401 Unauthorized.
3. `POST /api/auth/register` with valid JSON body -> 201 Created, `Set-Cookie: token=...` received.
4. Subsequent `GET /api/auth/me` with cookie -> 200 OK (user data returned).
5. `GET /api/music/` with same cookie -> 200 OK (music data returned) confirming cross-service cookie auth.

## Security Notes
- httpOnly cookie prevents JavaScript access (mitigates XSS token theft).
- `SameSite=Lax` in development avoids CSRF on top-level navigation; consider `SameSite=None; Secure` for cross-site scenarios in production if deployed on different domains with HTTPS.
- If deploying across different subdomains, set `COOKIE_DOMAIN` in auth service to shared parent domain.

## Follow-Up Recommendations
- Remove `/api/auth/token` route if no longer needed by frontend.
- Add simple CSRF protection if non-GET state-changing requests originate from other sites (e.g., implement double-submit cookie or Origin/Referer checks).
- Audit docs mentioning `Authorization: Bearer` and update them (search performed; only documentation references remain).

## Rollback Procedure
To revert, restore previous middleware logic in music service and reintroduce Authorization header interceptor in axios music config; update CORS `allowedHeaders` to include `Authorization` again.

---
Maintainer: Migration completed successfully and validated locally.
