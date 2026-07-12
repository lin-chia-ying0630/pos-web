# POS Change Web 開發規範

## 目的

本檔規範 `pos-web` 的畫面、Store、API 與測試責任。重新設計流程或元件後，需同步更新本檔與 `readme.md`。

## 技術棧

- Vue 3、TypeScript、Vite、Vue Router。
- Pinia、Axios、Zod。
- Sass、Lucide icons。
- Vitest、Vue Test Utils、MSW、Playwright、Storybook。
- ESLint、Prettier、GitHub Actions、Docker Compose。

## 路由與角色

- `/login`：正式環境登入。
- `/change/create`：MAKER 新增保全變更。
- `/change/query`：MAKER 與 REVIEWER 查詢案件。
- `/change/review`：REVIEWER 查看異動明細並覆核。
- Route guard 第一次導頁前必須由 `authStore.initialize()` 呼叫 `/api/auth/me` 偵測後端安全模式。
- `/api/auth/me` 回覆 401/403 時導向登入；回覆 `securityEnabled=false` 時使用本機開發角色。
- Basic Auth 密碼只放目前頁面記憶體，不寫入 localStorage、Pinia persisted state 或 log。

## Pinia 分工

- `workflowStore`：loading 計數、成功訊息、錯誤訊息。
- `authStore`：登入結果與 MAKER / REVIEWER 角色。
- `policyStore`：保單查詢條件、主檔、地址、主附約與代碼。
- `changeCaseStore`：案號、案件清單、案件明細、覆核狀態。
- `addressChangeStore`：001 Dialog、郵遞區號與地址表單。
- `amountChangeStore`：002／003 共用 Dialog 與保額表單。

不要重新建立單一大型 facade store。Dialog 狀態不可塞回 `policyStore` 或 `changeCaseStore`；全域成功／錯誤訊息統一透過 `workflowStore`。

Store 互相使用時，只能在 action 內呼叫另一個 `useXxxStore()`，不要在 module top level 讀取另一個 Store，避免循環初始化。

- API 回傳、身份、案件與 workflow state 視為元件唯讀，元件不可直接覆寫，統一由 action 更新。
- 查詢條件與 Dialog form 是暫存 UI state，可以直接綁定或改由 setter action 管理；有連動清除、查詢等副作用時必須走 action。
- Pinia 只放前端流程協調與共享 UI state，不重做後端的異動判斷、狀態轉移、覆核或交易規則。
- 不為追求形式而將所有 Pinia state 包成 `readonly`；應依 server state 與 editable form state 分界。

## Component 分工

- Component 只處理呈現、focus、使用者事件與 emit。
- 表單檢核交給 Zod，API 呼叫交給 Store action。
- 不在 Component 重複組 API URL 或解析 `ResponseBodyDto`。
- Dialog 儲存成功後關閉；失敗時保留並顯示訊息。
- Icon button 使用 Lucide 並提供 `title`。
- Dialog 及表格要在 820px 以下維持可讀，不允許文字互相覆蓋。

## API

- `httpClient.ts` 統一處理 Axios、Basic Authorization、`ResponseBodyDto<T>` unwrap 與友善錯誤。
- `posChange.ts` 定義 API wrapper 與共用 payload type。
- 所有 wrapper 保留一行中文註解，說明對應畫面。
- request body 不包 `ResponseBodyDto`。
- 後端 `401/403/409` 的 `errorMessage` 必須直接顯示，不能改成模糊的 Internal Server Error。

主要 API：

- `findCurrentUser`：登入驗證與角色。
- `findPolicyDetail`：新增頁保單資料。
- `createChangeCase`：只取得案號，尚未建立受理資料。
- `saveAddressChange`：001 最新草稿。
- `saveMainAmountChange`：002 最新草稿。
- `saveRiderAmountChange`：003 最新草稿。
- `findChangeCases`：查詢／覆核清單。
- `findChangeCaseDetail`：覆核欄位與檔案快照前後值。
- `updateChangeCaseStatus`：REVIEWER 完成或取消。

## 新增流程

1. 查詢保單。
2. 選擇 `001/002/003`。
3. 取得資料庫保留的案號。
4. 開啟對應 Dialog。
5. 後端判斷實際異動；無異動顯示「未建立變更資料」。
6. 重複修改同一目標時，畫面顯示後端回傳的最新異動筆數。

前端不可把「取得案號」顯示成已建立 `P` 案件；只有儲存且真的異動後才存在受理資料。

## 覆核流程

- 清單只顯示摘要，必須點擊明細圖示取得 `PolicyChangeCaseDetail`。
- 明細顯示 `changeField / changeKey / contentBefore / contentAfter` 與檔案快照。
- 完成／取消按鈕只出現在展開的待覆核明細內。
- 呼叫 PATCH 前必須再次確認。
- HTTP 409 表示主檔或案件狀態已改變；顯示錯誤並要求重新查詢，不可自動重送。

## 001 地址與聯絡資料

- `01/02` 開啟郵遞區號與地址，鎖住 email／電話／手機。
- 其他型態反向處理。
- 郵遞區號前三碼必填，後三碼可空白；輸滿後自動移動 focus。
- 修改前三碼要清除後三碼與舊地址，再帶入新縣市區。
- API 失敗時可由目前保單相同前三碼地址推導中文前綴。
- 未修改或改回原值時，後端應回傳 `changedFieldCount = 0`。

## 002／003 保額

- 共用 `AmountChangeDialog`，以 `main`／`rider` 模式區分。
- 002 只修改主約保額。
- 003 排除主約列，每筆 payload 必須包含 `rideOrder`。
- 總保費只顯示，不提供編輯控制。

## Zod

- 查詢、地址、主約與附約規則集中在 `changeCaseSchemas.ts`。
- 元件或 Store 不重複寫相同必填、格式或金額範圍規則。
- 新增 schema 規則時同步補 Vitest。

## 測試

- Vitest：schema、API client、Store 與純函式。
- MSW：Vitest 與 Storybook 共用 mock，較明確路由必須放在動態廣泛路由之前。
- Storybook：Dialog、清單、狀態與覆核明細的代表狀態。
- Playwright：至少覆蓋「有異動才建檔」、「展開明細後覆核」與「受保護頁自動導向登入」。
- Playwright route pattern 只能攔截 `/api/`，不可攔截 Vite 的 `/src/api/` module。

## Docker 與環境

- 前端 image 不包含 Security build-time 參數；權限模式只能在 runtime 透過 `/api/auth/me` 判斷。
- nginx 透過 `pos-change-api:8081` 代理 `/api/`。
- 前端、API、MySQL 以 `compose.yaml` 一起啟動。
- `.env` 不提交 Git；新增環境欄位時同步更新 `.env.example`。

## 驗證指令

```bash
npm run format:check
npm run lint
npm run test:unit
npm run build
npm run build-storybook
npm run test:e2e
docker compose config
```
