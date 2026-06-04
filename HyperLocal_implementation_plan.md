# Multi-Service Platform Transformation Plan

This document outlines the proposed changes to evolve the current Hyperlocal Commerce Platform from a single-service food delivery app to a multi-service platform supporting grocery, utensils, clothes, and more.

## User Review Required

> [!WARNING]
> **Refactoring Scope Decision**
> The current codebase relies heavily on the term `store` (e.g., the service directory is `services/store`, variables are `stores`, API endpoints are `/api/store/*`). 
> 
> We have two choices for this transformation:
> **Option 1 (Recommended for MVP): Logical Separation (Fast)**
> We add a `serviceType` field (e.g., 'grocery', 'clothes', 'food') to the existing `Store` database model without renaming the backend folder structure or API base paths. The frontend will dynamically say "Store" instead of "Store", but the backend will still use the `store` naming convention internally.
> 
> **Option 2: Full Naming Refactor (Comprehensive but time-consuming)**
> We rename all instances of `store` to `store` or `vendor` across the entire codebase. This involves renaming microservice directories, docker configurations, API paths, and database models.
> 
> **Please let me know which option you prefer. Option 1 is mapped out below.**

## Proposed Changes (Based on Option 1)

### Backend: Database & API Updates

We will introduce a `serviceType` classification to the main vendor model.

#### [MODIFY] services/store/src/models/Store.ts
- Add a new field `serviceType` to the schema and `IStore` interface.
- Allowed values (enum): `['food', 'grocery', 'utensils', 'clothes', 'electronics']`.
- Set default value to `food` for backwards compatibility.

#### [MODIFY] services/store/src/controllers/store.ts
- Update the `getAllStores` controller to accept a `serviceType` query parameter.
- Filter the database queries based on the provided `serviceType`.

#### [MODIFY] services/admin/src/controllers/admin.ts (or equivalent vendor registration controller)
- Update the vendor registration logic to accept and save the `serviceType`.

---

### Frontend: UI & Navigation Updates

We will update the UI to allow users to navigate between different service types.

#### [MODIFY] frontend/src/pages/Home.tsx
- Add a Service Category navigation bar (e.g., chips/buttons for Food, Grocery, Clothes, Utensils).
- Update the `fetchStores` API call to pass the selected `serviceType`.
- Render the generic `StoreCard` as a `StoreCard` conceptually, dynamically displaying context depending on the category.

#### [MODIFY] frontend/src/types.ts
- Update the `IStore` type to include `serviceType`.

#### [MODIFY] frontend/src/components/AddStore.tsx
- Add a dropdown input for `serviceType` when a new vendor registers.
- Change labels from "Store Details" to "Store Details".

#### [MODIFY] frontend/src/components/StoreCard.tsx
- Rename display text contextually or generally to "Store".

## Verification Plan

### Automated Tests
- Build all microservices using Docker/TypeScript to ensure no type errors were introduced during schema changes.

### Manual Verification
1. Register a new vendor and select a category (e.g., 'grocery').
2. Log in as a user and navigate the Home page categories.
3. Verify that filtering by 'grocery' only shows grocery stores, and filtering by 'food' only shows stores.
4. Add a "product" (previously menu item) to the grocery store and ensure the checkout flow works identically for all categories.
