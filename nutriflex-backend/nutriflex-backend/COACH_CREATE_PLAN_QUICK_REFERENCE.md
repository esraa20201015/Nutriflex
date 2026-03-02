# Quick Reference: Create Nutrition Plan API

## Endpoint Details

**URL:** `POST /api/nutrition-plan`

**Full URL:** `http://localhost:3000/api/nutrition-plan` (or your backend URL)

**Headers Required:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Role Required:** `COACH` or `ADMIN`

---

## Request Body Format

```json
{
  "coach_id": "coach-uuid-from-jwt-token",
  "trainee_id": "trainee-uuid",
  "title": "Plan Title",
  "description": "Plan description (optional)",
  "daily_calories": 2000,
  "start_date": "2026-02-10T00:00:00.000Z",
  "end_date": "2026-12-31T00:00:00.000Z",
  "status": "draft"
}
```

**Required Fields:**
- `coach_id` - Get from authenticated user's ID (JWT token)
- `trainee_id` - UUID of the trainee
- `title` - Plan title (max 255 characters)
- `start_date` - ISO 8601 date string

**Optional Fields:**
- `description` - Can be null or omitted
- `daily_calories` - Number, can be null
- `end_date` - ISO 8601 date string, can be null
- `status` - "draft", "active", or "archived" (default: "draft")

---

## Example Frontend Code

### Using Fetch (JavaScript)
```javascript
const createPlan = async (planData) => {
  const token = localStorage.getItem('access_token'); // or your token storage
  const coachId = getCurrentUserId(); // Extract from JWT token
  
  const response = await fetch('http://localhost:3000/api/nutrition-plan', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coach_id: coachId,
      trainee_id: planData.traineeId,
      title: planData.title,
      description: planData.description || null,
      daily_calories: planData.dailyCalories || null,
      start_date: planData.startDate,
      end_date: planData.endDate || null,
      status: planData.status || 'draft'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create plan');
  }
  
  return await response.json();
};
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

const createPlan = async (planData: {
  traineeId: string;
  title: string;
  description?: string;
  dailyCalories?: number;
  startDate: string;
  endDate?: string;
  status?: 'draft' | 'active' | 'archived';
}) => {
  // Get coach ID from decoded JWT token
  const coachId = getCurrentUserId(); // Your function to get user ID from token
  
  const response = await api.post('/nutrition-plan', {
    coach_id: coachId,
    trainee_id: planData.traineeId,
    title: planData.title,
    description: planData.description || null,
    daily_calories: planData.dailyCalories || null,
    start_date: planData.startDate,
    end_date: planData.endDate || null,
    status: planData.status || 'draft'
  });
  
  return response.data;
};
```

---

## Success Response

```json
{
  "status": 201,
  "messageEn": "Nutrition plan created successfully",
  "messageAr": "تم إنشاء خطة التغذية بنجاح",
  "data": {
    "id": "new-plan-uuid",
    "coach_id": "coach-uuid",
    "trainee_id": "trainee-uuid",
    "title": "Plan Title",
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

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden (Wrong Role)
```json
{
  "messageEn": "Insufficient permissions. Required role: COACH or ADMIN",
  "messageAr": "صلاحيات غير كافية"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "coach_id should not be empty",
    "trainee_id must be a UUID",
    "title should not be empty",
    "start_date must be a valid ISO 8601 date string"
  ]
}
```

---

## Troubleshooting Checklist

1. ✅ **Check if API call is being made:**
   - Open browser DevTools → Network tab
   - Click "Create New Plan" button
   - Look for a POST request to `/api/nutrition-plan`

2. ✅ **If no request appears:**
   - Check if button click handler is attached
   - Check browser console for JavaScript errors
   - Verify form submission is not being prevented

3. ✅ **If request appears but fails:**
   - Check request headers (Authorization token present?)
   - Check request payload (all required fields present?)
   - Check response status code and error message

4. ✅ **Verify token:**
   - Ensure token is valid and not expired
   - Ensure token belongs to a COACH user
   - Check token format: `Bearer <token>`

5. ✅ **Verify backend is running:**
   - Check if backend server is running on correct port
   - Test endpoint in Postman/Swagger UI

---

## Testing with cURL

```bash
curl -X POST "http://localhost:3000/api/nutrition-plan" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "coach_id": "coach-uuid",
    "trainee_id": "trainee-uuid",
    "title": "Test Plan",
    "start_date": "2026-02-10T00:00:00.000Z",
    "status": "draft"
  }'
```

---

## Testing with Swagger UI

1. Go to: `http://localhost:3000/api/swagger`
2. Find "Nutrition Plan" section
3. Click on `POST /api/nutrition-plan`
4. Click "Try it out"
5. Fill in the request body
6. Click "Execute"

---

## Common Frontend Issues

### Issue 1: Button Click Not Triggering API Call
**Solution:** Check if:
- Button has `onClick` handler attached
- Form has `onSubmit` handler (if using form)
- Event is not being prevented (`e.preventDefault()` if needed)

### Issue 2: API Call Fails with 401/403
**Solution:** 
- Verify token is included in headers
- Verify user role is COACH
- Check token expiration

### Issue 3: API Call Fails with 400 Validation Error
**Solution:**
- Verify all required fields are present
- Check field formats (dates must be ISO strings, UUIDs must be valid)
- Check field types (numbers vs strings)

### Issue 4: No Response/Network Error
**Solution:**
- Check backend server is running
- Check CORS configuration
- Check network connectivity
- Verify API URL is correct

---

## Frontend Form Example

```tsx
// React/TypeScript Example
const CreatePlanForm = () => {
  const [formData, setFormData] = useState({
    traineeId: '',
    title: '',
    description: '',
    dailyCalories: '',
    startDate: '',
    endDate: '',
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const coachId = getCurrentUserId(); // From JWT token
      
      const response = await api.post('/nutrition-plan', {
        coach_id: coachId,
        trainee_id: formData.traineeId,
        title: formData.title,
        description: formData.description || null,
        daily_calories: formData.dailyCalories ? Number(formData.dailyCalories) : null,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        status: formData.status
      });
      
      console.log('Plan created:', response.data);
      // Handle success (redirect, show message, etc.)
    } catch (error) {
      console.error('Error creating plan:', error);
      // Handle error (show error message)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Create Plan</button>
    </form>
  );
};
```

---

## Need Help?

If the API call is still not working:
1. Check browser console for errors
2. Check Network tab for the request
3. Verify backend logs for incoming requests
4. Test the endpoint directly with Postman/Swagger
