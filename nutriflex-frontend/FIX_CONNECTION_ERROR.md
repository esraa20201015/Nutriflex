# Fix: ECONNREFUSED Error

## What This Error Means

```
ECONNREFUSED at internalConnectMultiple
```

This error means:
- ✅ Frontend is running correctly
- ✅ Vite proxy is configured correctly  
- ❌ **Backend server is NOT running** on port 3000

The frontend is trying to connect to `http://localhost:3000` but nothing is listening there.

## Solution: Start Your Backend Server

### Step 1: Open a New Terminal

Keep your frontend terminal running, and open a **NEW terminal window**.

### Step 2: Navigate to Backend Directory

```bash
cd path/to/nutriflex-backend
```

**Example:**
```bash
cd E:\UpDateNutriflex\nutriflex-backend
```

### Step 3: Start Backend Server

```bash
npm run start:dev
```

**OR** (depending on your backend setup):
```bash
npm start
# OR
npm run dev
# OR
npm run start
```

### Step 4: Verify Backend is Running

You should see output like:
```
[Nest] Application successfully started
Application is running on: http://localhost:3000
```

### Step 5: Test Backend Connection

Open browser and go to:
```
http://localhost:3000/api/health
```

**Expected Result:** JSON response like:
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### Step 6: Try Sign-In Again

Now go back to your frontend (`http://localhost:5173/sign-in`) and try signing in again. The error should be gone!

## Quick Checklist

- [ ] Backend directory exists
- [ ] Backend has `package.json` file
- [ ] Backend `.env` file has `PORT=3000`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend server started (`npm run start:dev`)
- [ ] Backend shows "Application is running on: http://localhost:3000"
- [ ] Health endpoint works: `http://localhost:3000/api/health`

## If Backend Won't Start

### Check Backend Terminal for Errors

Common issues:
1. **Missing dependencies:**
   ```bash
   npm install
   ```

2. **Database connection error:**
   - Check `.env` file has correct database credentials
   - Make sure database is running

3. **Port already in use:**
   ```bash
   # Windows - Find what's using port 3000
   netstat -ano | findstr :3000
   
   # Kill the process
   taskkill /PID <PID> /F
   ```

4. **Missing .env file:**
   - Create `.env` file in backend directory
   - Add required environment variables

## Alternative: Test Without Backend (Temporary)

If you just want to test the frontend UI without backend:

1. Enable mock mode temporarily:
   ```typescript
   // src/configs/app.config.ts
   enableMock: true
   ```

2. Restart frontend dev server

**Note:** This is only for UI testing. For full functionality, you need the backend running.

## Summary

**The Error:** Frontend can't connect to backend because backend isn't running.

**The Fix:** Start your backend server in a separate terminal:
```bash
cd nutriflex-backend
npm run start:dev
```

**Verify:** Check `http://localhost:3000/api/health` works.

Once backend is running, the error will disappear! 🎉
