# Sign-In 500 Error Debugging Guide

## Changes Made

### 1. Improved Error Handling
- ✅ Added try-catch wrapper around `signIn()` method
- ✅ Better error logging in exception filter
- ✅ More detailed error messages

### 2. Fixed Role Loading
- ✅ Updated `findByEmail()` to load role relation
- ✅ Added fallback role loading if relation not loaded
- ✅ Default role 'USER' if role loading fails

### 3. Enhanced Exception Filter
- ✅ Better error logging with stack traces
- ✅ More detailed error messages in development mode

## Debugging Steps

### Step 1: Check Backend Logs
When you try to sign in, check the backend console for error messages. You should see:
- `Error loading user role:` - if role loading fails
- `Unexpected error in signIn:` - if there's an unexpected error
- `Error stack:` - the full stack trace

### Step 2: Verify User Exists
Check if the admin user was created:
```sql
SELECT id, email, full_name, role_id, is_email_verified, status 
FROM users 
WHERE email = 'esraa.amunem@gmail.com';
```

### Step 3: Verify Role is Assigned
Check if the user has a role:
```sql
SELECT u.id, u.email, r.name as role_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'esraa.amunem@gmail.com';
```

### Step 4: Test with curl
Test sign-in directly:
```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"esraa.amunem@gmail.com","password":"Aa@12345"}' \
  -v
```

### Step 5: Check Database Connection
Verify database is accessible and user table exists.

## Common Causes

### 1. User Doesn't Have Role Assigned
**Symptom:** Error loading user role
**Fix:** Ensure user has `role_id` set in database

### 2. Role Doesn't Exist
**Symptom:** Role relation fails to load
**Fix:** Run seeding: `RUN_SEED=true` in `.env`

### 3. Database Connection Issue
**Symptom:** Database query fails
**Fix:** Check database connection in `.env`

### 4. Password Hash Mismatch
**Symptom:** Password comparison fails
**Fix:** User might have been created with different password

## Quick Fixes

### Fix 1: Re-run Seeding
```bash
# Make sure RUN_SEED=true in .env
# Restart backend
npm run start:dev
```

### Fix 2: Manually Assign Role
If user exists but has no role:
```sql
-- Get ADMIN role ID
SELECT id FROM roles WHERE name = 'ADMIN';

-- Update user with role (replace <role_id> with actual ID)
UPDATE users 
SET role_id = '<role_id>' 
WHERE email = 'esraa.amunem@gmail.com';
```

### Fix 3: Check Email Verification
```sql
-- Make sure email is verified
UPDATE users 
SET is_email_verified = true 
WHERE email = 'esraa.amunem@gmail.com';
```

## Next Steps

1. **Restart Backend** - The improved error handling will now log detailed errors
2. **Try Sign-In Again** - Check backend console for specific error
3. **Share Error Logs** - The console will show exactly what's failing

The backend will now provide much more detailed error information to help identify the issue.
