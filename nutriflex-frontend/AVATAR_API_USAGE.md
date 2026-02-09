# Avatar API – frontend usage

## Dedicated avatar update (use for “Edit avatar”)

When the user selects an image for their profile avatar, call the **avatar-only** endpoint so the backend saves it and returns the stored URL.

- **Method:** `PUT`
- **URL:** `/api/profile/me/avatar`
- **Body (JSON):** `{ "avatarBase64": "<data URL or raw base64>" }`
- **Success (200):** `data.avatarUrl` is the saved avatar (use as `<img src={data.avatarUrl} />`). Update local state and auth store with it.

## Code change in `src/views/profile/Profile.tsx`

In **`handleAvatarFileChange`**, change the request URL from **`/profile/me`** to **`/profile/me/avatar`** so the dedicated avatar endpoint is used:

**Before:**
```ts
const res = await ApiService.fetchDataWithAxios<MeProfileResponse>({
    url: '/profile/me',
    method: 'put',
    data: { avatarBase64: dataUrl },
})
```

**After:**
```ts
const res = await ApiService.fetchDataWithAxios<MeProfileResponse>({
    url: '/profile/me/avatar',
    method: 'put',
    data: { avatarBase64: dataUrl },
})
```

Keep the rest as is: use `res.data?.avatarUrl ?? dataUrl` and update `setAvatarUrl` and `setUser({ avatar: savedAvatar })`. The backend now returns the saved avatar in `data.avatarUrl`, so it will appear on the profile and everywhere the session user avatar is shown (e.g. users list after the users API returns `avatarUrl`).

## Full profile update (`PUT /api/profile/me`)

Still use for “Save changes” (name, email). You can optionally send `avatarBase64` there too; the response `data.avatarUrl` will reflect the saved avatar.

## Displaying the avatar

- **Profile page:** Use `GET /api/profile/me` → `data.avatarUrl`.
- **Users list:** Use each user’s `avatarUrl` (or `avatar`) in the Name column.
- **Header/dropdown:** Use the session user’s `avatar` (updated when you call `setUser({ avatar: savedAvatar })` after a successful avatar update).
