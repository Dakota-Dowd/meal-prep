# Spec: Meal Detail Popup, Card Enhancements, and Grocery List UX

## Overview

This spec covers:
1. Meal detail popup (click a meal card to open it)
2. New fields on the `Meal` data model: image, URL, rating, prep time, instructions
3. Meal card box enhancements: star rating display, prep time, grocery list checkbox
4. Grocery list UX changes: two-step checkbox + banner confirm, clear button
5. Branding change: "bento" → "Meal Prep"
6. Database schema additions
7. Image storage strategy: server filesystem + Sharp compression

---

## Resolved Design Decisions

| Question | Decision |
|---|---|
| Grocery list: one-step or two-step? | **Two-step** — checkbox stages the meal; "Add to grocery list" banner button commits |
| Card click vs. checkbox | Clicking card body opens popup; checkbox is the only grocery list toggle |
| Time field | **Prep time only** (single `prep_time_minutes` field) |
| Stars on unrated meals | **Show nothing** — stars only appear on the card if the meal has been rated |
| Image storage | **Server filesystem** (`backend/uploads/`), gitignored, Sharp-compressed on upload |

---

## 1. Branding Change

- In `Dashboard.tsx`, the topbar brand `ben<span>to</span>` becomes `Meal Prep` (plain text, no stylized split)

---

## 2. New Data Model Fields

The `Meal` interface in `frontend/src/data/mockMeals.ts` gains optional fields:

```typescript
export interface Meal {
  id: string;
  name: string;
  tags: string[];
  ingredients: Ingredient[];
  // New fields (all optional)
  image_path?: string;       // filename stored on server, e.g. "abc123.jpg"
  url?: string;              // reference link
  rating?: number;           // 1–5, undefined = unrated
  prep_time_minutes?: number;
  instructions?: string;
}
```

`instructions` already exists in the DB schema but was never surfaced in the frontend type.

---

## 3. Database Changes

### SQL to run on the server

```sql
ALTER TABLE meals
  ADD COLUMN image_path        VARCHAR(500)      NULL AFTER instructions,
  ADD COLUMN url               VARCHAR(500)      NULL AFTER image_path,
  ADD COLUMN rating            TINYINT UNSIGNED  NULL AFTER url,
  ADD COLUMN prep_time_minutes SMALLINT UNSIGNED NULL AFTER rating;
```

> `TINYINT UNSIGNED` covers 0–255, plenty for a 1–5 star rating.
> `SMALLINT UNSIGNED` covers 0–65535, plenty for prep time in minutes.
> Both are NULL by default — they are optional.

### Updated schema.md additions to `meals` table

| Column | Type | Notes |
|---|---|---|
| image_path | VARCHAR(500) | optional, stores filename only |
| url | VARCHAR(500) | optional reference link |
| rating | TINYINT UNSIGNED | 1–5, NULL = unrated |
| prep_time_minutes | SMALLINT UNSIGNED | minutes, NULL = not set |

No new tables required. No existing columns changed.

---

## 4. Image Storage Strategy

Images are stored on the **server filesystem**, not in MySQL. The `meals.image_path` column stores only the filename (e.g. `"a3f9b1c2.jpg"`). The `backend/uploads/` directory is gitignored — images never enter the git repo or GitHub.

### Why not MySQL BLOBs

- Bloats DB size and slows backups significantly
- MySQL is not optimized for binary retrieval
- Makes the DB hard to move or export

### Phone photo handling — Sharp compression

Phone cameras produce 3–8MB JPEGs at full resolution, which is unnecessary for a meal card display. The backend uses **Sharp** (Node.js image processing library) to resize and compress every upload before saving:

- Resize to max **1000px wide** (preserving aspect ratio)
- Re-encode as JPEG at **80% quality**
- Typical output: **150–300KB** regardless of input size

This happens server-side automatically — the user just picks a photo and uploads it normally.

### Storage layout

- Uploaded files saved to `backend/uploads/` locally in dev
- On EC2: `/var/www/meal-prep/backend/uploads/`
- `backend/uploads/` is added to `.gitignore`
- Nginx serves the folder directly at `/uploads/` (no Express hop for static files)

### New backend endpoint

```
POST /api/meals/:id/image
  Content-Type: multipart/form-data
  Field: image (the file)

  1. Receive file via multer (or similar multipart middleware)
  2. Pass buffer through Sharp → resize → compress
  3. Save to uploads/ with a UUID filename
  4. UPDATE meals SET image_path = filename WHERE id = :id
  5. Return { image_path: "abc123.jpg" }
```

### Frontend image URL construction

```typescript
const imageUrl = meal.image_path
  ? `${API_BASE_URL}/uploads/${meal.image_path}`
  : null;
```

---

## 5. Meal Detail Popup

### Trigger

Clicking the card body (anywhere except the grocery list checkbox) opens the meal detail popup for that meal.

### Layout

The popup is a full modal overlay with a scrollable inner container. Structure top to bottom:

```
┌─────────────────────────────────────────────────────┐
│  [image section — 1.5× card height, if image exists] │
│  ─────────────────────────────────────────────────── │
│  Meal Name                                [✕ close]  │
│  ★ ★ ★ ☆ ☆   [URL icon if url set]                  │
│  ─────────────────────────────────────────────────── │
│  Tags (pill toggles, same as AddMealModal)           │
│  ─────────────────────────────────────────────────── │
│  ⏱ Prep Time: [__ ] min                              │
│  ─────────────────────────────────────────────────── │
│  🔗 URL: [________________________]                   │
│  ─────────────────────────────────────────────────── │
│  📷 Image: [Choose File] [Remove]                    │
│  ─────────────────────────────────────────────────── │
│  Ingredients (same row structure as AddMealModal)    │
│  + Add ingredient                                    │
│  ─────────────────────────────────────────────────── │
│  Instructions                                        │
│  [large textarea]                                    │
│  ─────────────────────────────────────────────────── │
│                              [Cancel]  [Save]        │
└─────────────────────────────────────────────────────┘
```

### Image section

- Only rendered when the meal has an `image_path`
- Height ≈ 1.5× the meal card height (approximately 180–200px)
- Image fills the section with `object-fit: cover`
- Positioned above the meal name, inside the popup

### Star rating

- 5 clickable stars rendered inline near the meal name
- Clicking a star sets the rating (1–5)
- Clicking the currently-set star clears the rating (sets to undefined)
- Stars use filled (★) / empty (☆) display

### URL field

- Plain `<input type="url">` text field
- If a URL is saved, a link icon (🔗) appears next to the meal name on the card box (outside the popup)
- URL icon is an anchor tag `<a href={meal.url} target="_blank">` so it opens in a new tab

### Tags

- Same toggle-pill UI as `AddMealModal` — reuse or extract a shared `TagSelector` component

### Prep time

- Single number input (minutes)
- Displayed on the card box as e.g. `⏱ 30 min`

### Ingredients

- Same dynamic row structure as `AddMealModal` (name, quantity, unit, remove button)
- Pre-populated with the meal's current ingredients

### Instructions

- `<textarea>` — large, min 4 rows, resizable
- Free-form text

### Save behavior

- All edits are saved only when "Save" is clicked (not auto-saved on change)
- Updates the meal in state and persists to localStorage
- When backend meals API is wired up, also sends a `PUT /api/meals/:id` request

### New component

`frontend/src/components/MealDetailModal.tsx`

Props:
```typescript
interface Props {
  meal: Meal;
  onClose: () => void;
  onSave: (updated: Meal) => void;
}
```

---

## 6. Meal Card Box Enhancements

The card box (`MealCard.tsx`) currently shows: name + checkbox, tags, ingredient count.

### New card box layout

```
┌──────────────────────────────┐
│  Meal Name  🔗               │  ← URL icon only if meal.url is set
│  ★ ★ ★                      │  ← only if meal has been rated (no empty stars)
│  ⏱ 30 min                   │  ← only if prep_time_minutes is set
│  [tag] [tag]                 │
│  3 ingredients               │
│  □                           │  ← grocery list checkbox (no label)
└──────────────────────────────┘
```

- The grocery list checkbox: no label text, just a bare `<input type="checkbox">`
- Clicking the card body opens the detail popup
- Clicking the checkbox toggles grocery list selection (existing `stopPropagation` handles this)
- Stars on the card are **read-only** (not clickable — rating is set inside the popup)

---

## 7. Grocery List UX Changes

### Two-step flow

1. **Stage** — Checking a card's checkbox marks the meal as staged (not yet on the grocery list). Staged meals do not appear in the shopping list sidebar yet.
2. **Commit** — A banner appears at the top of the meals panel once ≥1 meal is staged. Clicking the "Add to grocery list" button in the banner moves all staged meals into the grocery list and clears the staged state.

This allows the user to check several meals across the grid before committing, rather than each check immediately modifying the list.

### Checkbox on the card

- Bare `<input type="checkbox">`, no text label
- Checked = staged (pending add to grocery list)
- `stopPropagation` so clicking it does not open the meal detail popup

### Top-of-page banner

- Appears below the filter bar, above the meal grid, when ≥1 meal is staged
- Content: **"3 meals selected — Add to grocery list"** (count updates live)
- Clicking the button commits staged meals to the grocery list
- Banner disappears after commit (no more staged meals)

### State distinction

Two separate ID sets in `Dashboard` state:
- `stagedIds: string[]` — checked but not yet committed
- `selectedIds: string[]` — committed to the grocery list (drives the sidebar)

### Clear grocery list button

Inside the `ShoppingList` sidebar, a **"Clear grocery list"** button removes all meals from `selectedIds` and empties the list. Positioned below the ingredient list, above or alongside "Copy List".

---

## 8. Files Changed or Created

| File | Change |
|---|---|
| `frontend/src/data/mockMeals.ts` | Add optional fields to `Meal` interface |
| `frontend/src/components/MealCard.tsx` | Add URL icon, conditional stars (read-only), prep time, grocery checkbox; card body click opens popup |
| `frontend/src/components/MealDetailModal.tsx` | **New** — full detail/edit popup |
| `frontend/src/components/ShoppingList.tsx` | Add "Clear grocery list" button; accepts `onClear` callback |
| `frontend/src/pages/Dashboard.tsx` | Wire up `MealDetailModal`; add `stagedIds` state; branding change; grocery banner |
| `backend/src/index.ts` or routes file | Add `POST /api/meals/:id/image`; serve `/uploads` statically |
| `backend/package.json` | Add `sharp` and `multer` dependencies |
| `backend/.gitignore` | Add `uploads/` |
| `docs/schema.md` | Document new columns |

---

## 9. Out of Scope for This Feature

- Wiring up the meals API endpoints to the database (currently stubs) — this is a separate task
- Password hashing — pre-existing gap, separate task
- Any changes to the Register or Login pages
