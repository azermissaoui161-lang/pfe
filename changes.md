# ERP Project — Changes & Bug Fixes

Backend
Fixed stock checks and stock deduction after sales.
Fixed stock movement creation after invoice validation.
Fixed revenue, sales, and stock dashboard calculations.
Fixed credit note validation issue.
Fixed notification saving and read tracking.
Fixed product soft delete.
Fixed audit log validation for payments and transactions.
Fixed product linking in stock movements.
Removed debug logs exposing sensitive data.
Fixed CORS for PATCH requests.
Fixed server startup behavior when database is unavailable.
Added missing finance routes.
Fixed broken Mongoose hooks after upgrade.
Added all missing backend endpoints used by the frontend.
Fixed silent error handling in product routes.

Estimated backend effort: 26–32 hours

Database / models
Added missing schema fields.
Added missing enum values.
Fixed model references and relations.
Updated hooks for Mongoose 9 compatibility.
Fixed seed data to match schemas.
Fixed duplicate customer IDs in seed.
Fixed seeded password hashing.
Fixed reset script environment variable.

Estimated database effort: 14–18 hours

Frontend
Fixed API URL environment variable.
Replaced fake account creation with real API call.
Fixed role field with valid dropdown values.
Reworked dashboards to use real backend data.
Added missing user service methods.
Removed leftover debug code.

Estimated frontend effort: 12–16 hours


MAB
---

## Backend Fixes

1. **Stock field had the wrong name everywhere.** The invoice controller was checking `product.currentStock` but the database field is just called `product.stock`. This meant the stock check always passed silently (you could sell items you didn't have), and stock never actually decreased after a sale. Fixed all references to use the correct field name.

2. **Creating a stock movement after a sale was crashing.** The invoice controller was passing a MongoDB object ID as the product name when creating a stock movement record. The model expects a plain text product name. Also the reason was set to `'vente'` which isn't a valid value — fixed to `'sale'`. Both corrected.

3. **Revenue and sales figures were all showing zero.** The dashboard was grouping invoices by `$total` but the field is called `$totalTTC`. Every financial summary was computing zero. Fixed throughout the dashboard controller.

4. **All stock statistics were returning zero or null.** The stock dashboard was referencing fields like `$currentStock`, `$purchasePrice`, `$sellingPrice`, and `$alertThreshold` — none of which exist. The real field names are `$stock`, `$price`, and `$minStock`. All corrected.

5. **Creating a credit note always failed with a validation error.** When creating a credit note, both the issue date and due date were set to right now, making them identical. The model requires the due date to be after the issue date, so every credit note creation rejected. Fixed by setting the due date to the next day.

6. **Notification types were rejected by the database.** Some parts of the code were saving notifications with types like `'facture_emise'` and `'paiement_valide'` that weren't in the allowed list. These were silently dropped. Added the missing types to the model and corrected the invalid ones.

7. **Notification read timestamps were never actually saved.** The notification controller was setting a `readAt` field that didn't exist in the model schema. Mongoose quietly ignored it. Added the `readAt` field to the model so read times are properly recorded.

8. **Soft-deleting a product did nothing.** The product controller was setting `deletedAt`, `deletedBy`, and `updatedBy` fields that weren't defined in the schema. Mongoose ignored them silently, so deleted products were never actually marked. Added the missing fields to the model.

9. **Audit log rejected payment and transaction entries.** The audit log model's entity list didn't include `'PAYMENT'` or `'TRANSACTION'`, so any time a payment or transaction was logged, it failed validation. Added the missing values.

10. **Stock movement populate was silently failing.** The dashboard was calling `.populate('product')` on stock movements but the reference field is named `productId`. The populate did nothing and returned no linked product data. Fixed to use the correct field name.

11. **The server was logging every request body including passwords.** A debug middleware was left in that printed the full body of every incoming request to the console — including the password field during login. Removed it.

12. **PATCH requests were being blocked by CORS.** The CORS configuration was missing `PATCH` from the allowed HTTP methods list. Any frontend call using PATCH (like marking notifications as read or validating invoices) would be blocked by the browser. Added `PATCH` to the allowed methods.

13. **The server kept running silently after a database connection failure.** If MongoDB was unreachable at startup, the server continued running but couldn't serve any data. Added a proper exit so the process stops with a clear error when the database is unavailable.

14. **Debug console logs were leaking sensitive data.** The login controller was logging the request body (which includes the password) on every login attempt. Removed these debug logs.

15. **Finance routes were missing entirely.** The frontend was calling endpoints like `/finance/cashflow`, `/finance/profit-loss`, `/finance/balance-sheet`, `/finance/ratios`, and `/finance/forecasts` but none of these routes existed in the backend. They were added and connected to the finance controller.

16. **All Mongoose model hooks were broken after upgrading to Mongoose 9.** Every single model (User, Customer, Invoice, StockMovement, Transaction, Account, Budget, Order) used the old hook pattern `function(next) { ...; next(); }`. Mongoose 9 no longer passes a `next` argument to hooks, so calling it threw `TypeError: next is not a function` and crashed the server on every save operation. All hooks across 8 model files were converted to the new pattern: synchronous hooks just return, async hooks use throw for errors.

17. **The `validate` method on the Transaction model conflicted with Mongoose internals.** A custom method was named `validate` which overwrote Mongoose's own built-in document validation method. This caused unpredictable behavior when saving transactions. Renamed to `approveTransaction`.

18. **The seed data didn't match the model schemas and caused startup errors.** The initial data loaded at startup had several mismatches: suppliers were missing required fields `contact` and `phone`, accounts used enum values like `'capitaux_propres'` that don't exist in the schema, customers were missing required address fields, and the required `createdBy` field was absent. All seed data was rewritten to match the actual model definitions exactly.

19. **Multiple customers got the same auto-generated ID when seeded together.** When creating several customers at once, they all ran the ID counter check simultaneously before any had saved, so they all got the same number and hit a duplicate key error. Fixed by assigning explicit unique customer numbers in the seed data.

20. **Users in the seed couldn't log in because passwords weren't hashed.** The `User.create()` method was being used to insert seed users but the bcrypt hashing hook wasn't running correctly during bulk creation. Switched to `User.insertMany()` with passwords pre-hashed using `bcrypt.hash()` directly, so the stored passwords are always valid bcrypt hashes regardless of hook behavior.

21. **The user reset script used the wrong environment variable name.** The script that resets users was connecting to MongoDB using `process.env.MONGO_URI` but the actual variable in the config is `MONGODB_URI`. The script always failed silently. Fixed the variable name.

22. **Notification "mark all as read" used the wrong HTTP method.** The backend defined the route as `PUT /notifications/read-all` but the frontend was calling it with `PATCH`. The route was never matched. Changed the backend route to `PATCH` to match the frontend.

23. **About 30 API endpoints called by the frontend had no backend implementation.** After a full audit, the following features had frontend service functions but no matching backend routes — the calls would just 404:
    - Notifications: mark as unread
    - Transactions: filter by account, filter by date range, export to CSV
    - Orders: get recent orders, cancel an order, generate a quote
    - Suppliers: stats, search by name, list products for a supplier
    - Payments: cancel a payment, export payments
    - Products: search by name
    - Customers: search by name
    - Accounts: search by name
    - Budgets: get variance for a budget, get overall summary
    - Categories: list products in a category
    - Stock: movement history
    - Users: stats, search, list roles, reset password, export
    - All module management routes (4 endpoints — the entire module was missing)

    All of these endpoints were implemented in the respective controllers and registered in the routes.

24. **Error handling in the product routes was swallowing errors silently.** A `safeHandler` wrapper in `productRoutes.js` was catching errors but not forwarding them to Express's error handler. Bugs in the product controller would disappear without any response to the client. Fixed to properly call `next(err)` so errors reach the global handler.

---

## Frontend Fixes

25. **The environment variable for the API URL used the wrong prefix.** The `.env` file used `REACT_APP_API_URL` which is a Create React App convention. This project uses Vite, which requires the `VITE_` prefix. The variable was never loaded. Fixed to `VITE_API_URL`. (The app worked anyway because the default fallback URL was correct, but this is now properly configured.)

26. **The "Create Account" form was fake — it never actually created anything.** Clicking save just ran a `setTimeout` that printed to the console and showed a fake success message. No data was sent to the server. Replaced with a real API call using `userService.create()`.

27. **The role field in the create account form accepted free text.** Users could type anything as a role, which would fail backend validation since roles are a strict list. Changed to a dropdown with only the four valid roles.

28. **All four dashboards showed hardcoded fake data.** The Finance dashboard showed 3 fictional transactions from January 2024. The Billing dashboard showed "Client A", "Client B", "Client C". The Stock dashboard showed "Product A", "Product B", "Product C". The Admin dashboard was a single line of welcome text. All four were completely rewritten to load real data from their respective APIs, with loading states and error handling.

29. **Two methods were missing from the user service.** The `CreateAccount` form needed `userService.create()` and the Admin dashboard needed `userService.getAll()`, but neither method existed. Both were added.

30. **A leftover debug comment was in the finance service.** A line of question marks `//????????????????????????????????????????` was left in `financeService.js`. Removed.
