# Sign-up form layout architecture

This document describes the **layout**, **width/height**, and **structure** of the sign-up form so you can reuse it in this app or in another app.

---

## 1. Architecture (this app – Nutriflex)

### Route and layout

- **Route:** `/sign-up` (from `authRoute.ts`).
- **Layout:** Auth routes use `PreLoginLayout`. Sign-up and sign-in use **AuthLayout**, which defaults to the **Side** layout (form column + optional image on sign-in).

### Sign-up flow (Nutriflex)

- **Entry:** `src/views/auth/SignUp/SignUp.tsx`
- **Role selector:** COACH vs TRAINEE → `RoleSelection.tsx` (when no `?role=` or role not COACH/TRAINEE).
- **Form:** `SignUpForm.tsx` – steps: Account info → Coach or Trainee profile (with base64 avatar/certification support).

### Layout options

- **Side (default):** Form in a column `max-w-[380px]` / `xl:max-w-[450px]`, `px-8`. On sign-in only, an image is shown on the right (e.g. `fitness.png`).
- **Simple:** Centered card layout with configurable width (see below). Use `AuthLayout` with `currentLayoutType: 'simple'` and render sign-up inside `Simple` with `variant="signup"`.

### Where width/height are set

- **Side:** `src/components/layouts/AuthLayout/Side.tsx` – form column width and padding.
- **Simple:** `src/components/layouts/AuthLayout/Simple.tsx` – wrapper width, card padding, and optional card height (first step vs content-driven).

---

## 2. Width and height (reusable in another app)

Use the same wrapper and card so the form looks the same elsewhere.

### Outer (viewport and container)

- **Viewport:** `height: 100vh`.
- **Container:** Centered flex, full height:
  - `flex flex-col flex-auto items-center justify-center min-w-0 h-full` (e.g. with `Container` or `container mx-auto`).

### Form card wrapper (width)

- **Class:**
  - `w-full min-w-[320px] max-w-full md:min-w-[400px] md:max-w-[1200px]`
- **Meaning:**
  - **Mobile:** full width, min 320px.
  - **From `md` up:** min 400px, max 1200px.

So in another app:

- **Width:** `min-width: 320px` (mobile); `min-width: 400px` and `max-width: 1200px` from tablet up.
- **Height:** No fixed pixel height; card height is content-driven or set per step (see below).

### Card (form container) – padding and height

- **Classes:** `bg-white dark:bg-gray-800 px-8 rounded-lg shadow-lg`.
- **Height (optional):**
  - **First step (e.g. user/role info):** `height: 82%`, `marginTop: 6rem`.
  - **Other steps:** no fixed height; e.g. `marginTop: 2rem`, `marginBottom: 2rem`, so the card grows with content.

Summary for reuse:

- **Wrapper:** min 320px (mobile), 400px–1200px (md+).
- **Card:** same width as wrapper; `px-8`; height either **82%** for first step or content-driven with margins.
- **Viewport:** 100vh.

### Optional: Sign-in style (narrower form)

For a **sign-in** or simple single-column form:

- **Form column (Side layout):** `w-full xl:max-w-[480px] px-8 max-w-[400px]`.
- **Width:** max 400px (or 480px on `xl`); padding 2rem (`px-8`).

In **Simple** layout, use `variant="narrow"`: `min-w-[320px] md:min-w-[400px] max-w-[400px]` (no wide card).

---

## 3. Minimal structure to reuse in another app

You can drop this around your form to keep the same structure and dimensions:

```tsx
// Same structure as Simple.tsx (signup variant) – use for sign-up form
<div style={{ height: '100vh' }}>
  <div className="container mx-auto flex flex-col flex-auto items-center justify-center min-w-0 h-full">
    <div className="w-full min-w-[320px] max-w-full md:min-w-[400px] md:max-w-[1200px]">
      <div
        className="bg-white dark:bg-gray-800 px-8 rounded-lg shadow-lg"
        style={{ height: '82%', marginTop: '6rem' }}
      >
        {/* First step: fixed height; for other steps use marginTop/marginBottom only */}
        {/* Your sign-up form here */}
      </div>
    </div>
  </div>
</div>
```

For a **later step** (content-driven height):

```tsx
style={{ marginTop: '2rem', marginBottom: '2rem' }}
```

---

## 4. Summary

| Context              | Layout  | Wrapper width              | Card / column                    |
|----------------------|---------|----------------------------|----------------------------------|
| Sign-up (wide card)  | Simple  | min 320px; md: 400px–1200px | Card: px-8; height 82% or margins |
| Sign-in / narrow     | Side    | –                          | Column: max-w-[400px], xl: max-w-[480px], px-8 |
| Sign-in (Simple)     | Simple  | narrow variant             | max-w-[400px]                    |

- **Sign-up (with card):** Use **Simple** with `variant="signup"` and optional `cardHeight="firstStep"` or `"content"`. Wrapper: **min 320px**, **md: 400px–1200px**. Card: **px-8**, height **82%** for first step or content-driven with margins; **100vh** viewport.
- **Sign-in / simple auth:** Use **Side** or **Simple** narrow. Form column: **max-w-[400px]** (xl: **max-w-[480px]**), **px-8**.
