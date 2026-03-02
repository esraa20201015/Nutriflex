# Coach Dashboard API Documentation

This document provides complete API documentation for all Coach Dashboard endpoints that the frontend team needs to call when the dashboard page loads.

---

## Base URL
All endpoints are prefixed with `/api/dashboard/coach`

## Authentication & Security
All endpoints require:
- **Header**: `Authorization: Bearer <access_token>`
- **Role**: `COACH` (or `ADMIN` for testing)

### Data Isolation & Security
**Important:** Each coach can **ONLY** see data for their own trainees. The system ensures this through:

1. **JWT Token Authentication**: The user ID is extracted from the cryptographically signed JWT token.
2. **Automatic User ID Extraction**: The backend automatically extracts the authenticated coach's ID from the token and uses it to filter all queries.
3. **Database-Level Filtering**: All database queries are filtered by `coach_id` using parameterized queries.

---

## APIs to Call on Dashboard Load

When the coach dashboard page loads, you should call these endpoints (can be called in parallel):

| Endpoint | Purpose | When to Use |
|----------|---------|-------------|
| `GET /api/dashboard/coach` | Main dashboard statistics cards | Always load |
| `GET /api/dashboard/coach/overview` | Detailed plan statistics | Optional (if needed) |
| `GET /api/dashboard/coach/trainees-progress` | Trainees progress table/list | Always load |
| `GET /api/dashboard/coach/alerts` | Alerts and attention needed | Always load |
| `GET /api/dashboard/coach/recent-activity` | Recent activity feed | Always load |

---

## 1. Main Dashboard Statistics

**Endpoint:** `GET /api/dashboard/coach`

**Description:** Returns high-level statistics for dashboard cards/widgets.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Coach dashboard statistics retrieved successfully",
  "messageAr": "تم استرجاع إحصائيات لوحة تحكم المدرب بنجاح",
  "data": {
    "assignedTrainees": 12,        // number - Total trainees ever assigned to this coach
    "activeTrainees": 9,            // number - Currently active trainees
    "inactiveTrainees": 3,          // number - Inactive/paused trainees
    "plansCreated": 18,             // number - Total nutrition plans created by this coach
    "completedPlans": 6,            // number - Completed plans for coach's trainees
    "alerts": [                     // array - Basic alerts (trainees needing attention)
      {
        "traineeId": "trainee-uuid",
        "reason": "No activity in 7 days"
      }
    ]
  }
}
```

**Data Fields:**
- `assignedTrainees`: Total number of trainees that have been assigned to this coach (includes active, paused, and completed relationships).
- `activeTrainees`: Number of trainees with active coach-trainee relationships.
- `inactiveTrainees`: Number of inactive/paused trainees (calculated as `assignedTrainees - activeTrainees`).
- `plansCreated`: Total number of nutrition plans created by this coach.
- `completedPlans`: Number of plans that have been completed by trainees assigned to this coach.
- `alerts`: Array of basic alerts for trainees needing attention (no activity in 7 days).

**Use Cases:**
- Display summary cards at the top of the dashboard
- Show trainee count widgets
- Display plan statistics
- Show alert badges/notifications

---

## 2. Dashboard Overview (Detailed Statistics)

**Endpoint:** `GET /api/dashboard/coach/overview`

**Description:** Returns detailed plan statistics for the coach dashboard overview section.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Coach dashboard overview retrieved successfully",
  "messageAr": "تم استرجاع نظرة عامة على لوحة تحكم المدرب بنجاح",
  "data": {
    "assignedTrainees": 12,
    "activeTrainees": 9,
    "inactiveTrainees": 3,
    "plansCreated": 18,             // All plans created by coach
    "activePlans": 7,               // Plans with status = active
    "completedPlans": 6            // Completed plans for coach's trainees
  }
}
```

**Data Fields:**
- `assignedTrainees`: Total assigned trainees.
- `activeTrainees`: Currently active trainees.
- `inactiveTrainees`: Inactive/paused trainees.
- `plansCreated`: Total nutrition plans created by this coach.
- `activePlans`: Number of active nutrition plans (status = `active`).
- `completedPlans`: Number of completed plans for coach's trainees.

**Use Cases:**
- Display detailed statistics section
- Show plan status breakdown
- Display overview widgets

---

## 3. Trainees Progress Summary

**Endpoint:** `GET /api/dashboard/coach/trainees-progress`

**Description:** Returns progress summary for all trainees assigned to the coach. Use this for the "My Trainees" table/list.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee progress retrieved successfully",
  "messageAr": "تم استرجاع تقدم المتدربين بنجاح",
  "data": {
    "trainees": [
      {
        "traineeId": "trainee-uuid-1",
        "name": "Ahmed Ali",                    // string - Trainee full name
        "currentWeight": 82.5,                  // number | null - Latest weight in kg
        "weightChange30Days": -1.8,            // number | null - Weight change over 30 days (can be negative)
        "completionRate": 65,                   // number - Latest plan completion percentage (0-100)
        "lastActivity": "2026-02-08"           // string | null - Last activity date (YYYY-MM-DD)
      },
      {
        "traineeId": "trainee-uuid-2",
        "name": "Sara Mohamed",
        "currentWeight": 68.0,
        "weightChange30Days": 0.0,
        "completionRate": 30,
        "lastActivity": "2026-02-05"
      }
    ]
  }
}
```

**Data Fields:**
- `trainees`: Array of trainee progress objects. Each object contains:
  - `traineeId`: Unique trainee identifier (UUID).
  - `name`: Trainee's full name from profile.
  - `currentWeight`: Latest weight measurement in kg. `null` if no weight recorded.
  - `weightChange30Days`: Weight change over last 30 days (current - 30 days ago). Positive = gained, negative = lost. `null` if insufficient data.
  - `completionRate`: Latest plan completion percentage (0-100). Defaults to 0 if no plan status exists.
  - `lastActivity`: Date of last activity (health metric, body measurement, or plan status update). Format: `YYYY-MM-DD`. `null` if no activity.

**Empty Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee progress retrieved successfully",
  "messageAr": "تم استرجاع تقدم المتدربين بنجاح",
  "data": {
    "trainees": []
  }
}
```

**Use Cases:**
- Display "My Trainees" table/list
- Show trainee progress cards
- Display trainee overview widgets
- Link to individual trainee details

---

## 4. Coach Alerts & Attention Needed

**Endpoint:** `GET /api/dashboard/coach/alerts`

**Description:** Returns alerts for trainees that need attention (no activity, weight issues, etc.).

**Response:**
```json
{
  "status": 200,
  "messageEn": "Coach alerts retrieved successfully",
  "messageAr": "تم استرجاع تنبيهات المدرب بنجاح",
  "data": {
    "alerts": [
      {
        "traineeId": "trainee-uuid-1",
        "reason": "No activity for 7 days"
      },
      {
        "traineeId": "trainee-uuid-2",
        "reason": "Weight increased unexpectedly"
      }
    ]
  }
}
```

**Data Fields:**
- `alerts`: Array of alert objects. Each alert contains:
  - `traineeId`: Trainee identifier (UUID).
  - `reason`: Reason for the alert (string). Possible values:
    - `"No activity for 7 days"` - No health metrics, body measurements, or plan updates in last 7 days
    - `"Weight increased unexpectedly"` - Weight increased by more than 2kg in 30 days (assuming weight loss goal)

**Empty Response:**
```json
{
  "status": 200,
  "messageEn": "Coach alerts retrieved successfully",
  "messageAr": "تم استرجاع تنبيهات المدرب بنجاح",
  "data": {
    "alerts": []
  }
}
```

**Use Cases:**
- Display alerts widget/panel
- Show notification badges
- Highlight trainees needing attention
- Link to trainee details for follow-up

---

## 5. Recent Activity Feed

**Endpoint:** `GET /api/dashboard/coach/recent-activity`

**Description:** Returns recent activity timeline for all trainees assigned to the coach (weight updates, completed plans).

**Response:**
```json
{
  "status": 200,
  "messageEn": "Recent activity retrieved successfully",
  "messageAr": "تم استرجاع النشاط الأخير بنجاح",
  "data": {
    "activities": [
      {
        "type": "WEIGHT_UPDATE",        // string - Activity type
        "trainee": "Ahmed Ali",         // string - Trainee name
        "value": "+0.8 kg",            // string | undefined - Weight change (only for WEIGHT_UPDATE)
        "date": "2026-02-08"            // string - Activity date (YYYY-MM-DD)
      },
      {
        "type": "PLAN_COMPLETED",
        "trainee": "Sara Mohamed",
        "date": "2026-02-05"
      },
      {
        "type": "WEIGHT_UPDATE",
        "trainee": "Ahmed Ali",
        "value": "-1.2 kg",
        "date": "2026-02-01"
      }
    ]
  }
}
```

**Data Fields:**
- `activities`: Array of activity objects, sorted by date descending (most recent first). Limited to 30 most recent activities. Each activity contains:
  - `type`: Activity type (string). Possible values:
    - `"WEIGHT_UPDATE"` - Weight measurement recorded
    - `"PLAN_COMPLETED"` - Nutrition plan completed
  - `trainee`: Trainee's full name (string).
  - `value`: Weight change value (string, e.g., `"+0.8 kg"` or `"-1.2 kg"`). Only present for `WEIGHT_UPDATE` type. For `PLAN_COMPLETED`, this field is omitted.
  - `date`: Activity date in `YYYY-MM-DD` format (string).

**Empty Response:**
```json
{
  "status": 200,
  "messageEn": "Recent activity retrieved successfully",
  "messageAr": "تم استرجاع النشاط الأخير بنجاح",
  "data": {
    "activities": []
  }
}
```

**Use Cases:**
- Display activity timeline/feed
- Show recent updates widget
- Display activity history
- Show trainee engagement

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "messageEn": "User not authenticated",
  "messageAr": "المستخدم غير مصادق عليه"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Frontend Implementation Guide

### 1. **Loading Strategy**

**Option A: Sequential Loading**
```typescript
// Load in order (slower but predictable)
const dashboard = await getDashboard();
const progress = await getTraineesProgress();
const alerts = await getAlerts();
const activity = await getRecentActivity();
```

**Option B: Parallel Loading (Recommended)**
```typescript
// Load all endpoints in parallel (faster)
const [dashboard, progress, alerts, activity] = await Promise.all([
  getDashboard(),
  getTraineesProgress(),
  getAlerts(),
  getRecentActivity()
]);
```

### 2. **Data Handling**

```typescript
// Handle null values
const weightDisplay = trainee.currentWeight 
  ? `${trainee.currentWeight} kg` 
  : 'No weight recorded';

// Weight change indicator
const weightChange = trainee.weightChange30Days;
if (weightChange === null) {
  // Show "N/A" or "Insufficient data"
} else if (weightChange > 0) {
  // Show positive change (gained weight) - might be alert
} else {
  // Show negative change (lost weight) - usually good
}

// Completion rate
const completion = trainee.completionRate; // Always a number (0-100)
const completionColor = completion >= 80 ? 'green' : completion >= 50 ? 'yellow' : 'red';
```

### 3. **Date Formatting**

```typescript
// Format activity dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Example: "2026-02-08" → "Feb 8, 2026"
```

### 4. **Alert Handling**

```typescript
// Display alerts
if (alerts.length > 0) {
  // Show alert badge/notification
  // Group by trainee if needed
  const alertsByTrainee = alerts.reduce((acc, alert) => {
    if (!acc[alert.traineeId]) acc[alert.traineeId] = [];
    acc[alert.traineeId].push(alert.reason);
    return acc;
  }, {});
}
```

### 5. **Activity Feed Display**

```typescript
// Render activity items
activities.forEach(activity => {
  if (activity.type === 'WEIGHT_UPDATE') {
    // Display: "Ahmed Ali updated weight: +0.8 kg on Feb 8, 2026"
  } else if (activity.type === 'PLAN_COMPLETED') {
    // Display: "Sara Mohamed completed a plan on Feb 5, 2026"
  }
});
```

---

## Example API Calls

### Using Fetch (JavaScript)
```javascript
const token = 'your-access-token';

// Get dashboard statistics
const dashboardResponse = await fetch('http://localhost:3000/api/dashboard/coach', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const dashboard = await dashboardResponse.json();

// Get trainees progress
const progressResponse = await fetch('http://localhost:3000/api/dashboard/coach/trainees-progress', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const progress = await progressResponse.json();
```

### Using Axios (TypeScript)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Load all dashboard data in parallel
const loadCoachDashboard = async () => {
  try {
    const [dashboard, progress, alerts, activity] = await Promise.all([
      api.get('/dashboard/coach'),
      api.get('/dashboard/coach/trainees-progress'),
      api.get('/dashboard/coach/alerts'),
      api.get('/dashboard/coach/recent-activity')
    ]);

    return {
      statistics: dashboard.data.data,
      trainees: progress.data.data.trainees,
      alerts: alerts.data.data.alerts,
      activities: activity.data.data.activities
    };
  } catch (error) {
    console.error('Error loading dashboard:', error);
    throw error;
  }
};
```

### React Hook Example
```typescript
import { useState, useEffect } from 'react';

const useCoachDashboard = () => {
  const [data, setData] = useState({
    statistics: null,
    trainees: [],
    alerts: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [dashboard, progress, alerts, activity] = await Promise.all([
          api.get('/dashboard/coach'),
          api.get('/dashboard/coach/trainees-progress'),
          api.get('/dashboard/coach/alerts'),
          api.get('/dashboard/coach/recent-activity')
        ]);

        setData({
          statistics: dashboard.data.data,
          trainees: progress.data.data.trainees,
          alerts: alerts.data.data.alerts,
          activities: activity.data.data.activities
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
};
```

---

## TypeScript Interfaces

```typescript
interface CoachDashboardStatistics {
  assignedTrainees: number;
  activeTrainees: number;
  inactiveTrainees: number;
  plansCreated: number;
  completedPlans: number;
  alerts: Array<{
    traineeId: string;
    reason: string;
  }>;
}

interface CoachDashboardOverview {
  assignedTrainees: number;
  activeTrainees: number;
  inactiveTrainees: number;
  plansCreated: number;
  activePlans: number;
  completedPlans: number;
}

interface TraineeProgress {
  traineeId: string;
  name: string;
  currentWeight: number | null;
  weightChange30Days: number | null;
  completionRate: number;
  lastActivity: string | null;
}

interface Alert {
  traineeId: string;
  reason: string;
}

interface Activity {
  type: 'WEIGHT_UPDATE' | 'PLAN_COMPLETED';
  trainee: string;
  value?: string; // Only for WEIGHT_UPDATE
  date: string; // YYYY-MM-DD
}

interface DashboardResponse {
  status: number;
  messageEn: string;
  messageAr: string;
  data: CoachDashboardStatistics | {
    trainees: TraineeProgress[];
  } | {
    alerts: Alert[];
  } | {
    activities: Activity[];
  };
}
```

---

## Dashboard Layout Recommendations

### Suggested UI Structure:

```
┌─────────────────────────────────────────────────┐
│  Coach Dashboard                                │
├─────────────────────────────────────────────────┤
│  [Statistics Cards Row]                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 12   │ │  9   │ │  18  │ │  6   │         │
│  │Trainees│Active │ Plans │Completed│         │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
├─────────────────────────────────────────────────┤
│  [Alerts Section]                              │
│  ⚠️ 2 Alerts                                   │
│  • Ahmed Ali - No activity for 7 days          │
│  • Sara Mohamed - Weight increased unexpectedly│
├─────────────────────────────────────────────────┤
│  [My Trainees Table]                            │
│  Name      │ Weight │ Change │ Progress │ Last│
│  Ahmed Ali │ 82.5kg │ -1.8kg │   65%    │ 2/8│
│  Sara M.   │ 68.0kg │  0.0kg │   30%    │ 2/5│
├─────────────────────────────────────────────────┤
│  [Recent Activity Feed]                        │
│  • Feb 8 - Ahmed Ali updated weight: +0.8 kg  │
│  • Feb 5 - Sara Mohamed completed a plan       │
│  • Feb 1 - Ahmed Ali updated weight: -1.2 kg  │
└─────────────────────────────────────────────────┘
```

---

## Testing

You can test these endpoints using:
1. **Swagger UI**: `http://localhost:3000/api/swagger` (when backend is running)
2. **Postman**: Import the endpoints and add Bearer token authentication
3. **cURL**: 
```bash
curl -X GET "http://localhost:3000/api/dashboard/coach" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Performance Tips

1. **Load in Parallel**: Use `Promise.all()` to load all endpoints simultaneously
2. **Cache Data**: Consider caching dashboard data for a few minutes to reduce API calls
3. **Show Loading States**: Display loading indicators while fetching data
4. **Error Handling**: Handle errors gracefully and show user-friendly messages
5. **Refresh Strategy**: Consider auto-refresh every 5-10 minutes or manual refresh button

---

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
