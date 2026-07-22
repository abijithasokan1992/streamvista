# Test Matrix

| Area | Component | Test Type | Description | Status |
|---|---|---|---|---|
| Routing | `ProtectedRoute` | Unit/E2E | Verify unauthenticated users redirect to `/login`. | Pending |
| Routing | `ProtectedRoute` | Unit/E2E | Verify users are blocked from unauthorized routes (e.g. `buyer` attempting to access `/finance` redirects to `/unauthorized`). | Pending |
| Services | `mockAuthService` | Unit | Ensure login returns valid mock payload. | Pending |
| Services | `mockDatabaseService` | Unit | Ensure `getTitlesByBuyer()` returns filtered payload based on assignment. | Pending |
| UI | `RoleSwitcher` | Visual | Ensure switcher renders only when `VITE_DATA_MODE=mock`. | Passed |
| Build | Typescript | Build | Validate strict TS compliance without `any` regressions. | Passed |
| Rules | `firestore.rules` | Emulator | Run Firebase Emulator suite tests to verify read/write constraints. | Pending |
| Rules | `storage.rules` | Emulator | Validate role-checked storage path restrictions. | Pending |
