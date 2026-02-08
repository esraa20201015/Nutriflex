# Quick Fix: ECONNREFUSED Error

## What's Happening

Your frontend is trying to connect to the backend at `http://localhost:3000`, but the connection is being refused.

## Immediate Solution

### Option 1: Restart Your Backend (Recommended)

1. **Find your backend terminal** (where you ran `npm run start:dev`)
2. **Stop it** (Press `Ctrl+C`)
3. **Start it again:**
   ```bash
   npm run start:dev
   ```
4. **Wait for this message:**
   ```
   Application is running on: http://localhost:3000
   ```
5. **Test it:** Open `http://localhost:3000/api/health` in browser
6. **Try sign-in again** in your frontend

### Option 2: Check if Backend is Actually Running

Open a new terminal and test:
```bash
curl http://localhost:3000/api/health
```

**If you get connection refused:**
- Backend is NOT running → Start it (Option 1)

**If you get a response:**
- Backend IS running → The issue might be CORS or something else

### Option 3: Kill Process on Port 3000 and Restart

If something is blocking port 3000:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (replace <PID> with the number from above)
taskkill /PID <PID> /F

# Then start backend again
cd path/to/nutriflex-backend
npm run start:dev
```

## Why This Happens

- Backend server stopped/crashed
- Backend never started
- Port 3000 is blocked by another process
- Backend is running on a different port

## Verify It's Fixed

1. Backend terminal shows: `Application is running on: http://localhost:3000`
2. Browser `http://localhost:3000/api/health` returns JSON
3. Frontend sign-in works without ECONNREFUSED error

## Still Not Working?

Check:
- ✅ Backend `.env` file exists
- ✅ Backend `.env` has `PORT=3000`
- ✅ Backend dependencies installed (`npm install`)
- ✅ Backend has no errors in terminal
- ✅ Database is running (if backend uses database)
