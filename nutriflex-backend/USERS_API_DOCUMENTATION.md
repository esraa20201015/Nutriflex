# Users API Documentation

This document provides comprehensive API documentation for the Users endpoints. **All endpoints require ADMIN role authentication.**

## Base URL
```
http://localhost:3000/api/users
```

## Authentication
All endpoints require:
- **Bearer Token** in the `Authorization` header
- **Role**: `ADMIN` only

```typescript
headers: {
  'Authorization': 'Bearer <your-jwt-token>',
  'Content-Type': 'application/json'
}
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/users` | Create a new user | ✅ ADMIN |
| `GET` | `/api/users` | Get all users (paginated) | ✅ ADMIN |
| `GET` | `/api/users/search` | Search users | ✅ ADMIN |
| `GET` | `/api/users/:id` | Get user by ID | ✅ ADMIN |
| `PUT` | `/api/users/:id` | Update user | ✅ ADMIN |
| `PUT` | `/api/users/:id/toggle-status` | Toggle user status (ACTIVE/INACTIVE) | ✅ ADMIN |
| `DELETE` | `/api/users/:id` | Delete user | ✅ ADMIN |

---

## 1. Create User

**Endpoint:** `POST /api/users`

**Description:** Create a new user account. Only admins can create users.

### Request Body

```typescript
{
  fullName: string;        // Required, max 255 chars
  email: string;           // Required, valid email, max 255 chars
  password: string;        // Required, min 8 chars
  roleId: string;         // Required, UUID of the role
  isEmailVerified?: boolean;  // Optional, default: false
  status?: UserStatus;     // Optional, enum: ACTIVE | INACTIVE | SUSPENDED, default: ACTIVE
  createdBy?: string | null; // Optional, UUID of admin creating the user
}
```

### Example Request

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "roleId": "550e8400-e29b-41d4-a716-446655440000",
  "isEmailVerified": false,
  "status": "ACTIVE",
  "createdBy": "admin-user-id"
}
```

### Success Response (201)

```json
{
  "status": 201,
  "messageEn": "User created successfully",
  "messageAr": "تم إنشاء المستخدم بنجاح",
  "data": {
    "id": "user-uuid",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": false,
    "status": "ACTIVE",
    "role": {
      "id": "role-uuid",
      "name": "TRAINEE",
      "description": "Trainee role"
    },
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation error (missing/invalid fields)
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role
- **409 Conflict**: Email already exists

---

## 2. Get All Users

**Endpoint:** `GET /api/users`

**Description:** Retrieve a paginated list of all users.

### Query Parameters

```typescript
{
  skip?: number;      // Optional, default: 0 (offset)
  take?: number;     // Optional, default: 10 (limit)
  status?: UserStatus; // Optional, filter by status: ACTIVE | INACTIVE | SUSPENDED
}
```

### Example Request

```bash
GET /api/users?skip=0&take=20&status=ACTIVE
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "Users retrieved successfully",
  "messageAr": "تم جلب المستخدمين بنجاح",
  "data": {
    "items": [
      {
        "id": "user-uuid-1",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "isEmailVerified": true,
        "status": "ACTIVE",
        "role": {
          "id": "role-uuid",
          "name": "TRAINEE",
          "description": "Trainee role"
        },
        "lastLoginAt": "2026-02-03T10:00:00.000Z",
        "createdAt": "2026-01-01T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:00:00.000Z"
      }
    ],
    "total": 50,
    "skip": 0,
    "take": 20
  }
}
```

### Error Responses

- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role

---

## 3. Search Users

**Endpoint:** `GET /api/users/search`

**Description:** Search users by keyword (name or email) and optionally filter by status.

### Query Parameters

```typescript
{
  search?: string;        // Optional, search keyword (searches in fullName and email)
  status?: UserStatus;    // Optional, filter by status
  skip?: number;         // Optional, default: 0
  take?: number;         // Optional, default: 10
}
```

### Example Request

```bash
GET /api/users/search?search=john&status=ACTIVE&skip=0&take=10
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "Users found successfully",
  "messageAr": "تم العثور على المستخدمين بنجاح",
  "data": {
    "items": [
      {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "isEmailVerified": true,
        "status": "ACTIVE",
        "role": {
          "id": "role-uuid",
          "name": "TRAINEE"
        }
      }
    ],
    "total": 5,
    "skip": 0,
    "take": 10
  }
}
```

---

## 4. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Description:** Retrieve a specific user by their UUID.

### Path Parameters

- `id` (string, UUID): User ID

### Example Request

```bash
GET /api/users/550e8400-e29b-41d4-a716-446655440000
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "User retrieved successfully",
  "messageAr": "تم جلب المستخدم بنجاح",
  "data": {
    "id": "user-uuid",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "isEmailVerified": true,
    "status": "ACTIVE",
    "role": {
      "id": "role-uuid",
      "name": "TRAINEE",
      "description": "Trainee role"
    },
    "lastLoginAt": "2026-02-03T10:00:00.000Z",
    "createdAt": "2026-01-01T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z",
    "createdBy": "admin-uuid",
    "updatedBy": "admin-uuid"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid UUID format
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role
- **404 Not Found**: User not found

---

## 5. Update User

**Endpoint:** `PUT /api/users/:id`

**Description:** Update user information. All fields are optional.

### Path Parameters

- `id` (string, UUID): User ID

### Request Body

```typescript
{
  fullName?: string;         // Optional, max 255 chars
  email?: string;            // Optional, valid email, max 255 chars
  password?: string;          // Optional, min 8 chars (will be hashed)
  roleId?: string;            // Optional, UUID of the role
  isEmailVerified?: boolean;  // Optional
  status?: UserStatus;        // Optional, enum: ACTIVE | INACTIVE | SUSPENDED
  updatedBy?: string | null;  // Optional, UUID of admin updating the user
}
```

### Example Request

```json
{
  "fullName": "Jane Doe",
  "email": "jane.doe@example.com",
  "status": "ACTIVE",
  "isEmailVerified": true,
  "updatedBy": "admin-user-id"
}
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "User updated successfully",
  "messageAr": "تم تحديث المستخدم بنجاح",
  "data": {
    "id": "user-uuid",
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "isEmailVerified": true,
    "status": "ACTIVE",
    "role": {
      "id": "role-uuid",
      "name": "TRAINEE"
    },
    "updatedAt": "2026-02-03T13:00:00.000Z",
    "updatedBy": "admin-uuid"
  }
}
```

### Error Responses

- **400 Bad Request**: Validation error or invalid UUID
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role
- **404 Not Found**: User not found
- **409 Conflict**: Email already exists (if updating email)

---

## 6. Toggle User Status

**Endpoint:** `PUT /api/users/:id/toggle-status`

**Description:** Toggle user status between ACTIVE and INACTIVE. Useful for quickly enabling/disabling user accounts.

### Path Parameters

- `id` (string, UUID): User ID

### Example Request

```bash
PUT /api/users/550e8400-e29b-41d4-a716-446655440000/toggle-status
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "User status updated successfully",
  "messageAr": "تم تحديث حالة المستخدم بنجاح",
  "data": {
    "id": "user-uuid",
    "status": "INACTIVE",  // Toggled from ACTIVE to INACTIVE
    "updatedAt": "2026-02-03T13:00:00.000Z"
  }
}
```

### Error Responses

- **400 Bad Request**: Invalid UUID format
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role
- **404 Not Found**: User not found

---

## 7. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Description:** Permanently delete a user from the system. **Warning:** This is a hard delete operation.

### Path Parameters

- `id` (string, UUID): User ID

### Example Request

```bash
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
```

### Success Response (200)

```json
{
  "status": 200,
  "messageEn": "User deleted successfully",
  "messageAr": "تم حذف المستخدم بنجاح",
  "data": null
}
```

### Error Responses

- **400 Bad Request**: Invalid UUID format
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: User doesn't have ADMIN role
- **404 Not Found**: User not found

---

## User Status Enum

```typescript
enum UserStatus {
  ACTIVE = 'ACTIVE',           // User can log in and use the system
  INACTIVE = 'INACTIVE',       // User account is disabled
  SUSPENDED = 'SUSPENDED'      // User account is temporarily suspended
}
```

---

## Frontend Integration Examples

### TypeScript/React Example

```typescript
// API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get auth token from storage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Users API Service
export const usersApi = {
  // Get all users
  getAllUsers: async (params?: { skip?: number; take?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to fetch users');
    }
    
    return response.json();
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to fetch user');
    }
    
    return response.json();
  },

  // Create user
  createUser: async (userData: {
    fullName: string;
    email: string;
    password: string;
    roleId: string;
    isEmailVerified?: boolean;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to create user');
    }
    
    return response.json();
  },

  // Update user
  updateUser: async (id: string, userData: {
    fullName?: string;
    email?: string;
    password?: string;
    roleId?: string;
    isEmailVerified?: boolean;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to update user');
    }
    
    return response.json();
  },

  // Toggle user status
  toggleUserStatus: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to toggle user status');
    }
    
    return response.json();
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to delete user');
    }
    
    return response.json();
  },

  // Search users
  searchUsers: async (params: {
    search?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    
    const response = await fetch(`${API_BASE_URL}/users/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.messageEn || 'Failed to search users');
    }
    
    return response.json();
  },
};
```

### React Component Example

```typescript
import { useState, useEffect } from 'react';
import { usersApi } from './services/usersApi';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ skip: 0, take: 10 });

  useEffect(() => {
    loadUsers();
  }, [pagination]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAllUsers(pagination);
      setUsers(response.data.items);
    } catch (error) {
      console.error('Error loading users:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await usersApi.toggleUserStatus(userId);
      loadUsers(); // Reload list
    } catch (error) {
      console.error('Error toggling status:', error);
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Users Management</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role?.name}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => handleToggleStatus(user.id)}>
                  Toggle Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "details": "Additional error details"
}
```

Common error codes:
- **400**: Bad Request (validation errors, invalid data)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (user doesn't have ADMIN role)
- **404**: Not Found (user doesn't exist)
- **409**: Conflict (email already exists)
- **500**: Internal Server Error

---

## Notes

1. **Authentication Required**: All endpoints require a valid JWT token with ADMIN role.
2. **Password Handling**: Passwords are never returned in responses. When updating, if password is provided, it will be hashed automatically.
3. **Email Uniqueness**: Email addresses must be unique across all users.
4. **Role Assignment**: Every user must have exactly one role (roleId is required when creating).
5. **Status Values**: Use `ACTIVE`, `INACTIVE`, or `SUSPENDED` for status fields.
6. **Pagination**: Default pagination is `skip=0` and `take=10`. Adjust as needed for your UI.
7. **Search**: The search endpoint searches both `fullName` and `email` fields.

---

## Swagger Documentation

For interactive API testing, visit:
```
http://localhost:3000/api/swagger
```

Look for the **"User"** tag to see all available endpoints with request/response schemas.
