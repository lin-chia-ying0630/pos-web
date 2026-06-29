# POS Change Web Rename Notes

## Naming Principle

Frontend type names describe what the UI uses, not only what one API response returns. Shared payload types should not be named as one-off `Response` classes unless they truly represent the response envelope.

## Response Envelope

Use only one response wrapper name:

- `ResponseBodyDto<T>`: backend response envelope.

Do not wrap request payloads in `ResponseBodyDto`.

## Frontend Shared Types

Current shared UI/API payload names in `src/App.vue`:

- `PolicyMaster`: policy master data.
- `PolicyAddress`: policy address data.
- `PolicyRide`: policy rider/main-ride data.
- `CodeDescription`: code table item for change-item labels.
- `PolicyDetail`: lookup result used by the create page and edit dialogs.
- `ChangeCase`: newly generated case number data.
- `PolicyChangeCase`: existing acceptance case row for query/review.

These names are intentionally not `*Response`, because the same data can be used by page state, dialogs, tables, and review actions.

## Prior Rename Direction

Backend DTO names were moved away from response-only naming. Frontend should follow the same idea:

- Avoid `PolicyDetailResponse` in frontend state.
- Use `PolicyDetail` for policy lookup data.
- Avoid `CreateChangeCaseResponse` in frontend state.
- Use `ChangeCase` for generated case data.
- Avoid `AddressChangeResponse` when only `changedFieldCount` is needed.
- Use an inline result type or a shared change-result type if reused later.

## Change Item Naming

Business codes stay numeric in API payloads and comparisons:

- `001`: address change.
- `002`: main policy insured amount change.
- `003`: rider insured amount change.

UI labels can be Chinese, but request payload values should remain the numeric codes.

## Amount Dialog Naming

`002` and `003` share the same amount dialog. The mode decides behavior:

- `amountDialogType = 'main'`: show master policy amount and call main amount API.
- `amountDialogType = 'rider'`: show rider list and call rider amount API.

The rider amount payload must include `rideOrder`; this is the key field used by the backend to update the correct row.

## Status Naming

Acceptance status values:

- `P`: pending, shown as `P - 受理中`.
- `S`: completed, shown as `S - 完成`.
- `C`: cancelled, shown as `C - 取消`.

Only the review page should call the status update API.

## File Ownership

- `src/App.vue`: page state, UI flow, API calls, and local TypeScript types.
- `src/style.css`: layout and visual styling.
- `src/main.ts`: Vue app bootstrap.
- `vite.config.ts`: Vite and backend proxy settings.

If the app grows, split in this order:

1. Move API request helper and DTO types into `src/api`.
2. Move address dialog into a component.
3. Move amount dialog into a component.
4. Move review table into a component.
