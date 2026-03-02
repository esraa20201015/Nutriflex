# Trainee "My Plans" API Documentation

This document provides complete API documentation for the Trainee "My Plans" endpoints that the frontend team needs to implement.

---

## Base URL
All endpoints are prefixed with `/api/plans/trainee` (or `/api/nutrition-plan/trainee`)

## Authentication & Security
All endpoints require:
- **Header**: `Authorization: Bearer <access_token>`
- **Role**: `TRAINEE` (or `ADMIN` for testing)

### Data Isolation & Security
**Important:** Each trainee can **ONLY** see their own plans. The system ensures this through:

1. **JWT Token Authentication**: The user ID is extracted from the cryptographically signed JWT token.
2. **Automatic User ID Extraction**: The backend automatically extracts the authenticated user's ID from the token and uses it to filter all queries.
3. **No User ID Parameters**: These endpoints **do not accept** any user ID or trainee ID parameters. The user ID is always taken from the authentication token.
4. **Database-Level Filtering**: All database queries are filtered by `trainee_id` using parameterized queries.

---

## Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/plans/trainee` | GET | Get all nutrition plans for the authenticated trainee |
| `/api/plans/trainee/:id` | GET | Get a specific nutrition plan with details and meals |
| `/api/plans/trainee/:id/meals` | GET | Get all meals for a specific nutrition plan |
| `/api/plans/trainee/:id/status` | GET | Get completion status for a specific plan |

**Note:** These endpoints need to be implemented in the backend. Currently, the nutrition plan endpoints are restricted to ADMIN and COACH roles only.

---

## 1. Get All My Plans

**Endpoint:** `GET /api/plans/trainee`

**Description:** Returns all nutrition plans assigned to the authenticated trainee, including their completion status.

**Query Parameters:**
- `status` (optional): Filter by plan status (`draft`, `active`, `archived`)
- `skip` (optional): Number of records to skip (for pagination)
- `take` (optional): Number of records to return (for pagination)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plans retrieved successfully",
  "messageAr": "تم استرجاع خطط التغذية بنجاح",
  "data": [
    {
      "id": "uuid",
      "title": "Summer Weight Loss Plan",
      "description": "A comprehensive 12-week weight loss program",
      "daily_calories": 1800,
      "start_date": "2026-01-01T00:00:00.000Z",
      "end_date": "2026-03-31T00:00:00.000Z",
      "status": "active",
      "coach": {
        "id": "coach-uuid",
        "fullName": "Dr. Sarah Johnson",
        "email": "sarah.johnson@example.com"
      },
      "completionStatus": {
        "completion_percentage": 65,
        "status": "in_progress",
        "last_updated": "2026-02-08T10:30:00.000Z"
      },
      "created_date": "2025-12-15T08:00:00.000Z",
      "updated_date": "2026-02-01T09:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "title": "Muscle Building Plan",
      "description": "High protein nutrition plan for muscle gain",
      "daily_calories": 2500,
      "start_date": "2025-11-01T00:00:00.000Z",
      "end_date": "2025-12-31T00:00:00.000Z",
      "status": "archived",
      "coach": {
        "id": "coach-uuid",
        "fullName": "Dr. Sarah Johnson",
        "email": "sarah.johnson@example.com"
      },
      "completionStatus": {
        "completion_percentage": 100,
        "status": "completed",
        "last_updated": "2025-12-31T23:59:59.000Z"
      },
      "created_date": "2025-10-20T08:00:00.000Z",
      "updated_date": "2025-12-31T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "count": 2,
    "skip": 0,
    "take": 10
  }
}
```

**Data Fields:**
- `id`: Unique plan identifier (UUID)
- `title`: Plan title
- `description`: Plan description (can be null)
- `daily_calories`: Target daily calories (can be null)
- `start_date`: Plan start date (ISO timestamp)
- `end_date`: Plan end date (ISO timestamp, can be null)
- `status`: Plan status (`draft`, `active`, `archived`)
- `coach`: Coach information object with `id`, `fullName`, and `email`
- `completionStatus`: Trainee's progress on this plan:
  - `completion_percentage`: 0-100
  - `status`: `not_started`, `in_progress`, or `completed`
  - `last_updated`: Last update timestamp (ISO, can be null)
- `created_date`: When the plan was created (ISO timestamp)
- `updated_date`: When the plan was last updated (ISO timestamp)

**Empty Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plans retrieved successfully",
  "messageAr": "تم استرجاع خطط التغذية بنجاح",
  "data": [],
  "meta": {
    "total": 0,
    "count": 0,
    "skip": 0,
    "take": 10
  }
}
```

---

## 2. Get Plan Details

**Endpoint:** `GET /api/plans/trainee/:id`

**Description:** Returns detailed information about a specific nutrition plan, including all meals.

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plan retrieved successfully",
  "messageAr": "تم استرجاع خطة التغذية بنجاح",
  "data": {
    "id": "uuid",
    "title": "Summer Weight Loss Plan",
    "description": "A comprehensive 12-week weight loss program focusing on balanced nutrition and sustainable habits.",
    "daily_calories": 1800,
    "start_date": "2026-01-01T00:00:00.000Z",
    "end_date": "2026-03-31T00:00:00.000Z",
    "status": "active",
    "coach": {
      "id": "coach-uuid",
      "fullName": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com"
    },
    "meals": [
      {
        "id": "meal-uuid-1",
        "name": "Oatmeal with Berries",
        "meal_type": "breakfast",
        "calories": 350,
        "protein": 12.5,
        "carbs": 55.0,
        "fats": 8.0,
        "instructions": "Cook 1 cup oats, add 1/2 cup mixed berries, 1 tbsp almond butter",
        "order_index": 1
      },
      {
        "id": "meal-uuid-2",
        "name": "Grilled Chicken Salad",
        "meal_type": "lunch",
        "calories": 450,
        "protein": 35.0,
        "carbs": 25.0,
        "fats": 20.0,
        "instructions": "Grill 150g chicken breast, serve over mixed greens with olive oil dressing",
        "order_index": 2
      },
      {
        "id": "meal-uuid-3",
        "name": "Salmon with Vegetables",
        "meal_type": "dinner",
        "calories": 500,
        "protein": 40.0,
        "carbs": 30.0,
        "fats": 22.0,
        "instructions": "Bake 200g salmon fillet, serve with roasted vegetables",
        "order_index": 3
      },
      {
        "id": "meal-uuid-4",
        "name": "Greek Yogurt with Nuts",
        "meal_type": "snack",
        "calories": 200,
        "protein": 15.0,
        "carbs": 20.0,
        "fats": 8.0,
        "instructions": "Mix 200g Greek yogurt with 30g mixed nuts",
        "order_index": 4
      }
    ],
    "completionStatus": {
      "completion_percentage": 65,
      "status": "in_progress",
      "last_updated": "2026-02-08T10:30:00.000Z"
    },
    "created_date": "2025-12-15T08:00:00.000Z",
    "updated_date": "2026-02-01T09:00:00.000Z"
  }
}
```

**Meal Fields:**
- `id`: Unique meal identifier (UUID)
- `name`: Meal name
- `meal_type`: Type of meal (`breakfast`, `lunch`, `dinner`, `snack`)
- `calories`: Calories per serving (can be null)
- `protein`: Protein in grams (can be null)
- `carbs`: Carbohydrates in grams (can be null)
- `fats`: Fats in grams (can be null)
- `instructions`: Preparation instructions (can be null)
- `order_index`: Display order (for sorting)

**Error Response (Plan Not Found or Not Assigned to Trainee):**
```json
{
  "status": 404,
  "messageEn": "Nutrition plan not found",
  "messageAr": "خطة التغذية غير موجودة",
  "data": null
}
```

---

## 3. Get Plan Meals

**Endpoint:** `GET /api/plans/trainee/:id/meals`

**Description:** Returns all meals for a specific nutrition plan, grouped by meal type.

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Meals retrieved successfully",
  "messageAr": "تم استرجاع الوجبات بنجاح",
  "data": {
    "planId": "uuid",
    "planTitle": "Summer Weight Loss Plan",
    "meals": [
      {
        "id": "meal-uuid-1",
        "name": "Oatmeal with Berries",
        "meal_type": "breakfast",
        "calories": 350,
        "protein": 12.5,
        "carbs": 55.0,
        "fats": 8.0,
        "instructions": "Cook 1 cup oats, add 1/2 cup mixed berries, 1 tbsp almond butter",
        "order_index": 1
      },
      {
        "id": "meal-uuid-2",
        "name": "Grilled Chicken Salad",
        "meal_type": "lunch",
        "calories": 450,
        "protein": 35.0,
        "carbs": 25.0,
        "fats": 20.0,
        "instructions": "Grill 150g chicken breast, serve over mixed greens with olive oil dressing",
        "order_index": 2
      }
    ],
    "groupedByType": {
      "breakfast": [
        {
          "id": "meal-uuid-1",
          "name": "Oatmeal with Berries",
          "meal_type": "breakfast",
          "calories": 350,
          "protein": 12.5,
          "carbs": 55.0,
          "fats": 8.0,
          "instructions": "Cook 1 cup oats, add 1/2 cup mixed berries, 1 tbsp almond butter",
          "order_index": 1
        }
      ],
      "lunch": [
        {
          "id": "meal-uuid-2",
          "name": "Grilled Chicken Salad",
          "meal_type": "lunch",
          "calories": 450,
          "protein": 35.0,
          "carbs": 25.0,
          "fats": 20.0,
          "instructions": "Grill 150g chicken breast, serve over mixed greens with olive oil dressing",
          "order_index": 2
        }
      ],
      "dinner": [],
      "snack": []
    }
  }
}
```

---

## 4. Get Plan Completion Status

**Endpoint:** `GET /api/plans/trainee/:id/status`

**Description:** Returns the completion status and progress for a specific nutrition plan.

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Plan status retrieved successfully",
  "messageAr": "تم استرجاع حالة الخطة بنجاح",
  "data": {
    "planId": "uuid",
    "planTitle": "Summer Weight Loss Plan",
    "completion_percentage": 65,
    "status": "in_progress",
    "last_updated": "2026-02-08T10:30:00.000Z",
    "daysRemaining": 52,
    "daysElapsed": 38,
    "totalDays": 90
  }
}
```

**Data Fields:**
- `planId`: Plan identifier
- `planTitle`: Plan title
- `completion_percentage`: Completion percentage (0-100)
- `status`: Status (`not_started`, `in_progress`, `completed`)
- `last_updated`: Last update timestamp (ISO, can be null)
- `daysRemaining`: Days remaining until end date (calculated)
- `daysElapsed`: Days since start date (calculated)
- `totalDays`: Total plan duration in days (calculated)

**No Status Record:**
```json
{
  "status": 200,
  "messageEn": "Plan status retrieved successfully",
  "messageAr": "تم استرجاع حالة الخطة بنجاح",
  "data": {
    "planId": "uuid",
    "planTitle": "Summer Weight Loss Plan",
    "completion_percentage": 0,
    "status": "not_started",
    "last_updated": null,
    "daysRemaining": 52,
    "daysElapsed": 38,
    "totalDays": 90
  }
}
```

---

## Error Responses

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

### 404 Not Found
```json
{
  "status": 404,
  "messageEn": "Nutrition plan not found",
  "messageAr": "خطة التغذية غير موجودة",
  "data": null
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
- Display completion percentage with progress bars

### 2. **Plan Status Display**
- `active`: Show as "Active" with green indicator
- `archived`: Show as "Completed" or "Archived" with gray indicator
- `draft`: Usually not shown to trainees (coach-only)

### 3. **Completion Status**
- `not_started`: Show "Not Started" badge
- `in_progress`: Show progress bar with percentage
- `completed`: Show "Completed" badge with checkmark

### 4. **Meal Grouping**
- Group meals by `meal_type` for better UX
- Display in order: breakfast → lunch → dinner → snack
- Use `order_index` for sorting within each meal type

### 5. **Date Calculations**
```typescript
// Calculate days remaining
const today = new Date();
const endDate = new Date(plan.end_date);
const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

// Calculate days elapsed
const startDate = new Date(plan.start_date);
const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

// Calculate total days
const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
```

### 6. **Null Handling Examples**
```typescript
// Description display
const description = plan.description || 'No description available';

// Daily calories display
const caloriesDisplay = plan.daily_calories 
  ? `${plan.daily_calories} kcal/day` 
  : 'Not specified';

// End date display
const endDateDisplay = plan.end_date 
  ? formatDate(plan.end_date) 
  : 'Ongoing';
```

---

## Example API Calls

### Using Fetch (JavaScript)
```javascript
const token = 'your-access-token';

// Get all plans
const response = await fetch('http://localhost:3000/api/plans/trainee', {
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

// Get all plans
const getMyPlans = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await api.get('/plans/trainee', { params });
  return response.data.data;
};

// Get plan details
const getPlanDetails = async (planId: string) => {
  const response = await api.get(`/plans/trainee/${planId}`);
  return response.data.data;
};
```

---

## TypeScript Interfaces

```typescript
interface NutritionPlan {
  id: string;
  title: string;
  description: string | null;
  daily_calories: number | null;
  start_date: string; // ISO timestamp
  end_date: string | null; // ISO timestamp
  status: 'draft' | 'active' | 'archived';
  coach: {
    id: string;
    fullName: string;
    email: string;
  };
  completionStatus: {
    completion_percentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    last_updated: string | null;
  };
  created_date: string;
  updated_date: string;
}

interface Meal {
  id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  instructions: string | null;
  order_index: number;
}

interface PlanDetails extends NutritionPlan {
  meals: Meal[];
}

interface PlanStatus {
  planId: string;
  planTitle: string;
  completion_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed';
  last_updated: string | null;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
}
```

---

## Testing

You can test these endpoints using:
1. **Swagger UI**: `http://localhost:3000/api/swagger` (when backend is running)
2. **Postman**: Import the endpoints and add Bearer token authentication
3. **cURL**: 
```bash
curl -X GET "http://localhost:3000/api/plans/trainee" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Implementation Status

**⚠️ Note:** These endpoints need to be implemented in the backend. Currently:
- The existing `/api/nutrition-plan` endpoints are restricted to ADMIN and COACH roles
- Trainees cannot access their plans through the current API
- A new trainee-specific controller needs to be created

**Recommended Implementation:**
1. Create a new controller: `TraineePlansController` in `src/trainee-plans/`
2. Add endpoints that automatically filter by the authenticated trainee's ID
3. Include completion status from `trainee_plan_status` table
4. Join with meals table to include meal details

---

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
