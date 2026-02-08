# Fix: Users Menu Not Showing in Sidebar

## Problem
The "Users" menu item is not appearing in the sidebar when logged in as ADMIN.

## Root Cause
The issue is likely a mismatch between:
1. Backend returns role as `"ADMIN"` (uppercase)
2. Frontend navigation expects `"ADMIN"` (uppercase) - ✅ Fixed
3. User's authority array might not be set correctly

## Solution Steps

### Step 1: Clear Browser Storage
The old user data might be cached. Clear it:

**In Browser Console (F12):**
```javascript
// Clear localStorage
localStorage.clear()

// Clear sessionStorage  
sessionStorage.clear()

// Clear cookies (if using cookies)
document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Step 2: Sign Out and Sign Back In
1. Sign out from the application
2. Sign back in with your ADMIN account
3. This will refresh the user authority from the backend

### Step 3: Verify User Authority
**In Browser Console (F12):**
```javascript
// Check user authority
window.debugAuth()

// Should show:
// User Role: "ADMIN"
// User Authority: ["ADMIN"]
// Authority includes ADMIN: true
```

### Step 4: Check Navigation Config
The navigation config should have:
```typescript
{
    key: 'users',
    path: '/users',
    title: 'Users',
    authority: [ADMIN], // ADMIN = 'ADMIN'
}
```

## Debugging

### Check Current User State
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('sessionUser') || '{}')
console.log('Stored User:', user)
console.log('User Role:', user.state?.user?.role)
console.log('User Authority:', user.state?.user?.authority)
```

### Expected Values
- `role`: `"ADMIN"` (uppercase)
- `authority`: `["ADMIN"]` (array with uppercase string)

### If Authority is Wrong
If you see `authority: ["admin"]` (lowercase) or `authority: []`:
1. Sign out
2. Clear storage (Step 1)
3. Sign back in
4. Check again

## Quick Fix Script

Run this in browser console to manually fix authority:

```javascript
// Get current user
const userData = JSON.parse(localStorage.getItem('sessionUser') || '{}')
const currentUser = userData.state?.user || {}

// Update authority if role is ADMIN
if (currentUser.role === 'ADMIN' && !currentUser.authority?.includes('ADMIN')) {
    const updatedUser = {
        ...userData,
        state: {
            ...userData.state,
            user: {
                ...currentUser,
                authority: ['ADMIN']
            }
        }
    }
    localStorage.setItem('sessionUser', JSON.stringify(updatedUser))
    console.log('✅ Authority updated! Refresh the page.')
    location.reload()
} else {
    console.log('User authority:', currentUser.authority)
    console.log('User role:', currentUser.role)
}
```

## Verification Checklist

- [ ] User role from backend is `"ADMIN"` (uppercase)
- [ ] User authority array contains `"ADMIN"` (uppercase)
- [ ] Navigation config uses `ADMIN` constant (which is `"ADMIN"`)
- [ ] Cleared browser storage
- [ ] Signed out and signed back in
- [ ] Page refreshed after sign in

## Still Not Working?

1. **Check Backend Response:**
   - Open Network tab in DevTools
   - Find the sign-in request
   - Check response: `data.user.role` should be `"ADMIN"`

2. **Check Frontend State:**
   ```javascript
   window.debugAuth()
   ```

3. **Check Navigation Config:**
   - Verify `src/configs/navigation.config/index.ts` has Users menu item
   - Verify `authority: [ADMIN]` where `ADMIN = 'ADMIN'`

4. **Check Authority Check Logic:**
   - Verify `src/utils/hooks/useAuthority.ts` is working correctly
   - Should return `true` if `userAuthority.includes('ADMIN')` and `authority.includes('ADMIN')`
