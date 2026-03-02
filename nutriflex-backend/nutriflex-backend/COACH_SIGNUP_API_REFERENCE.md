# Coach Sign-Up API Reference

## Endpoint

**URL:** `POST /api/auth/sign-up`

**Headers:**
```
Content-Type: application/json
```

---

## Request Body Format for COACH

When signing up as a **COACH**, you **MUST** include the `coachProfile` object with at least `fullName`.

### Required Fields

```json
{
  "fullName": "John Doe",                    // Required: User's full name
  "email": "coach@example.com",              // Required: Valid email
  "password": "SecurePass123",               // Required: Min 8 chars, must contain uppercase, lowercase, and number
  "confirmPassword": "SecurePass123",        // Required: Must match password
  "role": "COACH",                           // Required: Must be "COACH" or "TRAINEE"
  "coachProfile": {                          // Required when role = "COACH"
    "fullName": "John Doe"                   // Required: Coach's full name
  }
}
```

### Complete Example (All Fields)

```json
{
  "fullName": "Dr. Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "COACH",
  "coachProfile": {
    "fullName": "Dr. Sarah Johnson",         // Required
    "bio": "Experienced fitness coach specializing in strength training and nutrition",  // Optional
    "specialization": "Strength Training, Nutrition",  // Optional
    "yearsOfExperience": 5,                 // Optional: Number (0-50)
    "certifications": "CPR, NASM Certified Personal Trainer",  // Optional
    "profileImageUrl": "/uploads/profiles/sarah.jpg",  // Optional
    "profileImageBase64": "data:image/jpeg;base64,/9j/4AAQ...",  // Optional: Base64 image
    "certificationDocumentBase64": "data:image/jpeg;base64,/9j/4AAQ..."  // Optional: Base64 document
  }
}
```

---

## Common Errors and Solutions

### Error: "coachProfile has invalid value"

**Cause:** The `coachProfile` object is missing, null, empty, or missing the required `fullName` field.

**Solutions:**

1. **Missing coachProfile:**
```json
// ❌ WRONG
{
  "role": "COACH",
  "coachProfile": null
}

// ✅ CORRECT
{
  "role": "COACH",
  "coachProfile": {
    "fullName": "John Doe"
  }
}
```

2. **Empty coachProfile object:**
```json
// ❌ WRONG
{
  "role": "COACH",
  "coachProfile": {}
}

// ✅ CORRECT
{
  "role": "COACH",
  "coachProfile": {
    "fullName": "John Doe"
  }
}
```

3. **Missing fullName in coachProfile:**
```json
// ❌ WRONG
{
  "role": "COACH",
  "coachProfile": {
    "bio": "Some bio"
  }
}

// ✅ CORRECT
{
  "role": "COACH",
  "coachProfile": {
    "fullName": "John Doe",
    "bio": "Some bio"
  }
}
```

4. **Empty fullName string:**
```json
// ❌ WRONG
{
  "role": "COACH",
  "coachProfile": {
    "fullName": ""
  }
}

// ✅ CORRECT
{
  "role": "COACH",
  "coachProfile": {
    "fullName": "John Doe"
  }
}
```

---

## Frontend Form Example

### React/TypeScript Example

```tsx
const CoachSignUpForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'COACH',
    coachProfile: {
      fullName: '',
      bio: '',
      specialization: '',
      yearsOfExperience: '',
      certifications: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coachProfile.fullName is not empty
    if (!formData.coachProfile.fullName.trim()) {
      alert('Coach full name is required');
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'COACH',
          coachProfile: {
            fullName: formData.coachProfile.fullName, // REQUIRED
            bio: formData.coachProfile.bio || null,
            specialization: formData.coachProfile.specialization || null,
            yearsOfExperience: formData.coachProfile.yearsOfExperience 
              ? Number(formData.coachProfile.yearsOfExperience) 
              : null,
            certifications: formData.coachProfile.certifications || null
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sign up failed');
      }

      const data = await response.json();
      console.log('Sign up successful:', data);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        required
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      
      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
      />
      
      {/* Coach Profile Fields */}
      <input
        type="text"
        placeholder="Coach Full Name *"
        value={formData.coachProfile.fullName}
        onChange={(e) => setFormData({
          ...formData,
          coachProfile: { ...formData.coachProfile, fullName: e.target.value }
        })}
        required
      />
      
      <textarea
        placeholder="Bio (Optional)"
        value={formData.coachProfile.bio}
        onChange={(e) => setFormData({
          ...formData,
          coachProfile: { ...formData.coachProfile, bio: e.target.value }
        })}
      />
      
      <button type="submit">Sign Up as Coach</button>
    </form>
  );
};
```

---

## Minimal Valid Request

The absolute minimum required fields for coach sign-up:

```json
{
  "fullName": "John Doe",
  "email": "coach@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "COACH",
  "coachProfile": {
    "fullName": "John Doe"
  }
}
```

---

## Success Response

```json
{
  "status": 201,
  "messageEn": "User registered successfully. Please check your email to verify your account.",
  "messageAr": "تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني للتحقق من حسابك.",
  "data": {
    "id": "user-uuid",
    "fullName": "John Doe",
    "email": "coach@example.com",
    "role": "COACH",
    "isEmailVerified": false
  }
}
```

---

## Validation Rules

### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

### Email Requirements:
- Valid email format
- Maximum 255 characters

### Coach Profile Requirements:
- `fullName`: Required, non-empty string, max 255 characters
- `bio`: Optional string
- `specialization`: Optional string, max 255 characters
- `yearsOfExperience`: Optional number, 0-50
- `certifications`: Optional string
- `profileImageUrl`: Optional string (URL)
- `profileImageBase64`: Optional string (base64 image)
- `certificationDocumentBase64`: Optional string (base64 document)

---

## Testing with cURL

```bash
curl -X POST "http://localhost:3000/api/auth/sign-up" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Coach",
    "email": "coach@test.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123",
    "role": "COACH",
    "coachProfile": {
      "fullName": "Test Coach"
    }
  }'
```

---

## Troubleshooting

### Issue: "coachProfile has invalid value"

**Check:**
1. ✅ Is `coachProfile` present in the request body?
2. ✅ Is `coachProfile` an object (not null, not empty `{}`)?
3. ✅ Does `coachProfile.fullName` exist and is not empty?
4. ✅ Is `coachProfile.fullName` a non-empty string?

### Issue: Password validation fails

**Check:**
1. ✅ Password is at least 8 characters
2. ✅ Password contains at least one uppercase letter
3. ✅ Password contains at least one lowercase letter
4. ✅ Password contains at least one number
5. ✅ `password` and `confirmPassword` match exactly

### Issue: Email already exists

**Solution:** Use a different email address or sign in with existing account.

---

## Quick Checklist for Frontend

- [ ] `fullName` is provided (user's full name)
- [ ] `email` is valid email format
- [ ] `password` meets requirements (8+ chars, uppercase, lowercase, number)
- [ ] `confirmPassword` matches `password`
- [ ] `role` is exactly `"COACH"` (uppercase)
- [ ] `coachProfile` object is included
- [ ] `coachProfile.fullName` is provided and not empty
- [ ] Request Content-Type is `application/json`
