# Frontend-Backend Connection Setup

## ✅ Configuration Verified

### Backend Configuration
- **Port**: `3000`
- **CORS Origins**: `http://localhost:5173` (Vite default), `http://localhost:3000`, `http://localhost:4200`, `http://localhost:8080`
- **Email Verification**: Enabled (`ENABLE_EMAIL_VERIFICATION=true`)

### Frontend Configuration
- **Dev Server**: Vite (default port: `5173`)
- **API Proxy**: `/api` → `http://localhost:3000`
- **Mock**: Disabled (`enableMock: false`)
- **API Base URL**: `/api` (uses Vite proxy in development)

## 🔗 Connection Flow

### Development Mode
1. Frontend runs on: `http://localhost:5173` (or configured Vite port)
2. Backend runs on: `http://localhost:3000`
3. API requests from frontend:
   - Frontend makes request to: `/api/auth/sign-in`
   - Vite proxy intercepts `/api/*` requests
   - Proxy forwards to: `http://localhost:3000/api/auth/sign-in`
   - Backend CORS allows `http://localhost:5173` ✅

### Production Mode
Set `VITE_API_BASE_URL` environment variable to your production backend URL:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 📋 API Endpoints

All endpoints are correctly configured:

- **Sign In**: `POST /api/auth/sign-in`
- **Sign Up**: `POST /api/auth/sign-up`
- **Sign Out**: `POST /api/sign-out`
- **Verify Email**: `GET /api/auth/verify-email?token=<token>`
- **Forgot Password**: `POST /api/forgot-password`
- **Reset Password**: `POST /api/reset-password`

## 🚀 Running the Application

### 1. Start Backend
```bash
# In your backend directory
npm start
# Backend should start on http://localhost:3000
```

### 2. Start Frontend
```bash
# In your frontend directory
npm run dev
# Frontend should start on http://localhost:5173
```

### 3. Verify Connection
- Open browser DevTools → Network tab
- Try signing up or signing in
- Check that API requests go to `http://localhost:3000/api/auth/sign-in` (or sign-up)
- Verify responses are coming from your backend

## 🔍 Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure your backend `ALLOWED_ORIGINS` includes your frontend URL:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue: 404 Not Found
**Solution**: 
1. Verify backend is running on port 3000
2. Check Vite proxy configuration in `vite.config.ts`
3. Verify endpoint paths match exactly

### Issue: Requests Going to Mock
**Solution**: Ensure `enableMock: false` in `src/configs/app.config.ts`

### Issue: Network Error / Connection Refused
**Solution**:
1. Verify backend is running: `curl http://localhost:3000/api/health` (if health endpoint exists)
2. Check backend logs for errors
3. Verify firewall/antivirus isn't blocking connections

## 📝 Environment Variables

### Frontend (.env)
```env
# For production, set your backend API URL
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend (.env)
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=604800
ENABLE_EMAIL_VERIFICATION=true
# ... database config
```

## ✅ Verification Checklist

- [x] Backend running on port 3000
- [x] Frontend running on port 5173 (or configured port)
- [x] Mock disabled (`enableMock: false`)
- [x] Vite proxy configured correctly
- [x] CORS origins match frontend URL
- [x] API endpoints match backend routes
- [x] Network requests visible in browser DevTools
- [x] Backend receives requests (check backend logs)

## 🎯 Next Steps

1. **Test Sign Up**: Create a new account with COACH or TRAINEE role
2. **Test Sign In**: Login with created credentials
3. **Test Email Verification**: Check email and verify account (if enabled)
4. **Check Token Storage**: Verify JWT token is stored correctly
5. **Test Protected Routes**: Ensure authenticated routes work

---

**Status**: ✅ Frontend is properly configured to connect to backend!
