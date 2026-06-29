# Project Specification: Bento Meal Prep App

## Overview
A web-based meal prep and cookbook application built for personal and close-friend use. The app allows authenticated users to manage a catalog of meals, select meals to dynamically generate a consolidated shopping list, and copy that list for grocery shopping.

## Architecture & Tech Stack
- **Frontend:** React (SPA)
- **Backend:** Node.js with Express
- **Database:** Relational (RDS PostgreSQL/MySQL managed via Sequelize or Prisma)
- **Deployment Target:** AWS EC2 (Frontend/Backend) & AWS RDS (Database)

## UI & Styling
- **Layout:** Bento-box style grid layout.
- **Color Palette:** Mint green primary accents with a clean, modern, minimalist aesthetic.
- **Responsiveness:** Desktop-first, with a clean floating side-panel layout.

---

## Database Schema Requirements (To Be Normalized)
1. **Users Table:** Standard auth fields (id, username, password_hash).
2. **Meals Table:** id, user_id (FK), name, description/instructions, created_at.
3. **Ingredients Table:** id, name (unique/normalized where possible).
4. **Meal_Ingredients Table (Join Table):** meal_id (FK), ingredient_id (FK), quantity, unit (e.g., lbs, oz, items).
5. **User_Selected_Meals Table:** Tracks which meals a user currently has selected for their active shopping list so state persists across sessions.

---

## Features & Functional Requirements

### 1. Registration & Authentication Gate
- Users must be authenticated to view, add, or interact with data.
- **Registration Barrier:** To prevent public registration, the registration form requires a hardcoded signup passcode: `meal-prep-passcode`.
- If the passcode is correct, they can create a unique account (username/password).
- User data (meals and selected list state) must be isolated to that specific logged-in user.

### 2. Main Dashboard (Bento Grid Layout)

#### Component A: Meals Catalog (Main Panel - Left/Center)
- Displays all meals owned by the user, ordered **alphabetically**.
- Includes a filter/sort mechanism by tags (e.g., Breakfast, Dinner, High Protein).
- Each meal card has a selection mechanism (checkbox or toggle).
- Selecting a meal immediately adds its structured ingredients to the active shopping list state and persists it to the DB.

#### Component B: Consolidated Ingredients List (Floating Sidebar - Right)
- Displays a consolidated list of ingredients compiled from all currently selected meals.
- **Requirement:** Identical ingredients with matching units must automatically aggregate/sum their quantities (e.g., 1 lb chicken + 2 lbs chicken = 3 lbs chicken).
- Ingredients within this list should display in a clean, scannable format.
- Includes a **"Copy List"** button that copies the plain-text consolidated shopping list to the user's clipboard.

#### Component C: Add Meal Modal (Trigger Button)
- A prominent button that opens a popup/modal to add a new meal.
- Fields required: Meal Name, Tags, and a dynamic form to add multiple ingredients.
- Each ingredient row in the form must capture: Ingredient Name, Quantity, and Unit.

---

## Development Roadmap for Claude Code
1. **Scaffold Project:** Initialize React frontend and Express backend directory structure.
2. **Authentication Setup:** Implement JWT or session-based auth incorporating the `meal-prep-passcode` registration gate.
3. **UI Skeleton:** Build out the Mint Green Bento grid layout with dummy data to verify the responsive panels.
4. **Database Migration:** Generate and run the normalized schema migrations on RDS based on the finalized UI data requirements.
5. **API Implementation:** Build REST endpoints for CRUD operations on meals, fetching consolidated ingredients, and saving the selected list state.
6. **Frontend Integration:** Connect React components to the API and implement the ingredient aggregation logic.