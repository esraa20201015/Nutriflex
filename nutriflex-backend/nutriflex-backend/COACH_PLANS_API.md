# Coach Plans API Documentation

This document provides complete API documentation for the Coach Plans endpoints that the frontend team needs to implement.

---

## Base URL
All endpoints are prefixed with `/api/nutrition-plan` and `/api/meal`

## Authentication & Security
All endpoints require:
- **Header**: `Authorization: Bearer <access_token>`
- **Role**: `COACH` (or `ADMIN` for testing)

### Data Isolation & Security
**Important:** Coaches should filter plans by their own `coach_id` (extracted from JWT token) to see only plans they created.

1. **JWT Token Authentication**: The user ID is extracted from the cryptographically signed JWT token.
2. **Coach ID Filtering**: When fetching plans, always filter by `coach_id` query parameter using the authenticated coach's ID.
3. **Plan Ownership**: Coaches can only create/update/delete plans where they are the assigned coach.

---

## Endpoints Overview

### Nutrition Plans

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/nutrition-plan` | GET | Get all nutrition plans (filter by coach_id) |
| `/api/nutrition-plan` | POST | Create a new nutrition plan |
| `/api/nutrition-plan/search` | GET | Search nutrition plans |
| `/api/nutrition-plan/:id` | GET | Get plan details with meals |
| `/api/nutrition-plan/:id` | PUT | Update nutrition plan |
| `/api/nutrition-plan/:id/toggle-status` | PUT | Toggle plan status (draft → active → archived) |
| `/api/nutrition-plan/:id` | DELETE | Delete nutrition plan |

### Meals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meal` | GET | Get all meals (filter by nutrition_plan_id) |
| `/api/meal` | POST | Create a new meal |
| `/api/meal/search` | GET | Search meals |
| `/api/meal/:id` | GET | Get meal details |
| `/api/meal/:id` | PUT | Update meal |
| `/api/meal/:id` | DELETE | Delete meal |

---

## 1. Get All Plans (Coach's Plans)

**Endpoint:** `GET /api/nutrition-plan`

**Description:** Returns all nutrition plans. Coaches should filter by `coach_id` to see only their own plans.

**Query Parameters:**
- `coach_id` (required for coaches): Filter by coach ID (use authenticated coach's ID from JWT token)
- `trainee_id` (optional): Filter by trainee ID
- `status` (optional): Filter by plan status (`draft`, `active`, `archived`)
- `skip` (optional): Number of records to skip (for pagination)
- `take` (optional): Number of records to return (for pagination)

**Example Request:**
```http
GET /api/nutrition-plan?coach_id=<coach_id_from_token>&status=active&skip=0&take=10
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plans retrieved successfully",
  "messageAr": "تم استرجاع خطط التغذية بنجاح",
  "data": [
    {
      "id": "uuid",
      "coach_id": "coach-uuid",
      "trainee_id": "trainee-uuid",
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
      "trainee": {
        "id": "trainee-uuid",
        "fullName": "Ahmed Ali",
        "email": "ahmed.ali@example.com"
      },
      "created_date": "2025-12-15T08:00:00.000Z",
      "updated_date": "2026-02-01T09:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "count": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

## 2. Create Nutrition Plan

**Endpoint:** `POST /api/nutrition-plan`

**Description:** Creates a new nutrition plan for a trainee.

**Request Body:**
```json
{
  "coach_id": "coach-uuid",              // Required: Use authenticated coach's ID
  "trainee_id": "trainee-uuid",          // Required: Trainee to assign plan to
  "title": "High Protein Diet Plan",     // Required: Plan title
  "description": "Plan description",     // Optional: Plan description
  "daily_calories": 2000,                // Optional: Target daily calories
  "start_date": "2026-02-10T00:00:00.000Z",  // Required: ISO date string
  "end_date": "2026-12-31T00:00:00.000Z",    // Optional: ISO date string
  "status": "draft"                      // Optional: draft, active, or archived (default: draft)
}
```

**Response:**
```json
{
  "status": 201,
  "messageEn": "Nutrition plan created successfully",
  "messageAr": "تم إنشاء خطة التغذية بنجاح",
  "data": {
    "id": "new-plan-uuid",
    "coach_id": "coach-uuid",
    "trainee_id": "trainee-uuid",
    "title": "High Protein Diet Plan",
    "description": "Plan description",
    "daily_calories": 2000,
    "start_date": "2026-02-10T00:00:00.000Z",
    "end_date": "2026-12-31T00:00:00.000Z",
    "status": "draft",
    "coach": { ... },
    "trainee": { ... },
    "created_date": "2026-02-09T10:00:00.000Z",
    "updated_date": "2026-02-09T10:00:00.000Z"
  }
}
```

---

## 3. Search Plans

**Endpoint:** `GET /api/nutrition-plan/search`

**Description:** Search nutrition plans by title or description.

**Query Parameters:**
- `search` (optional): Search keyword (searches in title and description)
- `coach_id` (required for coaches): Filter by coach ID
- `trainee_id` (optional): Filter by trainee ID
- `status` (optional): Filter by plan status
- `skip` (optional): Pagination offset
- `take` (optional): Pagination limit

**Example Request:**
```http
GET /api/nutrition-plan/search?coach_id=<coach_id>&search=weight%20loss&status=active
Authorization: Bearer <access_token>
```

**Response:** Same format as GET /api/nutrition-plan

---

## 4. Get Plan Details

**Endpoint:** `GET /api/nutrition-plan/:id`

**Description:** Returns detailed information about a specific nutrition plan. Note: This endpoint doesn't include meals by default. Use the meal endpoints to get meals for a plan.

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
    "coach_id": "coach-uuid",
    "trainee_id": "trainee-uuid",
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
    "trainee": {
      "id": "trainee-uuid",
      "fullName": "Ahmed Ali",
      "email": "ahmed.ali@example.com"
    },
    "created_date": "2025-12-15T08:00:00.000Z",
    "updated_date": "2026-02-01T09:00:00.000Z"
  }
}
```

---

## 5. Update Nutrition Plan

**Endpoint:** `PUT /api/nutrition-plan/:id`

**Description:** Updates an existing nutrition plan. Only fields provided in the request body will be updated.

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Request Body (all fields optional):**
```json
{
  "title": "Updated Plan Title",
  "description": "Updated description",
  "daily_calories": 2200,
  "start_date": "2026-02-15T00:00:00.000Z",
  "end_date": "2026-12-31T00:00:00.000Z",
  "status": "active"
}
```

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plan updated successfully",
  "messageAr": "تم تحديث خطة التغذية بنجاح",
  "data": {
    // Updated plan object
  }
}
```

---

## 6. Toggle Plan Status

**Endpoint:** `PUT /api/nutrition-plan/:id/toggle-status`

**Description:** Toggles plan status in sequence: `draft` → `active` → `archived` → `draft`

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plan updated successfully",
  "messageAr": "تم تحديث خطة التغذية بنجاح",
  "data": {
    // Plan object with updated status
  }
}
```

---

## 7. Delete Nutrition Plan

**Endpoint:** `DELETE /api/nutrition-plan/:id`

**Description:** Deletes a nutrition plan. This will also delete all associated meals (cascade delete).

**Path Parameters:**
- `id`: Nutrition plan ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Nutrition plan deleted successfully",
  "messageAr": "تم حذف خطة التغذية بنجاح",
  "data": null
}
```

---

## 8. Get Plan Meals

**Endpoint:** `GET /api/meal`

**Description:** Returns all meals. Filter by `nutrition_plan_id` to get meals for a specific plan.

**Query Parameters:**
- `nutrition_plan_id` (required): Filter by nutrition plan ID
- `meal_type` (optional): Filter by meal type (`breakfast`, `lunch`, `dinner`, `snack`)
- `skip` (optional): Pagination offset
- `take` (optional): Pagination limit

**Example Request:**
```http
GET /api/meal?nutrition_plan_id=<plan_id>
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": 200,
  "messageEn": "Meals retrieved successfully",
  "messageAr": "تم استرجاع الوجبات بنجاح",
  "data": [
    {
      "id": "meal-uuid",
      "nutrition_plan_id": "plan-uuid",
      "name": "Oatmeal with Berries",
      "meal_type": "breakfast",
      "calories": 350,
      "protein": 12.5,
      "carbs": 55.0,
      "fats": 8.0,
      "instructions": "Cook 1 cup oats, add 1/2 cup mixed berries, 1 tbsp almond butter",
      "order_index": 1,
      "created_date": "2026-01-15T08:00:00.000Z",
      "updated_date": "2026-01-15T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "count": 1,
    "skip": 0,
    "take": 10
  }
}
```

---

## 9. Create Meal

**Endpoint:** `POST /api/meal`

**Description:** Creates a new meal for a nutrition plan.

**Request Body:**
```json
{
  "nutrition_plan_id": "plan-uuid",      // Required: Plan ID
  "name": "Oatmeal with Berries",        // Required: Meal name
  "meal_type": "breakfast",              // Required: breakfast, lunch, dinner, or snack
  "calories": 350,                       // Optional: Calories
  "protein": 12.5,                       // Optional: Protein in grams
  "carbs": 55.0,                         // Optional: Carbs in grams
  "fats": 8.0,                           // Optional: Fats in grams
  "instructions": "Cook 1 cup oats...",  // Optional: Preparation instructions
  "order_index": 1                       // Optional: Display order (default: 0)
}
```

**Response:**
```json
{
  "status": 201,
  "messageEn": "Meal created successfully",
  "messageAr": "تم إنشاء الوجبة بنجاح",
  "data": {
    // Created meal object
  }
}
```

---

## 10. Update Meal

**Endpoint:** `PUT /api/meal/:id`

**Description:** Updates an existing meal.

**Path Parameters:**
- `id`: Meal ID (UUID)

**Request Body (all fields optional):**
```json
{
  "name": "Updated Meal Name",
  "meal_type": "lunch",
  "calories": 400,
  "protein": 15.0,
  "carbs": 50.0,
  "fats": 10.0,
  "instructions": "Updated instructions",
  "order_index": 2
}
```

**Response:**
```json
{
  "status": 200,
  "messageEn": "Meal updated successfully",
  "messageAr": "تم تحديث الوجبة بنجاح",
  "data": {
    // Updated meal object
  }
}
```

---

## 11. Delete Meal

**Endpoint:** `DELETE /api/meal/:id`

**Description:** Deletes a meal.

**Path Parameters:**
- `id`: Meal ID (UUID)

**Response:**
```json
{
  "status": 200,
  "messageEn": "Meal deleted successfully",
  "messageAr": "تم حذف الوجبة بنجاح",
  "data": null
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
  "messageEn": "Insufficient permissions. Required role: COACH or ADMIN",
  "messageAr": "صلاحيات غير كافية. الدور المطلوب: COACH أو ADMIN"
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

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": ["title should not be empty", "trainee_id must be a UUID"]
}
```

---

## Frontend Implementation Notes

### 1. **Coach ID Extraction**
Always extract the coach ID from the JWT token and use it to filter plans:

```typescript
// Extract coach ID from token
const coachId = user.id; // From decoded JWT token

// Fetch coach's plans
const response = await api.get('/nutrition-plan', {
  params: { coach_id: coachId, status: 'active' }
});
```

### 2. **Plan Status Management**
- `draft`: Plan is being created/edited, not yet active
- `active`: Plan is currently active and assigned to trainee
- `archived`: Plan is completed or no longer active

### 3. **Meal Types**
- `breakfast`: Morning meal
- `lunch`: Midday meal
- `dinner`: Evening meal
- `snack`: Snack between meals

### 4. **Date Handling**
- All dates are in ISO 8601 format (e.g., `2026-02-10T00:00:00.000Z`)
- Frontend should format dates according to user's locale
- `end_date` can be `null` for ongoing plans

### 5. **Pagination**
Always use pagination for list endpoints:
```typescript
const getPlans = async (page: number = 1, pageSize: number = 10) => {
  const skip = (page - 1) * pageSize;
  return api.get('/nutrition-plan', {
    params: {
      coach_id: coachId,
      skip,
      take: pageSize
    }
  });
};
```

### 6. **Creating Plans with Meals**
Typical workflow:
1. Create plan (POST `/api/nutrition-plan`)
2. Get plan ID from response
3. Create meals for the plan (POST `/api/meal` with `nutrition_plan_id`)

### 7. **Null Handling**
- `description`: Can be `null` - show "No description" if null
- `daily_calories`: Can be `null` - show "Not specified" if null
- `end_date`: Can be `null` - show "Ongoing" if null
- Nutritional values (calories, protein, carbs, fats): Can be `null` - show "N/A" if null

---

## Example API Calls

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

// Get coach's plans
const getCoachPlans = async (coachId: string, status?: string) => {
  const params: any = { coach_id: coachId };
  if (status) params.status = status;
  const response = await api.get('/nutrition-plan', { params });
  return response.data.data;
};

// Create plan
const createPlan = async (planData: {
  coach_id: string;
  trainee_id: string;
  title: string;
  description?: string;
  daily_calories?: number;
  start_date: string;
  end_date?: string;
  status?: string;
}) => {
  const response = await api.post('/nutrition-plan', planData);
  return response.data.data;
};

// Get plan meals
const getPlanMeals = async (planId: string) => {
  const response = await api.get('/meal', {
    params: { nutrition_plan_id: planId }
  });
  return response.data.data;
};

// Create meal
const createMeal = async (mealData: {
  nutrition_plan_id: string;
  name: string;
  meal_type: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  instructions?: string;
  order_index?: number;
}) => {
  const response = await api.post('/meal', mealData);
  return response.data.data;
};
```

---

## TypeScript Interfaces

```typescript
interface NutritionPlan {
  id: string;
  coach_id: string;
  trainee_id: string;
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
  trainee: {
    id: string;
    fullName: string;
    email: string;
  };
  created_date: string;
  updated_date: string;
}

interface Meal {
  id: string;
  nutrition_plan_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  instructions: string | null;
  order_index: number;
  created_date: string;
  updated_date: string;
}

interface CreatePlanDto {
  coach_id: string;
  trainee_id: string;
  title: string;
  description?: string | null;
  daily_calories?: number | null;
  start_date: string;
  end_date?: string | null;
  status?: 'draft' | 'active' | 'archived';
}

interface CreateMealDto {
  nutrition_plan_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  instructions?: string | null;
  order_index?: number;
}
```

---

## Testing

You can test these endpoints using:
1. **Swagger UI**: `http://localhost:3000/api/swagger` (when backend is running)
2. **Postman**: Import the endpoints and add Bearer token authentication
3. **cURL**: 
```bash
curl -X GET "http://localhost:3000/api/nutrition-plan?coach_id=YOUR_COACH_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Support

For questions or issues, contact the backend team or refer to the main API documentation.
