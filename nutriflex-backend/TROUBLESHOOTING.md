# Troubleshooting Frontend-Backend Connection

## Quick Test Steps

### 1. Test Backend is Running
Open in browser:
```
http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "timestamp": "2026-02-03T13:00:00.000Z",
  "endpoints": {
    "signUp": "/api/auth/sign-up",
    "signIn": "/api/auth/sign-in",
    "swagger": "/api/swagger"
  }
}
```

### 2. Test from Browser Console
Open browser DevTools Console and run:
```javascript
fetch('http://localhost:3000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Connection failed:', err));
```

### 3. Test Sign-In Endpoint
```javascript
fetch('http://localhost:3000/api/auth/sign-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test1234'
  })
})
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

## Common Issues

### Issue 1: CORS Error
**Error Message:**
```
Access to fetch at 'http://localhost:3000/api/auth/sign-in' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solutions:**

1. **Check Backend is Running**
   ```bash
   # In backend directory
   npm run start:dev
   ```
   Should see: `Application is running on: http://localhost:3000`

2. **Check Frontend Origin**
   - Note your frontend URL (e.g., `http://localhost:5173`)
   - Add it to backend `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
   - Restart backend

3. **Use Vite Proxy (Recommended)**
   In frontend `vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:3000',
           changeOrigin: true,
         },
       },
     },
   });
   ```
   Then use `/api` as base URL (without `http://localhost:3000`)

4. **Temporary: Allow All Origins (Development Only)**
   Backend is configured to allow all origins in development mode.
   Make sure `NODE_ENV` is not set to `production` in `.env`

### Issue 2: 404 Not Found
**Error:** `404 Not Found` when calling API

**Check:**
- ✅ Backend is running on port 3000
- ✅ API endpoint includes `/api` prefix
- ✅ Correct endpoint path: `/api/auth/sign-in` (not `/auth/sign-in`)

**Test:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test sign-in endpoint
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### Issue 3: Network Error / Connection Refused
**Error:** `Failed to fetch` or `NetworkError`

**Solutions:**
1. **Backend Not Running**
   ```bash
   cd nutriflex-backend
   npm run start:dev
   ```

2. **Wrong Port**
   - Check backend console: `Application is running on: http://localhost:3000`
   - Verify frontend is calling correct port

3. **Firewall/Antivirus**
   - Temporarily disable to test
   - Add exception for Node.js

4. **Check Port Availability**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # If port is in use, kill the process
   taskkill /PID <pid> /F
   ```

### Issue 4: 401 Unauthorized (After Sign-In)
**Error:** `401 Unauthorized` on protected routes

**Check:**
- ✅ Token is stored after sign-in
- ✅ Token is included in request headers
- ✅ Token format: `Authorization: Bearer <token>`

**Test Token:**
```javascript
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Test protected endpoint
fetch('http://localhost:3000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => console.log('Protected route:', data))
  .catch(err => console.error('Error:', err));
```

### Issue 5: 500 Internal Server Error on Sign-In
**Error:** `{"statusCode":500,"message":"Internal server error","error":"Error"}`

**Common Causes:**

1. **User Doesn't Have Role Assigned**
   - Check database: `SELECT * FROM users WHERE email = 'your-email@example.com';`
   - Verify `role_id` is not NULL
   - Fix: Run seeding or manually assign role

2. **Role Relation Not Loading**
   - User exists but role relation fails to load
   - Check: `SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = 'your-email@example.com';`
   - Fix: Ensure role exists in `roles` table

3. **Database Connection Issue**
   - Database query fails silently
   - Check backend console for database errors
   - Verify database credentials in `.env`

4. **JWT Signing Failure**
   - JWT secret not configured
   - Check: `JWT_SECRET` in `.env` file
   - Fix: Set `JWT_SECRET=your-secret-key` in `.env`

**Debugging Steps:**

1. **Check Backend Console Logs**
   - Look for: `Error loading user role:`
   - Look for: `Unexpected error in signIn:`
   - Look for: Full stack trace

2. **Verify User Exists with Role**
   ```sql
   SELECT u.email, u.full_name, r.name as role_name, u.is_email_verified, u.status
   FROM users u
   LEFT JOIN roles r ON u.role_id = r.id
   WHERE u.email = 'esraa.amunem@gmail.com';
   ```

3. **Test with Admin User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email":"esraa.amunem@gmail.com","password":"Aa@12345"}'
   ```

4. **Check Seeding Ran Successfully**
   - Backend console should show: `✅ Roles seeded` and `✅ Admin user seeded`
   - If not, check `RUN_SEED=true` in `.env`

**Quick Fixes:**

1. **Re-run Seeding**
   ```bash
   # Make sure RUN_SEED=true in .env
   # Restart backend
   npm run start:dev
   ```

2. **Manually Fix User Role**
   ```sql
   -- Get ADMIN role ID
   SELECT id FROM roles WHERE name = 'ADMIN';
   
   -- Update user (replace <role_id> with actual ID)
   UPDATE users 
   SET role_id = '<role_id>', is_email_verified = true, status = 'active'
   WHERE email = 'esraa.amunem@gmail.com';
   ```

3. **Verify JWT Secret**
   ```env
   # In .env file
   JWT_SECRET=your-secret-key-here
   ```

### Issue 6: Helmet Blocking Requests
**Symptoms:** CORS works but requests are blocked

**Solution:** Already configured in `main.ts`:
```typescript
helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
})
```

## Debugging Checklist

### Backend Checklist
- [ ] Backend is running (`npm run start:dev`)
- [ ] Port 3000 is available
- [ ] `.env` file exists with `PORT=3000`
- [ ] Health endpoint works: `http://localhost:3000/api/health`
- [ ] Swagger works: `http://localhost:3000/api/swagger`
- [ ] CORS is configured (check `main.ts`)
- [ ] No errors in backend console

### Frontend Checklist
- [ ] Environment variable set: `VITE_API_BASE_URL=http://localhost:3000/api`
- [ ] API calls include `/api` prefix
- [ ] Using correct HTTP method (POST for sign-in/sign-up)
- [ ] Headers include `Content-Type: application/json`
- [ ] Request body is valid JSON
- [ ] Browser console shows network requests
- [ ] No CORS errors in console

### Network Checklist
- [ ] Backend accessible: `http://localhost:3000/api/health`
- [ ] Frontend can reach backend (test in browser)
- [ ] No proxy/VPN interfering
- [ ] Firewall allows localhost connections

## Step-by-Step Debugging

### Step 1: Verify Backend
```bash
# Start backend
cd nutriflex-backend
npm run start:dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/health
```

### Step 2: Test from Browser
1. Open `http://localhost:3000/api/swagger`
2. Try the sign-in endpoint from Swagger UI
3. Check if it works

### Step 3: Test from Frontend
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try sign-in from frontend
4. Check the request:
   - URL: Should be `http://localhost:3000/api/auth/sign-in`
   - Method: POST
   - Headers: Should include `Content-Type: application/json`
   - Response: Check status code and response body

### Step 4: Check CORS Headers
In Network tab, check response headers:
- `Access-Control-Allow-Origin`: Should include your frontend origin
- `Access-Control-Allow-Methods`: Should include POST, GET, etc.
- `Access-Control-Allow-Headers`: Should include Content-Type, Authorization

## Quick Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
npm run start:dev
```

### Fix 2: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache

### Fix 3: Check Environment Variables
```bash
# Backend .env
cat .env | grep PORT
cat .env | grep ALLOWED_ORIGINS

# Frontend .env
cat .env | grep VITE_API_BASE_URL
```

### Fix 4: Use Vite Proxy
If CORS still doesn't work, use Vite proxy:

**vite.config.ts:**
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

**Then use:**
```typescript
// Instead of: http://localhost:3000/api/auth/sign-in
// Use: /api/auth/sign-in
const API_BASE_URL = '/api';
```

## Still Not Working?

1. **Check Backend Logs**
   - Look for errors in backend console
   - Check for CORS-related errors

2. **Check Browser Console**
   - Look for errors
   - Check Network tab for failed requests

3. **Test with curl/Postman**
   - If curl works but frontend doesn't, it's a CORS/frontend config issue
   - If curl doesn't work, it's a backend issue

4. **Share Error Details**
   - Browser console errors
   - Network tab request/response
   - Backend console logs

## Test Endpoints

### Health Check (No Auth Required)
```
GET http://localhost:3000/api/health
```

### Sign Up (No Auth Required)
```
POST http://localhost:3000/api/auth/sign-up
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Test1234",
  "confirmPassword": "Test1234",
  "role": "TRAINEE",
  "traineeProfile": {
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "fitnessGoals": "Get fit"
  }
}
```

### Sign In (No Auth Required)
```
POST http://localhost:3000/api/auth/sign-in
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}
```
