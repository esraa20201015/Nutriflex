# Frontend-Backend Connection Guide

## Backend Configuration ✅

The backend is configured to accept frontend connections:

- **CORS:** Enabled and configured
- **Base URL:** `http://localhost:3000/api`
- **Port:** 3000 (configurable via `PORT` env variable)

## Frontend Configuration Required

### 1. API Base URL Configuration

Create an environment configuration file in your frontend project:

#### For React/Vite (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### For React/CRA (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

#### For Angular (environment.ts)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api'
};
```

#### For Vue/Vite (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. API Service/Client Setup

#### Example: Axios Configuration (React/Vue)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### Example: Fetch Configuration
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Request failed');
  }

  return response.json();
};
```

### 3. Vite Proxy Configuration (Optional but Recommended)

If using Vite, you can configure a proxy to avoid CORS issues:

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';

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

Then use `/api` as your base URL (without the full domain):
```typescript
const API_BASE_URL = '/api'; // Vite will proxy to http://localhost:3000/api
```

### 4. Sign Up Example

```typescript
// Sign Up as COACH
const signUpCoach = async (data: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  coachProfile: {
    age: number;
    gender: 'male' | 'female';
    qualificationFilePath: string;
    certifications?: string;
    experience?: string;
    specialization?: string;
  };
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      role: 'COACH',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Sign up failed');
  }

  return response.json();
};

// Sign Up as TRAINEE
const signUpTrainee = async (data: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  traineeProfile: {
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    fitnessGoals: string;
    medicalConditions?: string;
    dietaryPreferences?: string;
  };
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      role: 'TRAINEE',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Sign up failed');
  }

  return response.json();
};
```

### 5. Sign In Example

```typescript
const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.messageEn || 'Sign in failed');
  }

  const result = await response.json();
  
  // Store token and user data
  localStorage.setItem('access_token', result.data.access_token);
  localStorage.setItem('user', JSON.stringify(result.data.user));
  
  return result;
};
```

## Testing the Connection

### 1. Check Backend is Running
```bash
# In backend directory
npm run start:dev

# Should see:
# Application is running on: http://localhost:3000
# Swagger UI is available at: http://localhost:3000/api/swagger
```

### 2. Test API Endpoint
Open browser and visit:
```
http://localhost:3000/api/swagger
```

### 3. Test from Frontend
```typescript
// Simple test
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

## Common Issues & Solutions

### Issue 1: CORS Error
**Error:** `Access to fetch at 'http://localhost:3000/api/auth/sign-in' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:**
- Backend CORS is already configured
- Make sure backend is running
- Check that your frontend origin is in the allowed list
- Use Vite proxy (recommended for development)

### Issue 2: 404 Not Found
**Error:** `404 Not Found` when calling API

**Solution:**
- Check API endpoint includes `/api` prefix
- Verify backend is running on port 3000
- Check endpoint path matches exactly: `/api/auth/sign-in` (not `/auth/sign-in`)

### Issue 3: Network Error
**Error:** `NetworkError when attempting to fetch resource`

**Solution:**
- Backend server is not running
- Wrong port number
- Firewall blocking connection
- Check browser console Network tab

### Issue 4: 401 Unauthorized
**Error:** `401 Unauthorized` on protected routes

**Solution:**
- Token not included in request headers
- Token expired (default: 7 days)
- Token format incorrect: should be `Bearer <token>`

## Environment Variables

### Backend (.env)
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:4200
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=604800
ENABLE_EMAIL_VERIFICATION=true
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
# OR for production:
# VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Production Configuration

### Backend
Update `.env`:
```env
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

### Frontend
Update environment file:
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Quick Checklist

- [ ] Backend is running on `http://localhost:3000`
- [ ] Frontend environment variable is set (`VITE_API_BASE_URL`)
- [ ] API base URL includes `/api` prefix
- [ ] CORS is configured (already done in backend)
- [ ] Token is stored after sign-in
- [ ] Token is included in Authorization header for protected routes

## Support

- **Swagger UI:** `http://localhost:3000/api/swagger` - Interactive API testing
- **API Documentation:** See `FRONTEND_API_DOCUMENTATION.md`
- **Examples:** See `FRONTEND_API_EXAMPLES.json`
