# Frontend image upload API (profile, sign-up, coach)

This doc matches the backend **FRONTEND_IMAGE_UPLOAD_API.md** and describes how the frontend sends and displays images.

---

## 1. Profile avatar (Settings)

- **Request:** `PUT /api/profile/me` with **JSON** body.
- **Body:** `avatarBase64` (or `avatar`) = full data URL or raw base64 string.
- **Content-Type:** `application/json` (default when sending a JSON object with Axios).
- **Response:** `data.avatarUrl` is the saved avatar (data URL). Use it for `<img src={data.avatarUrl} />`.

**Implementation:** On “Edit avatar”, use `FileReader.readAsDataURL(file)` and send:

```json
{ "avatarBase64": "data:image/jpeg;base64,/9j/4AAQ..." }
```

Do **not** use FormData + file; the backend expects JSON with a string field.

---

## 2. Where avatars are shown

- **Profile page (Overview & Settings):** From local state / GET `/api/profile/me` → `data.avatarUrl`.
- **Header (UserProfileDropdown):** From auth store `user.avatar` (updated after profile avatar upload and after GET profile/me).
- **Users table (Name column):** From GET `/users` → each user’s `avatarUrl` (or normalized `avatar`). If the backend returns `avatarUrl: null` for a user, the list will show the default icon until the backend includes `avatar_url` in the users list response.

---

## 3. Sign-up

- **Coach:** Send `profileImageBase64` and `certificationDocumentBase64` inside `coachProfile` (JSON).
- **Trainee:** Send `avatarBase64` inside `traineeProfile` (JSON).

Read files with `FileReader.readAsDataURL(file)` and put the string in the corresponding field.

---

## 4. Coach profile create/update

- **POST /api/profiles/coach** and **PUT /api/profiles/coach/:id**: send `profile_image_base64` and/or `certification_document_base64` in the JSON body when uploading.

---

## 5. Why avatar can be `null` in responses

- Backend only saves/returns an avatar when the request is **JSON** and includes the image in the expected field (`avatarBase64` or `avatar` for profile).
- If the frontend used FormData + File, the backend would not see `avatarBase64` and would return `avatarUrl: null`.
- For the **Users** page: if GET `/users` returns `avatarUrl: null` for a user who has uploaded an avatar, the backend must include `avatar_url` (or `avatarUrl`) in the users list response so the table can show it.
