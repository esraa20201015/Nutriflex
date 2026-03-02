# Trainee Dashboard API Documentation

This document provides complete API documentation for the Trainee Dashboard endpoints that the frontend team needs to implement.

---

## Base URL
All endpoints are prefixed with `/api/dashboard/trainee`

## Authentication & Security
All endpoints require:
- **Header**: `Authorization: Bearer <access_token>`
- **Role**: `TRAINEE` (or `ADMIN` for testing)

### Data Isolation & Security
**Important:** Each trainee can **ONLY** see their own data. The system ensures this through:

1. **JWT Token Authentication**: The user ID is extracted from the cryptographically signed JWT token, which cannot be tampered with.

2. **Automatic User ID Extraction**: The backend automatically extracts the authenticated user's ID from the token and uses it to filter all queries.

3. **No User ID Parameters**: These endpoints **do not accept** any user ID or trainee ID parameters. The user ID is always taken from the authentication token.

4. **Database-Level Filtering**: All database queries are filtered by `trainee_id` using parameterized queries, ensuring:
   - SQL injection prevention
   - Complete data isolation between trainees
   - No possibility of accessing another trainee's data

5. **Role-Based Access Control**: Only users with `TRAINEE` role (or `ADMIN` for testing) can access these endpoints.

**Example:** If Trainee A (ID: `user-123`) calls `/api/dashboard/trainee`, they will **only** see data where `trainee_id = 'user-123'`. Even if they try to manipulate the request, they cannot access Trainee B's data because the user ID comes from the verified JWT token.

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/trainee` | GET | Main dashboard summary data |
| `/api/dashboard/trainee/overview` | GET | Personal overview statistics |
| `/api/dashboard/trainee/progress` | GET | Progress charts data (weight & body measurements) |
| `/api/dashboard/trainee/today` | GET | Today's focus (workout & meals) |
| `/api/dashboard/trainee/status` | GET | Motivation & status (streak, check-in, coach) |

---

## 1. Main Dashboard Summary

**Endpoint:** `GET /api/dashboard/trainee`

**Description:** Returns key metrics for the trainee dashboard overview.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee dashboard data retrieved successfully",
  "messageAr": "تم استرجاع بيانات لوحة تحكم المتدرب بنجاح",
  "data": {
    "currentWeight": 75.5,           // number | null - Latest weight in kg
    "weightChange30Days": -2.3,       // number | null - Weight change over last 30 days (can be negative)
    "activePlan": "Summer Weight Loss Plan",  // string | null - Title of active nutrition plan
    "completionPercentage": 65,      // number | null - Plan completion percentage (0-100)
    "lastMeasurementDate": "2026-02-08T10:30:00.000Z"  // string | null - ISO date of last measurement
  }
}
```

**Data Fields:**
- `currentWeight`: Latest weight measurement (kg). `null` if no weight recorded.
- `weightChange30Days`: Difference between latest weight and weight from 30 days ago. Positive = gained, negative = lost. `null` if insufficient data.
- `activePlan`: Title of the currently active nutrition plan. `null` if no active plan.
- `completionPercentage`: Completion percentage of the active plan (0-100). `null` if no active plan.
- `lastMeasurementDate`: ISO date string of the most recent health metric or body measurement. `null` if no measurements exist.

---

## 2. Personal Overview

**Endpoint:** `GET /api/dashboard/trainee/overview`

**Description:** Returns detailed personal overview statistics.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee overview retrieved successfully",
  "messageAr": "تم استرجاع نظرة عامة للمتدرب بنجاح",
  "data": {
    "currentWeight": 75.5,           // number | null
    "weightChange7Days": -0.5,       // number | null - Weight change over last 7 days
    "weightChange30Days": -2.3,      // number | null - Weight change over last 30 days
    "activePlanName": "Summer Weight Loss Plan",  // string | null
    "planCompletion": 65,            // number - Plan completion (0-100, defaults to 0)
    "daysActiveThisWeek": 5          // number - Number of days with activity in last 7 days
  }
}
```

**Data Fields:**
- `currentWeight`: Latest weight measurement (kg). `null` if no weight recorded.
- `weightChange7Days`: Weight change over the last 7 days. `null` if insufficient data.
- `weightChange30Days`: Weight change over the last 30 days. `null` if insufficient data.
- `activePlanName`: Title of the active nutrition plan. `null` if no active plan.
- `planCompletion`: Completion percentage (0-100). Always a number (defaults to 0 if no plan status exists).
- `daysActiveThisWeek`: Count of unique days with health metrics recorded in the last 7 days (inclusive).

---

## 3. Progress Charts Data

**Endpoint:** `GET /api/dashboard/trainee/progress`

**Description:** Returns historical data for weight and body measurements charts.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee progress data retrieved successfully",
  "messageAr": "تم استرجاع بيانات تقدم المتدرب بنجاح",
  "data": {
    "weightHistory": [
      {
        "date": "2026-01-10",    // string - ISO date (YYYY-MM-DD)
        "value": 78.0             // number - Weight in kg
      },
      {
        "date": "2026-01-15",
        "value": 77.5
      },
      {
        "date": "2026-02-01",
        "value": 75.5
      }
    ],
    "bodyMeasurements": [
      {
        "date": "2026-01-10",    // string - ISO date (YYYY-MM-DD)
        "waist": 85.0,            // number | null - Waist measurement in cm
        "chest": 95.0             // number | null - Chest measurement in cm
      },
      {
        "date": "2026-02-01",
        "waist": 82.0,
        "chest": 96.0
      }
    ]
  }
}
```

**Data Fields:**
- `weightHistory`: Array of weight records from the last 90 days. Each entry has:
  - `date`: ISO date string (YYYY-MM-DD format)
  - `value`: Weight in kilograms
- `bodyMeasurements`: Array of body measurement records. Each entry has:
  - `date`: ISO date string (YYYY-MM-DD format)
  - `waist`: Waist measurement in cm. `null` if not measured.
  - `chest`: Chest measurement in cm. `null` if not measured.

**Note:** Arrays are sorted by date in ascending order. Empty arrays are returned if no data exists.

---

## 4. Today's Focus

**Endpoint:** `GET /api/dashboard/trainee/today`

**Description:** Returns today's workout and meal tracking information.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Today focus data retrieved successfully",
  "messageAr": "تم استرجاع بيانات تركيز اليوم بنجاح",
  "data": {
    "todayWorkout": "Summer Weight Loss Plan",  // string | null - Active plan title (placeholder)
    "todayMeals": 4,                            // number - Total meals planned for today
    "completedMeals": 2,                        // number - Number of completed meals
    "completedWorkout": false                   // boolean - Whether workout is completed
  }
}
```

**Data Fields:**
- `todayWorkout`: Title of the active nutrition plan (used as workout reference). `null` if no active plan.
- `todayMeals`: Total number of meals planned for today (currently returns static value: 4).
- `completedMeals`: Number of meals completed today (currently returns static value: 2).
- `completedWorkout`: Whether today's workout is completed (currently returns static value: false).

**Note:** Meal and workout tracking are currently placeholder values. These will be connected to actual meal/workout tracking entities in future updates.

---

## 5. Motivation & Status

**Endpoint:** `GET /api/dashboard/trainee/status`

**Description:** Returns motivation-related data including streak days, last check-in, and coach information.

**Response:**
```json
{
  "status": 200,
  "messageEn": "Trainee status data retrieved successfully",
  "messageAr": "تم استرجاع بيانات حالة المتدرب بنجاح",
  "data": {
    "streakDays": 12,                    // number - Consecutive days with activity
    "lastCheckIn": "2026-02-08",         // string | null - ISO date (YYYY-MM-DD) of last check-in
    "coachName": "Your Coach"            // string - Coach name (placeholder)
  }
}
```

**Data Fields:**
- `streakDays`: Number of consecutive days (up to today) with at least one health metric recorded. Starts from today and counts backwards. Returns `0` if no activity today.
- `lastCheckIn`: Date of the most recent health metric record (YYYY-MM-DD format). `null` if no metrics exist.
- `coachName`: Name of the assigned coach. Currently returns placeholder "Your Coach". Will be connected to coach-trainee relationship in future updates.

**Streak Calculation:**
- Counts consecutive days backwards from today
- A day is considered "active" if it has at least one health metric
- Streak breaks if a day is missing
- Maximum lookback: 30 days

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

## Frontend Implementation Notes

### 1. **Data Handling**
- Always check for `null` values before displaying data
- Use `messageEn` or `messageAr` based on user's language preference
- Format dates using the user's locale
- Display weight changes with appropriate indicators (↑/↓ or +/-)

### 2. **Charts**
- Use `weightHistory` array for weight trend charts
- Use `bodyMeasurements` array for body measurement charts
- Dates are in ISO format (YYYY-MM-DD) - parse and format as needed
- Handle empty arrays gracefully (show "No data" message)

### 3. **Loading States**
- Show loading indicators while fetching data
- Handle network errors gracefully
- Consider caching dashboard data for better UX

### 4. **Real-time Updates**
- Consider polling these endpoints periodically (e.g., every 5 minutes) if real-time updates are needed
- Or implement WebSocket/SSE if available

### 5. **Null Handling Examples**
```typescript
// Weight display
const weightDisplay = data.currentWeight 
  ? `${data.currentWeight} kg` 
  : 'No weight recorded';

// Weight change indicator
const weightChange = data.weightChange30Days;
if (weightChange === null) {
  // Show "N/A" or "Insufficient data"
} else if (weightChange > 0) {
  // Show positive change (gained weight)
} else {
  // Show negative change (lost weight)
}

// Plan completion
const completion = data.completionPercentage ?? 0;
```

### 6. **Date Formatting**
```typescript
// Parse ISO date
const date = new Date(data.lastMeasurementDate);

// Format for display
const formatted = date.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});
```

---

## Example API Calls

### Using Fetch (JavaScript)
```javascript
const token = 'your-access-token';

// Get main dashboard
const response = await fetch('http://localhost:3000/api/dashboard/trainee', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data);
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

// Get dashboard data
const getDashboard = async () => {
  const response = await api.get('/dashboard/trainee');
  return response.data.data;
};
```

---

## Testing

You can test these endpoints using:
1. **Swagger UI**: `http://localhost:3000/api/swagger` (when backend is running)
2. **Postman**: Import the endpoints and add Bearer token authentication
3. **cURL**: 
```bash
curl -X GET "http://localhost:3000/api/dashboard/trainee" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Related Endpoints

For complete trainee functionality, you may also need:
- **Profile**: `GET /api/profile/me` - Get trainee profile and avatar
- **Nutrition Plans**: `GET /api/nutrition-plans` - Get trainee's nutrition plans
- **Health Metrics**: `GET /api/health-metrics` - Get health metric history
- **Body Measurements**: `GET /api/body-measurements` - Get body measurement history

---

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
