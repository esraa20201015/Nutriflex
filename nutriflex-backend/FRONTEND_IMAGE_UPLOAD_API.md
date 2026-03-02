# Frontend – Image upload (avatar & certification) API

Use **JSON** for all requests below. Do **not** use `multipart/form-data` for these endpoints; send images as **base64 strings** in the request body.

---

## 1. Profile avatar (Settings / Edit avatar)

### Update current user (name, email, avatar)

- **Method:** `PUT`
- **URL:** `/api/profile/me`
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`

**Request body (all optional):**

```json
{
  "fullName": "Esraa Kamel",
  "email": "esraa.amunem@gmail.com",
  "avatarBase64": "<base64-string-or-data-url>"
}
```

- **`avatarBase64`** – Required for avatar upload. Either:
  - Raw base64 string (e.g. from `FileReader.readAsDataURL(file)` then strip the `data:image/...;base64,` prefix), or
  - Full data URL: `data:image/jpeg;base64,/9j/4AAQ...`

**Success response (200):**

```json
{
  "status": 200,
  "messageEn": "Profile updated successfully",
  "messageAr": "تم تحديث الملف الشخصي بنجاح",
  "data": {
    "userId": "uuid",
    "role": "ADMIN",
    "profile": null,
    "avatarUrl": "data:image/jpeg;base64,/9j/4AAQ..."
  }
}
```

- After a successful avatar update, **`data.avatarUrl`** is the saved value (data URL). Use it as `<img src={data.avatarUrl} />`.

### Get current profile (to show avatar)

- **Method:** `GET`
- **URL:** `/api/profile/me`
- **Headers:** `Authorization: Bearer <access_token>`

**Response:**

```json
{
  "status": 200,
  "data": {
    "userId": "uuid",
    "role": "ADMIN",
    "profile": null,
    "avatarUrl": "data:image/jpeg;base64,..."
  }
}
```

- Use **`data.avatarUrl`** for the profile/header avatar. If `null`, show a placeholder.

---

## 2. Users list (admin) – avatar in user object

- **Method:** `GET`
- **URL:** `/api/users` (with pagination as needed)
- **Headers:** `Authorization: Bearer <access_token>`

Each item in **`data`** is a user object. **`avatarUrl`** may be:

- `null` – no avatar set
- A **data URL** string, e.g. `"data:image/jpeg;base64,..."` – use as `<img src={user.avatarUrl} />`

Do **not** strip or alter `avatarUrl`; use it as-is for `src`.

---

## 3. Sign-up – coach (profile image + certification)

- **Method:** `POST`
- **URL:** `/api/auth/sign-up`
- **Headers:** `Content-Type: application/json`

**Request body (relevant parts):**

```json
{
  "fullName": "Coach Name",
  "email": "coach@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "COACH",
  "coachProfile": {
    "fullName": "Coach Name",
    "bio": "...",
    "specialization": "...",
    "yearsOfExperience": 5,
    "certifications": "NASM, CPR",
    "profileImageBase64": "<base64-or-data-url>",
    "certificationDocumentBase64": "<base64-or-data-url>"
  }
}
```

- **`profileImageBase64`** – Optional. Profile/avatar image (base64 or full data URL).
- **`certificationDocumentBase64`** – Optional. Certification document/image (base64 or data URL).

---

## 4. Sign-up – trainee (avatar)

- **Method:** `POST`
- **URL:** `/api/auth/sign-up`
- **Headers:** `Content-Type: application/json`

**Request body (relevant parts):**

```json
{
  "fullName": "Trainee Name",
  "email": "trainee@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "TRAINEE",
  "traineeProfile": {
    "fullName": "Trainee Name",
    "gender": "male",
    "dateOfBirth": "1995-05-10",
    "avatarBase64": "<base64-or-data-url>"
  }
}
```

- **`avatarBase64`** – Optional. Avatar image (base64 or full data URL).

---

## 5. Coach profile CRUD (profile image + certification upload)

### Create coach profile

- **Method:** `POST`
- **URL:** `/api/profiles/coach`
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`

**Body (optional image fields):**

```json
{
  "user_id": "uuid-of-coach-user",
  "full_name": "Coach Name",
  "profile_image_base64": "<base64-or-data-url>",
  "certification_document_base64": "<base64-or-data-url>"
}
```

### Update coach profile

- **Method:** `PUT`
- **URL:** `/api/profiles/coach/:id`
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`

**Body (optional):**

```json
{
  "full_name": "Updated Name",
  "profile_image_base64": "<base64-or-data-url>",
  "certification_document_base64": "<base64-or-data-url>"
}
```

---

## Frontend checklist for “Edit avatar” (profile page)

1. **Request format:** Use **JSON**. Do not use `FormData` or send a `File` object for these APIs.
2. **Getting base64:** On file input change, use `FileReader`:
   ```js
   const reader = new FileReader();
   reader.onload = () => {
     const dataUrl = reader.result; // "data:image/jpeg;base64,..."
     // Send dataUrl as avatarBase64 (or strip "data:image/xxx;base64," and send only the base64 part).
     updateProfile({ avatarBase64: dataUrl });
   };
   reader.readAsDataURL(file);
   ```
3. **Key name:** Send **`avatarBase64`** (or **`avatar`** as alias) in the JSON body for `PUT /api/profile/me`.
4. **Display:** After a successful `PUT /api/profile/me`, use **`data.avatarUrl`** from the response for `<img src={data.avatarUrl} />`. For initial load, use **`data.avatarUrl`** from `GET /api/profile/me`.

If **`avatarUrl`** is still `null` in the response, verify the request body in the network tab: it must be JSON containing **`avatarBase64`** (or **`avatar`**) with a non-empty string.
