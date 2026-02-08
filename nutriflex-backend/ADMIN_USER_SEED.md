# Admin User Seed Configuration

## Admin User Credentials

- **Email:** `esraa.amunem@gmail.com`
- **Password:** `Aa@12345`
- **Full Name:** `Admin User`
- **Role:** `ADMIN`
- **Status:** `ACTIVE`
- **Email Verified:** `true` (pre-verified)

## How It Works

The admin user is automatically created when the application starts if:
1. `RUN_SEED=true` is set in `.env` file
2. The admin user doesn't already exist (checked by email)

## Seeding Process

1. **Roles are seeded first** (ADMIN, COACH, TRAINEE)
2. **Admin user is created** with ADMIN role
3. **Password is hashed** using bcrypt (10 rounds)
4. **User is pre-verified** (no email verification required)

## Configuration

### Enable Seeding

In `.env` file:
```env
RUN_SEED=true
```

### Disable Seeding

In `.env` file:
```env
RUN_SEED=false
```
Or remove the line entirely (defaults to disabled)

## Usage

### First Time Setup

1. Make sure `RUN_SEED=true` in `.env`
2. Start the backend:
   ```bash
   npm run start:dev
   ```
3. Check console logs for:
   ```
   ✅ Roles seeded
   ✅ Admin user seeded
   ✅ Data seeding completed
   ```

### Sign In as Admin

Use the credentials to sign in:
```bash
POST http://localhost:3000/api/auth/sign-in
Content-Type: application/json

{
  "email": "esraa.amunem@gmail.com",
  "password": "Aa@12345"
}
```

### After Seeding

Once the admin user exists, subsequent restarts will skip creating it:
```
Admin user already exists: esraa.amunem@gmail.com
```

## Security Notes

⚠️ **Important:**
- The admin password is stored in plain text in the code for seeding purposes only
- In production, consider:
  - Using environment variables for admin credentials
  - Changing the default password after first login
  - Using a more secure password generation method

## Changing Admin Credentials

To change the admin user credentials, edit:
```
src/database/seeding/data-seeding.service.ts
```

Update the `ADMIN_USER` constant:
```typescript
const ADMIN_USER = {
  email: 'your-email@example.com',
  password: 'YourSecurePassword123',
  fullName: 'Admin User',
};
```

Then:
1. Delete the existing admin user from database (or change email)
2. Restart the backend with `RUN_SEED=true`

## Testing

### Test Admin Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "esraa.amunem@gmail.com",
    "password": "Aa@12345"
  }'
```

Expected response:
```json
{
  "status": 200,
  "messageEn": "Sign in successful",
  "messageAr": "تم تسجيل الدخول بنجاح",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "fullName": "Admin User",
      "email": "esraa.amunem@gmail.com",
      "role": "ADMIN"
    }
  }
}
```

### Test Admin Access

Use the `access_token` to access admin-only endpoints:
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <access_token>"
```

## Files Modified

1. **`src/database/seeding/data-seeding.service.ts`**
   - Added `seedAdminUser()` method
   - Integrated into `runAllSeeds()` process

2. **`src/database/database.module.ts`**
   - Added `UsersModule` import to access `UsersService`

3. **`.env`**
   - Added `RUN_SEED=true` configuration

## Troubleshooting

### Admin User Not Created

1. **Check `RUN_SEED` is set:**
   ```bash
   # In .env file
   RUN_SEED=true
   ```

2. **Check console logs:**
   - Should see "✅ Admin user seeded"
   - If you see "Admin user already exists", the user was created previously

3. **Check database:**
   - Verify user exists in `users` table
   - Verify role is set to ADMIN

### Cannot Sign In

1. **Verify user exists:**
   ```sql
   SELECT * FROM users WHERE email = 'esraa.amunem@gmail.com';
   ```

2. **Check password:**
   - Password is case-sensitive: `Aa@12345`
   - Make sure no extra spaces

3. **Check email verification:**
   - Admin user should have `is_email_verified = true`

4. **Check account status:**
   - Should have `status = 'active'`
