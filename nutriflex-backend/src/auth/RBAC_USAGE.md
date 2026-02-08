# Role-Based Access Control (RBAC) Usage Guide

## Overview

This project implements role-based access control with three roles:
- **ADMIN** - Super-role with access to everything
- **COACH** - Access to Coach-specific pages and features
- **TRAINEE** - Access to Trainee-specific pages and features

## Access Control Rules

| Role     | Admin Pages | Coach Pages | Trainee Pages |
|----------|-------------|-------------|---------------|
| ADMIN    | ✅ Full     | ✅ View/Manage | ✅ View/Manage |
| COACH    | ❌          | ✅ Own Scope   | ❌            |
| TRAINEE  | ❌          | ❌            | ✅ Own Scope   |

**Key Rule**: ADMIN is a super-role and can access ALL routes, regardless of `@Roles()` decorator.

## Usage

### 1. Import Required Decorators and Guards

```typescript
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
```

### 2. Apply to Controller (Class Level)

```typescript
@Controller('coaches')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH') // Admin or Coach can access
export class CoachesController {
  // All routes in this controller require ADMIN or COACH role
}
```

### 3. Apply to Individual Routes (Method Level)

```typescript
@Controller('trainees')
@UseGuards(RolesGuard)
export class TraineesController {
  
  @Get()
  @Roles('ADMIN', 'TRAINEE') // Admin or Trainee can list trainees
  async findAll() {
    // ...
  }

  @Post()
  @Roles('ADMIN') // Only Admin can create trainees
  async create() {
    // ...
  }
}
```

### 4. Admin-Only Routes

```typescript
@Controller('admin')
@UseGuards(RolesGuard)
@Roles('ADMIN') // Only Admin
export class AdminController {
  // Admin-only routes
}
```

### 5. Coach-Only Routes

```typescript
@Controller('coach-dashboard')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH') // Admin can also access for supervision
export class CoachDashboardController {
  // Coach routes (Admin can access too)
}
```

### 6. Trainee-Only Routes

```typescript
@Controller('trainee-dashboard')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'TRAINEE') // Admin can also access for supervision
export class TraineeDashboardController {
  // Trainee routes (Admin can access too)
}
```

## Important Notes

1. **DualJwtGuard is Global**: The `DualJwtGuard` is registered globally in `main.ts`, so all routes are protected by default unless marked with `@Public()`.

2. **RolesGuard Must Be Applied Explicitly**: `RolesGuard` is NOT global. You must use `@UseGuards(RolesGuard)` on controllers or routes where you want role-based access control.

3. **Order Matters**: Guards execute in order. `DualJwtGuard` (global) runs first to authenticate, then `RolesGuard` checks roles.

4. **Admin Always Has Access**: Even if a route is marked `@Roles('COACH')`, ADMIN can still access it because ADMIN is a super-role.

5. **No Roles Decorator**: If `@Roles()` is not specified, `RolesGuard` allows access (no role restriction). Use `@Roles()` to restrict access.

## Examples

### Example 1: Admin User Management (Admin Only)

```typescript
@Controller('users')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class UsersController {
  // Only Admin can manage users
}
```

### Example 2: Coach Dashboard (Coach + Admin)

```typescript
@Controller('coach/plans')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'COACH')
export class CoachPlansController {
  // Coach can manage their plans
  // Admin can view/manage for supervision
}
```

### Example 3: Trainee Progress (Trainee + Admin)

```typescript
@Controller('trainee/progress')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'TRAINEE')
export class TraineeProgressController {
  // Trainee can view their progress
  // Admin can view for supervision
}
```

### Example 4: Mixed Access Levels

```typescript
@Controller('reports')
@UseGuards(RolesGuard)
export class ReportsController {
  
  @Get('system')
  @Roles('ADMIN') // Only Admin
  async getSystemReports() {
    // System-wide reports
  }

  @Get('coach')
  @Roles('ADMIN', 'COACH') // Admin or Coach
  async getCoachReports() {
    // Coach-specific reports
  }

  @Get('trainee')
  @Roles('ADMIN', 'TRAINEE') // Admin or Trainee
  async getTraineeReports() {
    // Trainee-specific reports
  }
}
```

## Accessing User Role in Controllers

```typescript
import { Request } from 'express';
import { RequestUser } from '../auth/types/request-user.interface';

@Controller('example')
export class ExampleController {
  @Get()
  async example(@Req() req: Request) {
    const user = req.user as RequestUser;
    const userRole = user?.role; // 'ADMIN', 'COACH', or 'TRAINEE'
    
    // Use role for conditional logic
    if (userRole === 'ADMIN') {
      // Admin-specific logic
    }
  }
}
```

## Error Responses

When a user tries to access a route without the required role:

```json
{
  "status": 403,
  "messageEn": "Insufficient permissions. Required role: ADMIN or COACH",
  "messageAr": "صلاحيات غير كافية. الدور المطلوب: ADMIN أو COACH"
}
```

## Testing

To test role-based access:

1. Sign in as different roles (ADMIN, COACH, TRAINEE)
2. Try accessing routes with different role requirements
3. Verify ADMIN can access everything
4. Verify COACH/TRAINEE are restricted to their allowed routes
