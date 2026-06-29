# POS Change Web Skill

## Purpose

`pos-web` is the Vue 3 front end for the POS policy-change workflow. It provides three operator workspaces:

- `新增保全變更`: look up policy data, choose change item, create a pending case number, then save the selected change.
- `查詢保全變更`: query existing change cases by policy number.
- `覆核`: approve or cancel pending change cases. Only this workspace changes status from `P` to `S` or `C`.

## Stack

- Vue 3 Composition API
- TypeScript
- Vite
- lucide-vue icons
- Backend API is proxied from Vite through `/api`

## Main Screen Flow

1. User enters `保單號碼` and `序號`.
2. Front end calls `GET /api/policies/{policyNo}/{policySeq}`.
3. Screen shows policy master data and communication address.
4. User selects change item and clicks `產生案號`.
5. Front end calls `POST /api/change-cases`; backend returns a `P` pending case number.
6. Front end opens the matching edit dialog:
   - `001`: address change
   - `002`: main policy insured amount change
   - `003`: rider insured amount change

## Supported Change Items

### 001 Address Change

- Dialog shows all address-related rows linked to the policy, not only three fixed rows.
- User selects one row before editing.
- Front end sends the selected `addressType` and edited address fields to `POST /api/change-cases/address-change`.
- Backend decides which fields changed and returns `changedFieldCount`.

### 002 Main Policy Amount Change

- Uses the shared amount dialog in `main` mode.
- Dialog shows master policy data and lets the user edit `masterInsuredAmount`.
- Front end calls `POST /api/change-cases/main-amount-change`.
- Backend records both the master amount and the matching main ride row.

### 003 Rider Amount Change

- Uses the shared amount dialog in `rider` mode.
- Dialog lists rider rows from `rideList`, excluding `rideType === '1'` because that row is the main contract.
- Front end sends each changed rider by `rideOrder` to `POST /api/change-cases/rider-amount-change`.
- `rideOrder` is the key used to avoid changing the wrong rider amount.

## Review Rules

- New change cases remain `P`.
- Create page must not mark a case as complete or cancelled.
- Review page can change:
  - `P` to `S`: complete and apply changes.
  - `P` to `C`: cancel without applying changes.
- Rows that are already `S` or `C` disable the review buttons.

## API Response Contract

All backend responses are expected to use `ResponseBodyDto<T>`:

```ts
type ResponseBodyDto<T> = {
  success: boolean
  message: string
  massageCode: string
  errorMessage: string
  data: T
}
```

Frontend request bodies are not wrapped in `ResponseBodyDto`.

The shared `request<T>()` helper unwraps `data` when a `ResponseBodyDto` shape is returned. When an HTTP error happens, it shows `errorMessage`, then `message`, then the HTTP status text.

## Local Commands

```bash
npm install
npm run dev
npm run build
```

Default local browser URL:

```text
http://localhost:5173/
```

If port `5173` is already used, Vite may move to another port such as `5174`.
