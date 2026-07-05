# POS Change Web 技能說明

## 目的

`pos-web` 是 POS 保全變更流程的 Vue 3 前端。畫面提供三個作業區：

- `新增保全變更`：查詢保單資料、選擇變更項目、產生受理中案號，接著儲存選定的變更內容。
- `查詢保全變更`：依保單號碼查詢既有保全受理資料。
- `覆核`：完成或取消受理中案件。只有這個作業區可以將狀態從 `P` 改成 `S` 或 `C`。

## 技術棧

- Vue 3 Composition API
- TypeScript
- Vite
- Vue Router
- Pinia
- lucide-vue icons
- 後端 API 透過 Vite proxy 使用 `/api`

## 前端架構

- `src/router/index.ts`：定義新增、查詢、覆核三個路由。
- `src/stores/posChangeStore.ts`：集中管理保單查詢結果、目前案號、受理資料清單、loading 與訊息狀態。
- `src/api/posChange.ts`：封裝後端 API 呼叫與共用 payload types。
- 地址型態、受理狀態、變更項目中文顯示來自後端 `code_description`，前端不硬寫代碼對照表。
- `src/views/CreateChangeView.vue`：新增保全變更頁，包含 001/002/003 編輯 Dialog。
- `src/views/ChangeCaseListView.vue`：查詢與覆核共用清單頁。
- `src/views/QueryChangeView.vue`：保全變更查詢頁。
- `src/views/ReviewChangeView.vue`：保全變更覆核頁。

## 主畫面流程

1. 使用者輸入 `保單號碼` 與 `序號`。
2. 前端呼叫 `GET /api/policies/{policyNo}/{policySeq}`。
3. 畫面顯示保單主檔與通訊地址。
4. 使用者選擇變更項目並點擊 `產生案號`。
5. 前端呼叫 `POST /api/change-cases`，後端回傳 `P` 受理中案號。
6. 前端依變更項目開啟對應編輯視窗：
   - `001`：地址變更
   - `002`：主約保額變更
   - `003`：附約保額變更

## API 與畫面對應

| 前端 API wrapper | 後端 API | 對應畫面 | 用途 |
| --- | --- | --- | --- |
| `findPolicyDetail` | `GET /api/policies/{policyNo}/{policySeq}` | 新增保全變更頁 | 查詢保單主檔、通訊地址、地址清單與主附約資料。 |
| `findPostalCodeArea` | `GET /api/postal-codes/{postalCode}` | 地址變更 Dialog | 依郵遞區號前三碼或 3+3 郵遞區號帶入中文全型地址前綴與英文半形地址前綴。 |
| `createChangeCase` | `POST /api/change-cases` | 新增保全變更頁 | 產生 P-受理中案號。 |
| `saveAddressChange` | `POST /api/change-cases/address-change` | `001` 地址變更 Dialog | 儲存地址異動。 |
| `saveMainAmountChange` | `POST /api/change-cases/main-amount-change` | `002` 主約保額變更 Dialog | 儲存主約保額異動。 |
| `saveRiderAmountChange` | `POST /api/change-cases/rider-amount-change` | `003` 附約保額變更 Dialog | 儲存附約保額異動。 |
| `findChangeCases` | `GET /api/policies/{policyNo}/change-cases` | 查詢保全變更頁與覆核頁 | 查詢既有受理資料。 |
| `updateChangeCaseStatus` | `PATCH /api/change-cases/{changeCaseNo}/status` | 覆核頁 | 將 `P` 改為 `S` 或 `C`。 |

## 路由

- `/change/create`：新增保全變更。
- `/change/query`：查詢保全變更。
- `/change/review`：覆核。
- `/`：自動導向 `/change/create`。

## 支援的變更項目

### 001 地址變更

- Dialog 顯示該保單關聯的所有地址資料，不限定固定三筆。
- 使用者先選擇一筆資料再修改。
- 儲存成功後關閉 Dialog；儲存失敗時保留 Dialog 並顯示錯誤。
- 郵遞區號畫面分成前 3 碼與後 3 碼兩個欄位，前三碼必填，後三碼可空白。
- 郵遞區號前 3 碼輸滿後自動跳到後 3 碼；後 3 碼輸滿後自動跳到地址全型。
- 3+3 郵遞區號查詢後：
  - 地址全型帶入中文縣市區。
  - 地址半形帶入英文縣市區。
  - 使用者需補完整地址。
- 使用者重新 keyin 前 3 碼時，後 3 碼與舊地址內容會先清空，再依前三碼重新帶入 code table 地址前綴。
- 若郵遞區號 API 暫時無回應，前端可先從目前保單地址清單中相同前三碼的地址推導前綴，避免畫面空白。
- 前端將選取的 `addressType` 與編輯後的地址欄位送到 `POST /api/change-cases/address-change`。
- 後端判斷實際異動欄位，並回傳 `changedFieldCount`。

### 002 主約保額變更

- 使用共用保額 Dialog 的 `main` 模式。
- Dialog 顯示保單主檔資料，並讓使用者修改 `masterInsuredAmount`。
- 儲存成功後關閉 Dialog；儲存失敗時保留 Dialog 並顯示錯誤。
- 保單主檔上方只顯示保單號碼、序號與總保費；主約險種、主約年期、主約保額不在主檔摘要區顯示。
- 總保費不可在畫面直接修改。
- 前端呼叫 `POST /api/change-cases/main-amount-change`。
- 後端同時記錄主檔保額與對應主約附約列。

### 003 附約保額變更

- 使用共用保額 Dialog 的 `rider` 模式。
- Dialog 從 `rideList` 顯示附約資料，但排除 `rideType === '1'`，因為該筆代表主約。
- 儲存成功後關閉 Dialog；儲存失敗時保留 Dialog 並顯示錯誤。
- 前端以 `rideOrder` 傳送每筆異動附約到 `POST /api/change-cases/rider-amount-change`。
- `rideOrder` 是避免改到錯誤附約保額的 key。
- 若後端覆核完成時主附約檔保費異動，主檔總保費由主附約檔保費加總回寫。

## 覆核規則

- 新增保全變更只會保留 `P`。
- 新增頁不可將案件標記為完成或取消。
- 覆核頁可以變更：
  - `P` 改 `S`：完成並套用變更。
  - `P` 改 `C`：取消且不套用變更。
- 已經是 `S` 或 `C` 的資料列會停用覆核按鈕。

## API 回覆格式

所有後端回覆預期使用 `ResponseBodyDto<T>`：

```ts
type ResponseBodyDto<T> = {
  success: boolean
  message: string
  massageCode: string
  errorMessage: string
  data: T
}
```

前端 request body 不需要包 `ResponseBodyDto`。

共用 `request<T>()` helper 會在回傳符合 `ResponseBodyDto` 格式時取出 `data`。HTTP error 時，錯誤訊息顯示順序為 `errorMessage`、`message`、HTTP status text。

## 本機指令

```bash
npm install
npm run dev
npm run build
```

預設本機瀏覽器網址：

```text
http://localhost:5173/
```

如果 `5173` 已被使用，Vite 可能會改用其他 port，例如 `5174`。
