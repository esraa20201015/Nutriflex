# Frontend API Documentation - Sign Up & Sign In

## Base URL
```
http://localhost:3000/api
```
**Production:** Update with your production URL

---

## Authentication Flow

1. **Sign Up** → User registers with email/password and role-specific profile
2. **Email Verification** (if enabled) → User clicks verification link sent to email
3. **Sign In** → User logs in with email/password → Receives JWT token
4. **Use Token** → Include token in `Authorization: Bearer <token>` header for protected routes

---

## 1. Sign Up

### Endpoint
```
POST /api/auth/sign-up
```

### Headers
```
Content-Type: application/json
```

### Request Body

#### For COACH Role:
```json
{
  "fullName": "John Doe",
  "email": "coach@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "COACH",
  "coachProfile": {
    "age": 30,
    "gender": "male",
    "qualificationFilePath": "/uploads/qualifications/john-doe-cv.pdf",
    "certifications": "CPR, NASM",
    "experience": "5 years",
    "specialization": "Strength training",
    "profilePicture": "/uploads/profiles/john.jpg",
    "bio": "Experienced fitness coach"
  }
}
```

#### For TRAINEE Role:
```json
{
  "fullName": "Jane Smith",
  "email": "trainee@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "TRAINEE",
  "traineeProfile": {
    "age": 28,
    "gender": "female",
    "height": 165.5,
    "weight": 60.5,
    "fitnessGoals": "Build muscle, lose fat",
    "medicalConditions": "None",
    "dietaryPreferences": "Vegetarian"
  }
}
```

### Field Requirements

#### Common Fields (All Roles):
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `fullName` | string | Yes | Max 255 chars |
| `email` | string | Yes | Valid email format, max 255 chars |
| `password` | string | Yes | Min 8 chars, must contain: uppercase, lowercase, number |
| `confirmPassword` | string | Yes | Must match `password` |
| `role` | string | Yes | Must be `"COACH"` or `"TRAINEE"` |

#### Optional Common Fields:
- `firstName` (string, max 255)
- `lastName` (string, max 255)

#### COACH Profile Fields:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `coachProfile.age` | number | Yes | 1-120 |
| `coachProfile.gender` | string | Yes | `"male"` or `"female"` |
| `coachProfile.qualificationFilePath` | string | Yes | Max 500 chars (file path) |
| `coachProfile.certifications` | string | No | Optional |
| `coachProfile.experience` | string | No | Optional |
| `coachProfile.specialization` | string | No | Max 255 chars |
| `coachProfile.profilePicture` | string | No | Max 500 chars (file path) |
| `coachProfile.bio` | string | No | Optional |

#### TRAINEE Profile Fields:
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `traineeProfile.age` | number | Yes | 1-120 |
| `traineeProfile.gender` | string | Yes | `"male"` or `"female"` |
| `traineeProfile.height` | number | Yes | 0-300 (cm) |
| `traineeProfile.weight` | number | Yes | 0-500 (kg) |
| `traineeProfile.fitnessGoals` | string | Yes | Required |
| `traineeProfile.medicalConditions` | string | No | Optional |
| `traineeProfile.dietaryPreferences` | string | No | Optional |

### Success Response (201 Created)
```json
{
  "status": 201,
  "messageEn": "User registered successfully. Please check your email to verify your account.",
  "messageAr": "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك.",
  "data": {
    "id": "uuid-string",
    "fullName": "John Doe",
    "email": "coach@example.com",
    "role": "COACH",
    "isEmailVerified": false
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "status": 400,
  "message": [
    "Password must be at least 8 characters",
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    "Coach profile is required for COACH sign-up"
  ]
}
```

#### 400 Bad Request - Password Mismatch
```json
{
  "status": 400,
  "messageEn": "Password and confirm password do not match",
  "messageAr": "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
  "message": ["Password and confirm password do not match"]
}
```

#### 409 Conflict - Email Already Registered
```json
{
  "status": 409,
  "messageEn": "Email already registered",
  "messageAr": "البريد الإلكتروني مسجل مسبقاً"
}
```

---

## 2. Sign In

### Endpoint
```
POST /api/auth/sign-in
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Field Requirements
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Required (min 1 char) |

### Success Response (200 OK)
```json
{
  "status": 200,
  "messageEn": "Sign in successful",
  "messageAr": "تم تسجيل الدخول بنجاح",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXN0cmluZyIsInJvbGUiOiJDT0FDSCIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2ODQzODIyfQ.signature",
    "user": {
      "id": "uuid-string",
      "fullName": "John Doe",
      "email": "user@example.com",
      "role": "COACH"
    }
  }
}
```

### Error Responses

#### 401 Unauthorized - Invalid Credentials
```json
{
  "status": 401,
  "messageEn": "Invalid credentials",
  "messageAr": "بيانات الدخول غير صحيحة"
}
```

#### 403 Forbidden - Email Not Verified
```json
{
  "status": 403,
  "messageEn": "Email not verified",
  "messageAr": "يرجى تأكيد البريد الإلكتروني"
}
```

#### 403 Forbidden - Account Inactive
```json
{
  "status": 403,
  "messageEn": "Account inactive",
  "messageAr": "الحساب غير نشط"
}
```

---

## 3. Email Verification

### Endpoint
```
GET /api/auth/verify-email?token=<verification-token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | Verification token from email link |

### Success Response (200 OK)
```json
{
  "status": 200,
  "messageEn": "Email verified successfully",
  "messageAr": "تم تأكيد البريد الإلكتروني بنجاح",
  "data": {
    "email": "user@example.com"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "status": 400,
  "messageEn": "Invalid or expired verification token",
  "messageAr": "رمز التحقق غير صالح أو منتهي الصلاحية"
}
```

---

## Token Usage

After successful sign-in, store the `access_token` and include it in all protected API requests:

### Headers for Protected Routes
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Example Request
```javascript
fetch('http://localhost:3000/api/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

---

## Frontend Implementation Examples

### React/TypeScript Example

#### Sign Up Hook
```typescript
interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'COACH' | 'TRAINEE';
  coachProfile?: {
    age: number;
    gender: 'male' | 'female';
    qualificationFilePath: string;
    certifications?: string;
    experience?: string;
    specialization?: string;
    profilePicture?: string;
    bio?: string;
  };
  traineeProfile?: {
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    fitnessGoals: string;
    medicalConditions?: string;
    dietaryPreferences?: string;
  };
}

const signUp = async (data: SignUpData) => {
  const response = await fetch('http://localhost:3000/api/auth/sign-up', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Sign up failed');
  }

  return await response.json();
};
```

#### Sign In Hook
```typescript
interface SignInData {
  email: string;
  password: string;
}

interface SignInResponse {
  status: number;
  messageEn: string;
  messageAr: string;
  data: {
    access_token: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      role: string;
    };
  };
}

const signIn = async (data: SignInData): Promise<SignInResponse> => {
  const response = await fetch('http://localhost:3000/api/auth/sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Sign in failed');
  }

  const result = await response.json();
  
  // Store token in localStorage or secure storage
  localStorage.setItem('access_token', result.data.access_token);
  localStorage.setItem('user', JSON.stringify(result.data.user));
  
  return result;
};
```

#### Email Verification
```typescript
const verifyEmail = async (token: string) => {
  const response = await fetch(
    `http://localhost:3000/api/auth/verify-email?token=${token}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Verification failed');
  }

  return await response.json();
};
```

---

## Password Requirements

- **Minimum length:** 8 characters
- **Must contain:**
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)

**Example valid passwords:**
- `SecurePass123`
- `MyPassword1`
- `Test1234`

**Example invalid passwords:**
- `password` (no uppercase, no number)
- `PASSWORD123` (no lowercase)
- `Password` (no number)
- `Pass123` (too short)

---

## Error Handling Best Practices

1. **Always check response status** before parsing JSON
2. **Display user-friendly messages** using `messageEn` or `messageAr` based on language
3. **Handle validation errors** - they come as an array in `message` field
4. **Store token securely** - Use httpOnly cookies in production (not localStorage)
5. **Handle token expiration** - Implement refresh logic or redirect to sign-in

---

## Rate Limiting

All auth endpoints are rate-limited:
- **Limit:** 10 requests per minute per IP
- **Response:** 429 Too Many Requests if exceeded

---

## Notes

1. **Email Verification:** If `ENABLE_EMAIL_VERIFICATION=false`, users are automatically verified
2. **Token Expiration:** Default is 7 days (604800 seconds), configurable via `JWT_EXPIRES_IN` env var
3. **Base URL:** Update `http://localhost:3000/api` with your production URL
4. **CORS:** Backend has CORS enabled, but ensure frontend origin is whitelisted in production

---

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/api/swagger
```

This provides:
- Interactive API testing
- Request/response schemas
- Try-it-out functionality

---

## Support

For questions or issues, refer to:
- Swagger UI: `http://localhost:3000/api/swagger`
- Backend repository documentation
