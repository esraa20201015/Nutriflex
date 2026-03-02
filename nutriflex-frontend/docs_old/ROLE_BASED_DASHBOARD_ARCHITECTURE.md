# Role-Based Dashboard Architecture and Responsibilities

This document describes how role-based dashboards work and who (frontend vs backend) is responsible for what. It is the single source of truth for the login contract, JWT usage, and dashboard data scoping.

## Is this frontend, backend, or both?

**It requires coordination between both.** The frontend handles routing, guards, redirect, and sending the token. Dashboard data scoping (who sees what) is **decided by the backend** using the JWT. If coaches or trainees see wrong data, the fix is almost always on the **backend** (JWT payload + filtering). If an Admin sees the Coach dashboard or a Coach can open the Admin URL, that is a **frontend** guard/redirect issue.

---

## Correct end-to-end flow

1. User signs in (email, password).
2. Frontend calls `POST /auth/login`.
3. Backend validates credentials, loads user + role, creates JWT with `userId` + `role`, returns `access_token` and `user { id, role, ... }`.
4. Frontend stores token, sets user (`id`, `role`, `authority`), redirects by role (admin/coach/trainee dashboard).
5. User navigates to e.g. `/coach/dashboard` → ProtectedRoute + AuthorityGuard run.
6. Frontend calls dashboard APIs with `Authorization: Bearer <token>` (no body/params for dashboard scope).
7. Backend decodes JWT, gets `userId` + `role`, filters data by that user (for coach/trainee), returns scoped data.
8. Frontend renders the dashboard.

---

## What the backend must provide

### 1. Login response shape

The frontend expects (see `src/auth/AuthProvider.tsx`):

- `data.access_token` – JWT string.
- `data.user.id` – unique user ID (used as coach/trainee id when applicable).
- `data.user.role` – string (e.g. `"ADMIN"`, `"COACH"`, `"TRAINEE"`) or object `{ name: "COACH" }`. The frontend normalizes both via `normalizeRole()`.
- Optionally: `data.user.fullName`, `data.user.email` for display.

The frontend sets `user.authority` to `[role]` and uses it for route guards.

### 2. JWT payload (required for correct dashboard behavior)

The backend must encode in the JWT at least:

- **User identity:** e.g. `sub` or `userId` (same value as `user.id` in the login response).
- **Role:** e.g. `role` or `roles` so the backend can allow only the correct role per endpoint and scope data by user id.

### 3. Dashboard endpoints and server-side filtering

- **Admin:** `GET /api/dashboard/admin` (and related) must require valid JWT and role ADMIN; return system-wide stats (no filtering by user id).
- **Coach:** Coach dashboard endpoints must require valid JWT and role COACH; resolve coach id from JWT (e.g. `req.user.id` = `sub`); return only that coach’s data. **Do not** trust a client-sent `coach_id` for scoping.
- **Trainee:** Trainee dashboard endpoints must require valid JWT and role TRAINEE; resolve trainee id from JWT; return only that trainee’s data. **Do not** trust a client-sent `trainee_id` for scoping.

**Summary:** Backend returns `user.id` and `user.role` on login; puts the same identity and role in the JWT; for each dashboard endpoint, authorizes by role and (for coach/trainee) filters by the user id from the JWT.

---

## What the frontend does (reference)

### 1. Auth state and token

- Stores `access_token` (per `appConfig.accessTokenPersistStrategy`: localStorage/sessionStorage/cookies).
- Stores `user` with `id`, `role`, `authority` (and optionally fullName, email) from the login response.
- Implemented in `src/auth/AuthProvider.tsx` and `src/store/authStore.ts`; `normalizeRole()` ensures `authority` is set from role.

### 2. Sending the token

- Every API request sends `Authorization: Bearer <access_token>`.
- Implemented in `src/services/axios/AxiosRequestIntrceptorConfigCallback.ts`.

### 3. Post-login redirect by role

- After sign-in: ADMIN → `/admin/dashboard`, COACH → `/coach/dashboard`, TRAINEE → `/trainee/dashboard`.
- Implemented in `AuthProvider` via `getDashboardPathForRole(role)` when there is no `redirectUrl` query param.

### 4. Protected routes and role-based access

- **ProtectedRoute:** Allows access only when `authenticated` (token + signedIn); otherwise redirects to sign-in. See `src/components/route/ProtectedRoute.tsx`.
- **AuthorityGuard:** For each protected route, checks that the user’s `authority` includes at least one of the route’s `authority` roles; otherwise redirects to `/access-denied`. See `src/components/route/AuthorityGuard.tsx` and `src/utils/hooks/useAuthority.ts`.
- Route config in `src/configs/routes.config/routes.config.ts` assigns e.g. `authority: [ADMIN]` for admin routes, `[COACH, ADMIN]` for coach routes, `[ADMIN, TRAINEE]` for trainee dashboard.

**Summary:** Frontend handles routing, role-based redirect, and who can open which URL; it does not decide which rows or entities the backend returns—the backend does that using the JWT.

### 5. Dashboard rendering

- Admin/Coach/Trainee dashboards call their APIs with no body/params for scoping; backend uses JWT to identify the user and return scoped data. No frontend change is needed for “each coach/trainee only sees their own data” if the backend filters by JWT.

---

## How to confirm where the problem is

| Symptom | Likely cause | Where to fix |
|--------|---------------|--------------|
| Admin/Coach/Trainee lands on wrong dashboard after login | Redirect not using role or role missing/wrong in login response | Frontend: ensure `normalizeRole(resp.data.user.role)` and `getDashboardPathForRole(role)`; Backend: return correct `user.role` and include role in JWT |
| Coach can open /admin/dashboard or Trainee can open /coach/dashboard | Guard allows it | Frontend: check route `authority` and `user.authority` in AuthorityGuard |
| Coach sees another coach’s data or all coaches’ data | Data not filtered by JWT user id | Backend: in coach dashboard endpoints, resolve coach id from JWT and filter all queries by it |
| Trainee sees another trainee’s data or all trainees’ data | Data not filtered by JWT user id | Backend: in trainee dashboard endpoints, resolve trainee id from JWT and filter all queries by it |
| 401 on dashboard APIs after login | Token not sent or invalid/expired JWT | Frontend: confirm interceptor sends Bearer token; Backend: validate JWT and return 401 only when invalid/expired |
| Admin dashboard shows wrong or empty data | Admin endpoint not checking role or wrong query | Backend: require ADMIN role and return system-wide stats |

---

## Summary

- **Architecture:** Frontend sends the JWT on every request and uses role for redirect and route guards; backend uses the JWT to identify the user and role and to **scope** dashboard data (admin = global, coach/trainee = by `req.user.id`).
- **Backend must:** Return `user.id` and `user.role` on login; put the same identity and role in the JWT; for each dashboard endpoint, authorize by role and (for coach/trainee) filter by the user id from the JWT.
- **Frontend must:** Store token and user (id, role, authority); send Bearer token on every request; redirect after login by role; protect routes with AuthorityGuard; render the dashboard that matches the current URL. This is already implemented; if dashboards still show wrong data, the fix is on the backend (JWT payload + server-side filtering by user id and role).
