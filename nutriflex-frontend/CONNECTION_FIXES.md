# Frontend-Backend Connection Fixes

## ✅ Issues Fixed

### 1. **Token Storage Support for Cookies**
**Problem**: Frontend was configured to use `cookies` for token storage, but the axios interceptor only checked `localStorage` and `sessionStorage`, so tokens weren't being sent in Authorization headers.

**Fix**: Updated `AxiosRequestIntrceptorConfigCallback.ts` to support cookies:
- Now reads tokens from cookies when `accessTokenPersistStrategy: 'cookies'`
- Still sends tokens in `Authorization: Bearer <token>` header (required by NestJS backend)

### 2. **Mock Disabled**
**Problem**: Mock adapter was intercepting API calls.

**Fix**: Set `enableMock: false` in `app.config.ts`

### 3. **Mock Endpoints Updated**
**Problem**: Mock endpoints didn't match actual API paths.

**Fix**: Updated mock endpoints to match backend:
- `/sign-in` → `/api/auth/sign-in`
- `/sign-up` → `/api/auth/sign-up`

### 4. **Environment Variable Support**
**Problem**: No way to configure API URL for production.

**Fix**: Added support for `VITE_API_BASE_URL` environment variable

## 🔧 Current Configuration

### Frontend (`src/configs/app.config.ts`)
```typescript
{
  apiPrefix: '/api',  // Uses Vite proxy in dev
  accessTokenPersistStrategy: 'cookies',
  enableMock: false,
}
```

### Backend (from your .env)
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=604800
ENABLE_EMAIL_VERIFICATION=true
```

### Vite Proxy (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🧪 Testing the Connection

### Method 1: Browser Console (Easiest)

Open browser DevTools Console and run:

```javascript
// Test health endpoint
window.testBackend.health()

// Test sign-in
window.testBackend.signIn('test@example.com', 'Test1234')

// Check token storage
window.testBackend.tokenStorage()

// Run all tests
window.testBackend.all()
```

### Method 2: Direct Fetch

```javascript
// Health check
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend:', data))
  .catch(err => console.error('❌ Error:', err))
```

### Method 3: Network Tab

1. Open DevTools → Network tab
2. Try signing in/up from the UI
3. Check requests:
   - URL should be: `http://localhost:3000/api/auth/sign-in`
   - Method: POST
   - Headers: Should include `Content-Type: application/json`
   - Request body: Should contain email/password
   - Response: Check status and response body

## 📋 Verification Checklist

### Backend
- [ ] Backend running on port 3000
- [ ] Health endpoint works: `http://localhost:3000/api/health`
- [ ] Swagger accessible: `http://localhost:3000/api/swagger`
- [ ] CORS configured correctly
- [ ] No errors in backend console

### Frontend
- [ ] Frontend running (check terminal for port)
- [ ] Mock disabled (`enableMock: false`)
- [ ] Token interceptor supports cookies
- [ ] API calls use `/api` prefix
- [ ] Network requests visible in DevTools

### Connection
- [ ] Health endpoint responds from frontend
- [ ] Sign-in requests reach backend
- [ ] Responses include proper CORS headers
- [ ] Tokens are stored after sign-in
- [ ] Tokens are sent in Authorization header

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution**: 
1. Verify backend `ALLOWED_ORIGINS` includes your frontend URL
2. Restart backend after changing `.env`
3. Check browser console for exact CORS error

### Issue: 404 Not Found
**Solution**:
1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check endpoint paths match exactly
3. Verify Vite proxy is configured

### Issue: Token Not Sent
**Solution**:
1. Check token is stored: `localStorage.getItem('token')` or check cookies
2. Verify token interceptor is working (check Network tab → Request Headers)
3. Ensure `Authorization: Bearer <token>` header is present

### Issue: 401 Unauthorized
**Solution**:
1. Verify token format is correct
2. Check token expiration (JWT_EXPIRES_IN)
3. Ensure backend JWT_SECRET matches

## 🚀 Quick Start

1. **Start Backend**:
   ```bash
   cd nutriflex-backend
   npm run start:dev
   ```

2. **Start Frontend**:
   ```bash
   cd nutriflex-frontend
   npm run dev
   ```

3. **Test Connection**:
   - Open browser console
   - Run: `window.testBackend.health()`
   - Should see: `✅ Backend Health Check: { status: "ok", ... }`

4. **Test Sign Up**:
   - Go to `/sign-up` page
   - Fill form and submit
   - Check Network tab for request/response
   - Check console for success/error messages

## 📝 Notes

- **Token Storage**: Currently using cookies, but tokens are still sent in Authorization header (required by NestJS)
- **Development**: Vite proxy handles CORS automatically
- **Production**: Set `VITE_API_BASE_URL` environment variable
- **Testing**: Use `window.testBackend` functions in browser console for quick tests

## ✅ Status

All connection issues have been fixed! The frontend should now properly connect to your NestJS backend.
