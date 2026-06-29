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
- lucide-vue icons
- 後端 API 透過 Vite proxy 使用 `/api`

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

## 支援的變更項目

### 001 地址變更

- Dialog 顯示該保單關聯的所有地址資料，不限定固定三筆。
- 使用者先選擇一筆資料再修改。
- 前端將選取的 `addressType` 與編輯後的地址欄位送到 `POST /api/change-cases/address-change`。
- 後端判斷實際異動欄位，並回傳 `changedFieldCount`。

### 002 主約保額變更

- 使用共用保額 Dialog 的 `main` 模式。
- Dialog 顯示保單主檔資料，並讓使用者修改 `masterInsuredAmount`。
- 前端呼叫 `POST /api/change-cases/main-amount-change`。
- 後端同時記錄主檔保額與對應主約附約列。

### 003 附約保額變更

- 使用共用保額 Dialog 的 `rider` 模式。
- Dialog 從 `rideList` 顯示附約資料，但排除 `rideType === '1'`，因為該筆代表主約。
- 前端以 `rideOrder` 傳送每筆異動附約到 `POST /api/change-cases/rider-amount-change`。
- `rideOrder` 是避免改到錯誤附約保額的 key。

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
