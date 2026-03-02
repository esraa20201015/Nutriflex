# Coach Dashboard API Reference

Base URL: **`/api`** (global prefix). All endpoints require **Bearer token** and **COACH** role. Data is scoped to the authenticated coach (using `req.user.id` as `coach_id`).

---

## 1. Coach dashboard statistics

**GET** `/api/dashboard/coach`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Coach dashboard statistics retrieved successfully",
  "messageAr": "تم استرجاع إحصائيات لوحة تحكم المدرب بنجاح",
  "data": {
    "assignedTrainees": 12,
    "activeTrainees": 10,
    "inactiveTrainees": 2,
    "plansCreated": 15,
    "completedPlans": 5,
    "alerts": [
      { "traineeId": "uuid", "reason": "No activity in 7 days" }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `assignedTrainees` | number | Total trainees linked to this coach |
| `activeTrainees` | number | Trainees with ACTIVE coach-trainee status |
| `inactiveTrainees` | number | assignedTrainees − activeTrainees |
| `plansCreated` | number | Nutrition plans created by this coach |
| `completedPlans` | number | Completed plan statuses for this coach’s trainees |
| `alerts` | array | Trainees with no activity in last 7 days (`traineeId`, `reason`) |

---

## 2. Coach dashboard overview

**GET** `/api/dashboard/coach/overview`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Coach dashboard overview retrieved successfully",
  "messageAr": "تم استرجاع نظرة عامة على لوحة تحكم المدرب بنجاح",
  "data": {
    "assignedTrainees": 12,
    "activeTrainees": 10,
    "inactiveTrainees": 2,
    "plansCreated": 15,
    "activePlans": 8,
    "completedPlans": 5
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `assignedTrainees` | number | Total trainees assigned to this coach |
| `activeTrainees` | number | Trainees with ACTIVE status |
| `inactiveTrainees` | number | assignedTrainees − activeTrainees |
| `plansCreated` | number | All nutrition plans by this coach |
| `activePlans` | number | Plans with status ACTIVE |
| `completedPlans` | number | Completed plan statuses for this coach’s trainees |

---

## 3. Trainee progress summary

**GET** `/api/dashboard/coach/trainees-progress`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Trainee progress retrieved successfully",
  "messageAr": "تم استرجاع تقدم المتدربين بنجاح",
  "data": {
    "trainees": [
      {
        "traineeId": "uuid",
        "name": "Trainee Full Name",
        "currentWeight": 72.5,
        "weightChange30Days": -1.2,
        "completionRate": 75,
        "lastActivity": "2025-02-20"
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `trainees` | array | One entry per assigned trainee |
| `trainees[].traineeId` | string | Trainee user ID |
| `trainees[].name` | string | From trainee profile (full_name) |
| `trainees[].currentWeight` | number \| null | Latest weight metric |
| `trainees[].weightChange30Days` | number \| null | currentWeight − weight 30 days ago |
| `trainees[].completionRate` | number | Latest plan completion percentage (0–100) |
| `trainees[].lastActivity` | string \| null | Date string (YYYY-MM-DD) of last activity (health/body/plan) |

---

## 4. Coach alerts

**GET** `/api/dashboard/coach/alerts`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Coach alerts retrieved successfully",
  "messageAr": "تم استرجاع تنبيهات المدرب بنجاح",
  "data": {
    "alerts": [
      { "traineeId": "uuid", "reason": "No activity for 7 days" },
      { "traineeId": "uuid", "reason": "Weight increased unexpectedly" }
    ]
  }
}
```

| Reason | Description |
|--------|-------------|
| `No activity for 7 days` | No health metric, body measurement, or plan status update in last 7 days |
| `Weight increased unexpectedly` | Current weight &gt; weight 30 days ago by more than 2 kg |

---

## 5. Recent activity feed

**GET** `/api/dashboard/coach/recent-activity`

**Response:** `200 OK`

```json
{
  "status": 200,
  "messageEn": "Recent activity retrieved successfully",
  "messageAr": "تم استرجاع النشاط الأخير بنجاح",
  "data": {
    "activities": [
      { "type": "WEIGHT_UPDATE", "trainee": "Name", "value": "-0.5 kg", "date": "2025-02-20" },
      { "type": "PLAN_COMPLETED", "trainee": "Name", "date": "2025-02-19" }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `activities` | array | Up to 30 most recent items (last 30 days), sorted by date descending |
| `activities[].type` | string | `WEIGHT_UPDATE` or `PLAN_COMPLETED` |
| `activities[].trainee` | string | Trainee full name |
| `activities[].value` | string \| undefined | For WEIGHT_UPDATE: change string (e.g. `"+0.5 kg"`, `"-1.0 kg"`) or single value |
| `activities[].date` | string | Date (YYYY-MM-DD) |

---

## Frontend usage summary

- **Auth:** Send `Authorization: Bearer <access-token>`. User must have role **COACH** (backend uses `req.user.id` as `coach_id`).
- **Response shape:** Every response is `{ status, messageEn, messageAr, data }`. Use `response.data` for the payload.
- **Scoping:** All data is for the logged-in coach only (assigned trainees, plans created by coach, etc.).
- **Frontend service:** [CoachService](nutriflex-frontend/src/services/CoachService.ts) already calls these endpoints; types in [@types/api.ts](nutriflex-frontend/src/@types/api.ts) (`CoachDashboardData`, `CoachOverviewData`, `CoachTraineesProgressData`, `CoachAlertsData`, `CoachRecentActivityData`) match the shapes above.
