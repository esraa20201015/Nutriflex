# Troubleshooting: Backend Connection Error

## Error: `ECONNREFUSED` - Connection Refused

This error means the frontend cannot connect to the backend server.

### Quick Fix Steps

#### 1. **Check if Backend is Running**

Open a new terminal and check if the backend is running:

```bash
# Check if port 3000 is in use
# Windows PowerShell:
netstat -ano | findstr :3000

# Or try to access backend directly:
curl http://localhost:3000/api/health
```

**Expected Result**: Should return JSON response or show the backend is running.

**If backend is NOT running:**
```bash
# Navigate to your backend directory
cd path/to/nutriflex-backend

# Start the backend (check your backend's package.json for the correct command)
npm run start:dev
# OR
npm start
# OR
npm run dev
```

**Expected Output:**
```
Application is running on: http://localhost:3000
```

#### 2. **Verify Backend Port**

Make sure your backend `.env` file has:
```env
PORT=3000
```

#### 3. **Check Vite Dev Server**

Make sure your frontend dev server is running:
```bash
# In frontend directory
npm run dev
```

Should show:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

#### 4. **Test Backend Connection**

Open browser and go to:
```
http://localhost:3000/api/health
```

**Expected**: JSON response with status "ok"

**If you get connection refused:**
- Backend is not running → Start it
- Backend is on different port → Update `vite.config.ts` proxy target

#### 5. **Check Vite Proxy Configuration**

Verify `vite.config.ts` has:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // ← Make sure this matches your backend port
      changeOrigin: true,
      secure: false
    }
  }
}
```

#### 6. **Restart Both Servers**

1. Stop frontend (Ctrl+C)
2. Stop backend (Ctrl+C)
3. Start backend first: `npm run start:dev`
4. Wait for backend to fully start
5. Start frontend: `npm run dev`

### Common Issues

#### Issue 1: Backend Not Started
**Solution**: Start the backend server first, then start frontend

#### Issue 2: Wrong Port
**Solution**: 
- Check backend `.env` file for `PORT=3000`
- Check `vite.config.ts` proxy target matches backend port

#### Issue 3: Port Already in Use
**Solution**:
```bash
# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Then restart backend
```

#### Issue 4: Firewall/Antivirus Blocking
**Solution**: 
- Temporarily disable firewall/antivirus to test
- Add exception for Node.js and port 3000

#### Issue 5: Backend Crashed
**Solution**:
- Check backend terminal for errors
- Check backend logs
- Verify database connection (if using database)
- Check `.env` file is correct

### Testing Steps

1. **Test Backend Directly:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test from Browser:**
   Open: `http://localhost:3000/api/health`
   Should show JSON response

3. **Test Frontend Proxy:**
   Open: `http://localhost:5173/api/health`
   Should also show JSON response (via proxy)

4. **Test Sign-In Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test1234"}'
   ```

### Still Not Working?

1. **Check Backend Logs:**
   - Look at backend terminal output
   - Check for any error messages
   - Verify database connection

2. **Check Frontend Console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Environment:**
   ```bash
   # Backend .env should have:
   PORT=3000
   ALLOWED_ORIGINS=http://localhost:5173
   ```

4. **Try Direct Connection:**
   Temporarily change frontend to call backend directly:
   ```typescript
   // In src/configs/app.config.ts
   apiPrefix: 'http://localhost:3000/api'
   ```
   (Remember to change back to `/api` after testing)

### Quick Checklist

- [ ] Backend is running (`npm run start:dev`)
- [ ] Backend is on port 3000
- [ ] Backend health endpoint works: `http://localhost:3000/api/health`
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] Frontend is on port 5173 (or configured port)
- [ ] Vite proxy is configured correctly
- [ ] No firewall blocking connections
- [ ] Backend `.env` has correct `PORT=3000`
- [ ] Backend `.env` has `ALLOWED_ORIGINS` with frontend URL

### Need More Help?

Share:
1. Backend terminal output
2. Frontend terminal output  
3. Browser console errors (F12 → Console)
4. Network tab showing the failed request (F12 → Network)
