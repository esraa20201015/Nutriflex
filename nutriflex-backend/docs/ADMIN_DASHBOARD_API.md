# Admin Dashboard API Reference

Base URL: **`/api`** (global prefix). All endpoints require **Bearer token** and **ADMIN** role.

---

## 1. Main dashboard statistics

**GET** `/api/dashboard/admin`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Admin dashboard statistics retrieved successfully",
  "messageAr": "تم استرجاع إحصائيات لوحة تحكم المدير بنجاح",
  "data": {
    "totalUsers": 150,
    "totalAdmins": 2,
    "totalCoaches": 10,
    "totalTrainees": 138,
    "activeUsers": 140,
    "inactiveUsers": 5,
    "blockedUsers": 2,
    "pendingUsers": 3,
    "newUsersThisMonth": 12,
    "newUsersToday": 1
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalUsers` | number | Total users in the system |
| `totalAdmins` | number | Users with role ADMIN |
| `totalCoaches` | number | Users with role COACH |
| `totalTrainees` | number | Users with role TRAINEE |
| `activeUsers` | number | Users with status ACTIVE |
| `inactiveUsers` | number | Users with status INACTIVE |
| `blockedUsers` | number | Users with status BLOCKED |
| `pendingUsers` | number | Users not yet email-verified |
| `newUsersThisMonth` | number | Users created this month |
| `newUsersToday` | number | Users created today |

---

## 2. Account status & approval metrics

**GET** `/api/dashboard/admin/accounts-status`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Account status metrics retrieved successfully",
  "messageAr": "تم استرجاع مؤشرات حالة الحسابات بنجاح",
  "data": {
    "pendingCoaches": 1,
    "pendingTrainees": 2,
    "blockedUsers": 2,
    "recentlyApproved": [
      {
        "userId": "uuid",
        "email": "user@example.com",
        "role": "COACH",
        "approvedAt": "2025-02-20T10:00:00.000Z"
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `pendingCoaches` | number | Coaches not yet email-verified |
| `pendingTrainees` | number | Trainees not yet email-verified |
| `blockedUsers` | number | Blocked users count |
| `recentlyApproved` | array | Users verified in the last 7 days (`userId`, `email`, `role`, `approvedAt`) |

---

## 3. Platform activity metrics

**GET** `/api/dashboard/admin/activity`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Platform activity metrics retrieved successfully",
  "messageAr": "تم استرجاع مؤشرات نشاط المنصة بنجاح",
  "data": {
    "activePlans": 45,
    "completedPlans": 20,
    "inactivePlans": 10,
    "avgCompletionRate": 67,
    "traineesWithNoActivity7Days": 5,
    "traineesWithNoActivity30Days": 12
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `activePlans` | number | Nutrition plans with status ACTIVE |
| `completedPlans` | number | Trainee plan statuses with COMPLETED |
| `inactivePlans` | number | Nutrition plans with status ARCHIVED |
| `avgCompletionRate` | number | Average completion percentage (0–100) |
| `traineesWithNoActivity7Days` | number | Trainees with no health/body/plan activity in last 7 days |
| `traineesWithNoActivity30Days` | number | Same for last 30 days |

---

## 4. System health alerts

**GET** `/api/dashboard/admin/alerts`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "System health alerts retrieved successfully",
  "messageAr": "تم استرجاع تنبيهات حالة النظام بنجاح",
  "data": {
    "alerts": [
      { "type": "LOW_ACTIVITY", "count": 5 },
      { "type": "INACTIVE_COACH", "count": 0 }
    ]
  }
}
```

| Alert type | Description |
|------------|-------------|
| `LOW_ACTIVITY` | Trainees with no activity in last 7 days |
| `INACTIVE_COACH` | Coaches with no active trainees (placeholder, currently 0) |

---

## Frontend usage summary

- **Auth:** Send `Authorization: Bearer <access-token>` and ensure user has role `ADMIN`.
- **Response shape:** Every response is `{ status, messageEn, messageAr, data }`. Use `response.data` for the payload.
- **Plans count:** Not in the main dashboard endpoint; use **activity** (`activePlans`, `completedPlans`, `inactivePlans`) for plan-related KPIs.
- **Recent users / users growth:** Not provided by these endpoints; use the **Users** list API (e.g. paginated `/api/users`) if you need a “recent users” table or growth chart.
