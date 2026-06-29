# Database Schema

Database: `meal_prep` (MySQL)

---

## Tables

### `users`
Stores authenticated user accounts.

| Column | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PRIMARY KEY | |
| username | VARCHAR(50) | unique, not null |
| password_hash | TEXT | not null |
| created_at | DATETIME | default current_timestamp |

---

### `meals`
Meals owned by a user.

| Column | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PRIMARY KEY | |
| user_id | INT | FK → users.id |
| name | VARCHAR(100) | not null |
| tags | JSON | e.g. `["Breakfast", "High Protein"]` |
| instructions | TEXT | optional |
| created_at | DATETIME | default current_timestamp |

---

### `ingredients`
Normalized ingredient names (shared across all meals).

| Column | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PRIMARY KEY | |
| name | VARCHAR(100) | unique, not null |

---

### `meal_ingredients`
Join table linking meals to ingredients with quantity/unit.

| Column | Type | Notes |
|---|---|---|
| id | INT AUTO_INCREMENT PRIMARY KEY | |
| meal_id | INT | FK → meals.id |
| ingredient_id | INT | FK → ingredients.id |
| quantity | DECIMAL(8,2) | not null |
| unit | VARCHAR(20) | e.g. lbs, oz, cups, items |

---

### `user_selected_meals`
Persists which meals a user has active in their shopping list.

| Column | Type | Notes |
|---|---|---|
| user_id | INT | FK → users.id |
| meal_id | INT | FK → meals.id |
| PRIMARY KEY | (user_id, meal_id) | composite |

---

## Indexes

| Index | Table | Column |
|---|---|---|
| idx_meals_user | meals | user_id |
| idx_meal_ing_meal | meal_ingredients | meal_id |
| idx_selected_user | user_selected_meals | user_id |

---

## Relationships

```
users ──< meals ──< meal_ingredients >── ingredients
users ──< user_selected_meals >── meals
```
