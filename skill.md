# POS Change Web 開發規範

使用者授權頁的新增模式必須建立新帳號，欄位包含使用者 ID、初始密碼、啟用狀態與角色；不可退回只能選既有帳號的下拉選單。修改模式只提供唯讀使用者 ID、啟用狀態與角色，不得回傳或修改密碼。重設密碼須使用獨立視窗、輸入兩次並於完成或失敗後清除前端值。帳號主清單、畫面授權明細與覆核中心清單皆須顯示後端提供的新增／更新人員及時間，缺值統一顯示 `-`。

`ChangeCaseListPanel` 的保全受理清單固定每頁 10 筆，必須使用共用 `PaginationBar`；新查詢重設為第 1 頁，切頁時關閉已開啟的明細，但保留查詢條件。

## 強制資安產碼規則

所有前端產碼必須遵循根目錄 `目前所有的資安弱點.md`、Vue Security 與最新 OWASP/CWE/NIST 基準。

- 不可信文字只用 Vue 插值或 `textContent`；禁 `v-html`、`innerHTML`、`document.write`、`eval`、`new Function`。
- 密碼、Basic/JWT、PII 不得進 Web Storage、URL、analytics 或 log；憑證只留分頁記憶體，重整即登出。
- path/query 要編碼；禁止把輸入直接組成 href、style、事件、script 或外部資源 URL。
- Route guard、隱藏/disabled 只是 UX；敏感操作仍由 API 驗證角色、功能碼、物件及欄位。
- API/第三方資料視為不可信，以 schema 驗證型別、長度、enum、null，只顯示必要欄位。
- 表單與列表限制長度、範圍、筆數、檔案及重複送出；後端仍是最終驗證者。
- 新依賴查來源及漏洞、鎖版並更新 lockfile；前端環境變數不得保存真正秘密。
- 測試 XSS、惡意 URL、錯誤型別、401/403、重複提交及重整登出；正式站維持安全標頭。

代碼對照 CDC 僅存在後端資料平台；前端不得直接訂閱 Kafka/Debezium 或建立第二份永久代碼表。畫面一律透過 API 取得已授權資料，必要快取需有版本/失效機制，查無中文仍回退原始英文 key 或代碼值。

代碼對照表的 `main-code` 中文名稱由 API 提供；群組資料統一每頁 20 筆。

## 清單與表格設計風格

- 所有桌面版多欄位清單統一採用「一筆資料一行、一個欄位一格」的呈現方式，表頭與資料欄位必須垂直對齊。
- 欄位總寬度超過畫面時，必須在表格容器提供可見的底部橫向拉軸，讓使用者左右查看完整資料。
- 查詢結果表格本身必須包在可橫向捲動的容器內，超寬內容不得穿出面板、覆蓋邊框或造成整個頁面水平位移。
- 代碼對照表、保單主檔、地址與主附約查詢必須共用 `ScrollableRecordTable`，由各畫面只提供欄位 key、型態、欄寬與資料列；操作按鈕使用欄位插槽，橫向拉軸、固定欄寬、單行內容及數字對齊不可在各畫面重複實作。
- `ScrollableRecordTable` 的欄位設定值是最低寬度；欄位較少時必須以 `minmax(..., 1fr)` 平均填滿資訊卡，欄位較多時才超出並顯示橫向拉軸，不得在操作欄右側保留大面積無效空白。
- 保單主檔、地址、主附約摘要必須共用 `PolicyEntitySummary`，CRUD mode、metadata form、刷新與覆核導頁必須共用 `usePolicyMaintenance`；各頁只設定 entity、功能代碼及 API 函式。
- 彈窗的遮罩、ARIA、標題列及關閉行為共用 `DialogShell`；業務表單內容保留在各自元件。分頁列共用 `PaginationBar`，最多顯示目前頁附近 7 個頁碼，固定單排，窄畫面只在分頁列內水平捲動。
- 所有資料欄位名稱禁止在頁面寫死中文。共用表格、維護彈窗與覆核明細一律以欄位 key 查詢 `CHT-code`；查無對照時顯示原始英文 key。
- 字級、輸入高度、按鈕高度、表格列高、欄寬級距與主色使用 `style.scss` 全域 design token；頁面不得自行複製另一組尺寸。
- 不得為了塞入畫面而把同一筆資料折成兩行、讓表頭自動流到下一列、任意縮小欄寬，或將不同欄位用斜線合併在同一格。
- 所有共用清單的欄寬由後端 metadata 的型態、長度／精度，經 `fieldWidthToken` 轉成 `compact/normal/wide`，再由 SCSS design token 決定像素；各頁不得依欄位 key 寫像素寬度或另建對照。API metadata 尚未提供時只允許依目前資料長度作顯示回退，完整規則見 `前端欄位長度定義.md`。
- 保單維護表單的資料長度不得寫死在 View；`PolicyMaintenanceDialog` 必須使用 metadata API 的 `maxLength`，並把 `description` 顯示在欄位下方。metadata 來自 `main.code_definition` 的 `UI-field-*` 群組；未建立設定即略過動態檢查。
- `policyContractId`、`addressId`、`coverageId` 等 UUID 屬於後端關聯與稽核使用的技術識別碼；API 型別可保留，但一般查詢表格與 CRUD 表單不得顯示或要求使用者輸入。
- 查詢條件若尚未使用 metadata，其共用容量只能定義在 `src/domain/domainConstraints.ts`，頁面不得各自寫死。現行保單號碼為 20 碼；地址類型 8 碼、地址內容 300 字、保障項目序號 10 碼、商品代碼 32 碼、保額 `18,2`、保費 `18,4`，必須與後端 V49、Bean Validation 及 `前端欄位長度定義.md` 同步。
- V50 後契約、聯絡及保障項目新增欄位仍由 `PolicyEntitySummary`、`PolicyMaintenanceDialog`、`usePolicyMaintenance` 動態處理；不得因欄位增加而在三個 View 複製 label/input。英文 key 來自 API metadata，中文來自 `CHT-code`，查無中文才顯示英文 key。
- `ChangeReviewCenterView` 點眼睛開啟的覆核明細只顯示「異動前／異動後」兩欄；兩邊 JSON 必須依 Key 拆成逐列 Key＋Value 並對齊，不另設資料內容區。代碼資料另須相容既有 Java Map 字串，不得把整個物件塞入單一 `value` 格。
- 覆核選單必須同時保留兩個獨立入口：`/change/reviews` 是代碼、保單維護與授權使用的通用「覆核中心」；`/change/review` 是依保全案號檢視欄位與檔案後核准的「保全覆核」。兩者不得互相轉址取代。
- 覆核中心與保全覆核的眼睛明細必須共用 `ReviewFieldComparisonTable`；覆核中心先拆解 JSON 再傳入，禁止各畫面另寫一套比較表。
- 覆核中心與保全覆核都使用 `ReviewFieldComparisonTable` 的 `full` 模式，固定顯示欄位／Key／異動前／異動後。覆核中心先拆解 JSON 成逐欄資料，但不得顯示功能代碼、完整 Key、狀態卡片。
- 覆核中心的 JSON 必須遞迴拆解；巢狀物件使用點號 path，陣列使用 `field[index]`，每個 scalar value 各自一列，不得把完整陣列或物件留在異動前／異動後儲存格。
- 覆核中心明細優先讀取主檔 `contentBefore/contentAfter`；任一缺值時須以同一 `reviewKey` 的稽核軌跡快照回補。主檔與稽核皆無快照時顯示明確空狀態，不得只呈現空白 Dialog。
- 覆核中心必須區分兩種 Key：上方 `Key1` 是單一主要查詢值，對應 `change_review.key1`；列表「唯一 Key」顯示完整 `change_review.unique_key` 組合值。覆核中心彈窗使用共用元件的 `showKey=false`，不重複顯示 Key；保全覆核仍顯示資料列 Key。
- 覆核中心結果清單必須同時顯示 `Key1` 與「唯一 Key」兩欄；`Key1` 無值顯示 `-`，不得因其已作為上方查詢條件就從結果清單省略。
- 新增、異動、覆核的人員與時間必須各自獨立成欄；時間維持單行顯示，空值統一顯示 `-`。
- 手機版若需改成卡片排列，必須清楚標示每個欄位名稱，且不得混淆不同資料筆數的邊界。
- 所有彈跳視窗統一使用 `DialogShell` 的共用寬度與外框；高度依內容自然撐開，超過 viewport 安全高度後才套用最大高度，並只讓內容區垂直捲動。標題、內容、頁尾分區，個別 Dialog 不得自行指定另一組固定高度；手機版依 viewport 縮放。
- 同一列查詢條件中的 `input`、數字輸入框與 `select` 必須使用相同的固定高度、內距、圓角與邊框尺寸，不得因原生控制項差異產生高低落差。
- 相同清單的操作欄必須共用同一套按鈕與排列，不得依角色建立不同版型；角色沒有權限時保留按鈕位置並設為停用，由後端繼續執行最終授權檢查。
- 凡是同一資料實體同時提供新增、異動、刪除 API 的 CRUD 維護畫面，三種操作必須共用同一個維護頁籤，不得複製不同版面；目前適用代碼對照表、保單主檔、保單地址與保單主附約。
- 共用頁籤只透過 `mode` 切換行為：新增模式欄位預設空白且可輸入；異動模式帶入原值並允許修改業務欄位；刪除模式帶入原值但所有欄位唯讀，頁尾只保留一個確認按鈕。
- 欄位內容可以依業務需求調整顯示、必填、唯讀、預設值與排列，但欄位定義必須集中由同一份 schema／設定產生，不得在新增、異動、刪除模式各維護一份欄位清單。
- 系統產生的稽核欄位在新增時保持空白；異動時預設唯讀，但可依明確業務需求開放修改；刪除時一律唯讀。禁止使用瀏覽器原生 `prompt` 或 `confirm` 取代共用頁籤。
- 代碼對照表修改模式的「代碼群組、欄位」屬於上層分類鍵，必須鎖定不可修改；從「代碼」開始的下方欄位（包含狀態及人員／時間資料）依此畫面需求允許修改。新增模式仍允許輸入代碼群組與欄位，刪除模式則全部唯讀。
- 保全變更申請、地址／保額異動、覆核確認／取消是業務流程與狀態轉移，不是 CRUD 刪除；除非未來真的提供同一實體的新增、異動、刪除 API，否則不得為了套版硬改成 CRUD 維護頁籤。
- 代碼對照表的新增、修改、刪除、覆核及 Dialog 主要確認按鈕統一使用系統主色 `#0f766e`；停用狀態以透明度表達，不另換成灰色，取消按鈕才使用次要樣式。
- 清單最後的檢視或操作欄寬度必須依實際按鈕數量配置：查詢模式只保留容納檢視按鈕的寬度，覆核模式才保留決策按鈕空間；圖示按鈕使用系統藍綠主題色，不得留下大面積無用途空白。
- 同一筆資料若有不同檢視用途（例如異動欄位、異動檔案），每個圖示按鈕必須各自使用獨立欄位與明確表頭，不得合併在單一「檢視」欄造成寬度與對齊不一致。

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
- `/change/create`：MAKER 申請保全變更。
- `/change/query`：MAKER 與 REVIEWER 查詢案件。
- `/change/review`：REVIEWER 查看異動明細並覆核。
- 側邊導覽依業務領域使用可收合群組：「保全服務」收納申請保全變更與查詢保全變更；「保單服務」依序收納三個查詢與三個異動畫面；「代碼設定」分成 `MCM00001` 查詢代碼對照與 `MCM00002` 異動代碼對照；所有覆核入口統一導向「覆核中心」。
- 代碼查詢頁只顯示資料；代碼異動頁共用同一表格與彈窗，僅提供新增、修改，不顯示刪除或覆核。覆核狀態決策只能在覆核中心操作。
- 保全變更項目由 API 回傳清單以 `v-for` 呈現，001～006 全選時必須顯示六個對應異動入口，不得限制只顯示前三個。
- Router 是頁面、角色、畫面授權、功能代碼、群組與排序的單一設定來源；App 側邊選單必須依 Router metadata 使用 `v-for` 產生，不得另建一份頁面清單。View 使用 lazy import，且必須保留 404 catch-all。
- 導覽中文尚在載入時顯示統一載入狀態；載入失敗顯示可理解的錯誤狀態，不得短暫把 `group.*`、`route.*` 等技術 key 當成畫面中文。
- 保單主檔、地址與主附約查詢頁只能查詢與檢視；新增、修改、刪除依實體拆成 `MPM00004`「異動保單主檔」、`MPM00005`「異動保單地址」、`MPM00006`「異動保單主附約」，不得再放在同一頁以頁籤切換。查詢與維護清單皆不顯示覆核按鈕或覆核狀態欄，覆核只能在覆核中心處理。
- 導覽中文名稱由 `main-navigation/navigation_label` 經 `/api/navigation-labels` 提供；資料欄位中文由 `CHT-code` 經 `/api/field-labels` 提供。查無設定時顯示英文 key，禁止在 Router、選單、表頭或 CRUD 欄位標題寫死中文。
- 重要共用 schema、狀態切換、CHT-code 對照與覆核導向必須加入說明設計意圖的繁體中文註解，避免逐行重述語法。
- `main-screen/function_code` 使用業務領域功能代碼：保全 `MPS`、保單 `MPM`、代碼維護 `MCM`、使用者 `MUS`，後接五碼流水號；畫面不得再顯示或新增舊式 `M001` 至 `M008`。
- 每個作業畫面右上方必須顯示統一的「功能代碼」膠囊標籤。路由同時設定 `functionKey` 與核准的 `functionCode` 備援值；正常情況由 `/api/function-codes` 讀取 `main-screen/function_code`，API 尚未啟動、未授權或資料仍是舊格式時使用路由備援，標籤不得靜默消失。完整代碼只能集中在路由設定，不得散落於 Vue 畫面元件。
- 可收合服務群組的每個子選單，必須在中文名稱左側顯示窄版功能代碼標籤，取代沒有語意的縮排留白。選單只以路徑解析路由的 `functionKey` 與備援值，再優先套用後端 `/api/function-codes` 回傳內容；不得在選單模板重複寫死完整功能代碼。
- 桌面版側欄需保留足夠寬度讓「功能代碼＋中文名稱」維持單行；中文名稱不得因代碼標籤而任意折行，小螢幕則沿用響應式單欄選單。
- Route guard 第一次導頁前必須由 `authStore.initialize()` 呼叫 `/api/auth/me` 偵測後端安全模式。
- `/api/auth/me` 回覆 401/403 時導向登入；回覆 `securityEnabled=false` 時使用本機開發角色。
- Basic Auth 密碼只放目前頁面記憶體，不寫入 localStorage、Pinia persisted state 或 log。
- Security 預設開啟；只有本機明確關閉時可使用 `local-development`，正式環境不得依賴免登入模式。
- 建檔經辦只可查看與修改自己的案件，REVIEWER 可查看覆核案件；前端不可隱藏或改寫後端 403。

## DD 與畫面欄位名稱

- 畫面繁體中文欄位名稱與 API 欄位遵循專案根目錄 `欄位命名規則ＤＤ定義.md`；需要欄位名稱時先查此檔，不可在個別頁面自行發明同義名稱。
- 修改既有欄位前先查專案根目錄 `專案欄位命名盤點.md`；前端不得單獨 rename，須配合後端相容 API、動態中文 metadata 與歷史覆核 key 遷移。
- 前端 entity type 與 API route 的業務名稱應對應 DD 邏輯表；主約與附約共同資料一律稱 `coverage`，不可再新增 `ride`／`rider` 作為共同實體名稱。
- 前端不得把暫存的 P/C 覆核快照當成正式資料；正式資料與覆核預覽分開取用，按鈕可見性僅供 UX，操作權限仍由後端判定。
- 維護 API 回傳 `reviewStatus=P` 時代表 Maker 的 STAGED 提案：不得加入正式資料清單，應導向覆核中心；只有 Admin 直接完成回傳 `S` 時才立即刷新正式資料。
- Admin 與 Maker 都可看見維護按鈕；Admin 由後端直接完成並寫稽核，前端不得自行偽造 `S` 或略過 API。
- `key1` 只用於跨資料來源覆核查詢；實體畫面仍顯示正式壽險名稱，例如保單號碼、保全案號、保險金額。
- 中文名稱優先由後端／`CHT-code` 提供；DD 未定義時保留英文原名並列入待確認，不可前端寫死猜測翻譯。

## Pinia 分工

- `workflowStore`：loading 計數、成功訊息、錯誤訊息。
- `authStore`：登入結果與完整角色集合；`currentUser.roles` 支援同一 `userId` 具有兩個以上角色，選單與路由使用 `hasRole`／`hasAnyRole` 判斷，不可退回單一 `role` 欄位。
- 內建帳號顯示與權限以後端角色集合為準：`maker` 顯示「經辦、授權經辦」，`reviewer` 顯示「覆核、授權覆核」。
- 使用者授權頁以 `userId` 為主鍵：`ROLE_USER` 只能查詢，新增按鈕不顯示且修改按鈕停用；只有 `ROLE_ADMIN` 可用共用 Dialog 新增或修改既有 userId 的多個角色。儲存成功訊息必須明示立即生效且稽核狀態為 `S`，畫面不提供覆核按鈕。
- 使用者角色儲存若後端回覆相同 `MUS00001 + userId` 已在待處理佇列，畫面顯示衝突訊息並保留 Dialog 內容，不可自行覆蓋或重送。
- 使用者角色清單的狀態顯示規則固定為：`S` 顯示「完成」，任何非 `S` 狀態一律顯示「正在處理中」，並停用該筆修改按鈕。
- 保單主檔、保單地址、主附約與代碼對照表共用相同覆核狀態顯示：`S` 為「完成」，非 `S` 為「正在處理中」；正在處理中的資料停用修改與刪除，只允許具覆核權限者進入覆核中心。
- 使用者授權頁同時顯示「角色」與「畫面授權」；兩者皆可複選，但只有 Admin 可維護。畫面授權直接使用後端的 `userId + functionCodes`，不可由單一角色在前端推算；USER 唯讀。側邊選單及路由必須同時符合角色與 `functionCodes`，未授權畫面不可只靠隱藏選單，直接輸入 URL 也要導向第一個已授權畫面。
- 使用者授權清單必須使用 `ScrollableRecordTable`，不得另建專用表頭 Grid；表頭字級、背景、列高、欄寬 token 與橫向捲軸須和保單、代碼清單共用。
- 所有資料清單與明細卡不得固定列出完整英文欄位陣列；應由 API 回傳物件 key 或 metadata 產生 `v-for`，再以 `CHT-code` 轉中文，查無對照時顯示原 key。操作按鈕、狀態轉譯及快照眼睛可作為純 UI 欄位例外。
- 角色 Dialog 與畫面授權 Dialog 是完全獨立的表單；選取或儲存角色不得自動勾選、過濾或清除任何畫面，畫面選項一律載入後端 `main-screen/function_code` 完整清單供 Admin 手動複選。
- 畫面授權使用獨立入口，操作順序固定為「先選使用者 ID，再複選畫面」；不可要求先選角色，也不可從角色列按鈕推算畫面。
- 選定使用者 ID 後必須允許儲存空的 `functionCodes`；空清單表示撤銷該帳號全部畫面授權，不可因零個勾選項目停用儲存。
- 使用者清單的畫面授權欄固定單行，只顯示授權總數與眼睛按鈕；點眼睛開啟唯讀明細 Dialog，完整設定仍由獨立的「設定畫面授權」入口處理，功能增加不得使每位使用者資料列持續增高。
- `policyStore`：保單查詢條件、主檔、地址、主附約與代碼。
- `changeCaseStore`：案號、案件清單、案件明細、覆核狀態。
- `changeCaseStore.selectedChangeItems` 保存取號前的複選項目；產生案號後不得在前端自行增減，所有 Dialog 必須共用回傳的同一個 `changeCaseNo`。
- 變更項目複選不設定固定筆數上限，畫面必須提交使用者選取的完整清單；只限制至少選擇一項。
- 進入新增保全頁或變更勾選項目時清除既有 workflow 訊息，禁止讓前一次 API 的錯誤在新操作中持續顯示。
- `addressChangeStore`：001 Dialog、郵遞區號與地址表單。
- `amountChangeStore`：002／003 共用 Dialog 與保額表單。

查詢到保單後，`PolicyEntityMenu` 顯示主檔、地址與主附約 entity 摘要；此元件只讀取 `policyStore`，兩個角色都可查看，所有異動按鈕仍由角色與後端權限控制。

`PolicyEntityMenu` 同時顯示畫面代碼對照。對照資料來自後端 `PolicyDetail.screenPermissions`
（資料庫 `main.code_description` 的 `main-screen/screen` 群組），不可在前端另寫一份角色規則。

使用者授權頁使用 `/api/user-authorizations` 取得 `main.user/authorities` 對照，四個支線的角色規則由資料庫維護。

不要重新建立單一大型 facade store。Dialog 狀態不可塞回 `policyStore` 或 `changeCaseStore`；全域成功／錯誤訊息統一透過 `workflowStore`。

Store 互相使用時，只能在 action 內呼叫另一個 `useXxxStore()`，不要在 module top level 讀取另一個 Store，避免循環初始化。

- API 回傳、身份、案件與 workflow state 視為元件唯讀，元件不可直接覆寫，統一由 action 更新。
- 查詢條件與 Dialog form 是暫存 UI state，可以直接綁定或改由 setter action 管理；有連動清除、查詢等副作用時必須走 action。
- Pinia 只放前端流程協調與共享 UI state，不重做後端的異動判斷、狀態轉移、覆核或交易規則。
- 不為追求形式而將所有 Pinia state 包成 `readonly`；應依 server state 與 editable form state 分界。

## Component 分工

- Component 只處理呈現、focus、使用者事件與 emit。
- HTML 語系固定使用 `zh-TW`；所有使用者可見的標題、導覽、按鈕、欄位、提示與錯誤訊息均使用臺灣繁體中文，產品代碼、API 欄位與必要技術縮寫除外。
- 表單檢核交給 Zod，API 呼叫交給 Store action。
- 不在 Component 重複組 API URL 或解析 `ResponseBodyDto`。
- Dialog 儲存成功後關閉；失敗時保留並顯示訊息。
- Icon button 使用 Lucide 並提供 `title`。
- Dialog 及表格要在 820px 以下維持可讀，不允許文字互相覆蓋。
- Vite 開發伺服器維持 Host 檢查；Cloudflare Quick Tunnel 僅允許 `.trycloudflare.com` 子網域，禁止設定 `allowedHosts: true`。

## API

- `httpClient.ts` 統一處理 Axios、Basic Authorization、`ResponseBodyDto<T>` unwrap 與友善錯誤。
- `posChange.ts` 定義 API wrapper 與共用 payload type。
- 所有 wrapper 保留一行中文註解，說明對應畫面。
- request body 不包 `ResponseBodyDto`。
- 後端 `401/403/409` 的 `errorMessage` 必須直接顯示，不能改成模糊的 Internal Server Error。

主要 API：

- `findCurrentUser`：登入驗證與角色。
- `findPolicyDetail`：新增頁保單資料。
- `checkChangeCaseEligibility`：依保單號碼、序號與變更項目檢查最近案件；最近狀態為 P 時禁止申請。
- `createChangeCase`：只取得案號，尚未建立受理資料。
- `saveAddressChange`：001 最新草稿。
- `saveMainAmountChange`：002 最新草稿。
- `saveRiderAmountChange`：003 最新草稿。
- `findChangeCases`：查詢／覆核清單。
- `findChangeCaseDetail`：覆核欄位與檔案快照前後值。
- `updateChangeCaseStatus`：REVIEWER 完成或取消。

## 新增流程

1. 查詢保單。
2. 用核取方塊複選一至多個 `001/002/003`。
3. 逐項檢查最近一筆案件，若任何項目仍為 `P`，顯示「此保單正在受理中，無法申請」。
4. 取得一個資料庫保留案號，所選項目不可再增減。
5. 逐一開啟所選項目的 Dialog，全部共用同一案號。
6. 後端判斷各項實際異動；無異動顯示「未建立變更資料」。
7. 重複修改同一目標時，畫面顯示後端回傳的最新異動筆數。

前端不可把「取得案號」顯示成已建立 `P` 案件；只有儲存且真的異動後才存在受理資料。

## 覆核流程

- 清單只顯示摘要，必須點擊明細圖示取得 `PolicyChangeCaseDetail`。
- 案件列提供兩個 Eye 按鈕，分別開啟欄位 Dialog 與檔案快照 Dialog；禁止把兩類內容直接展開在清單頁。
- 只有同一案件的欄位與檔案 Dialog 都曾開啟並關閉，覆核完成／取消按鈕才可用；狀態離開 P 後必須隱藏操作按鈕。
- 明細顯示 `changeField / changeKey / contentBefore / contentAfter`；檔案快照 JSON 必須拆成逐欄資料格，顯示中文名稱、JSON key、異動前值與異動後值。
- 明細欄位依 `changeItem` 分組；`002` 顯示主附約檔主約列的一筆「主約保額」業務變更。
- 若變更項目已有完整 `changeFiles` 快照，畫面只顯示快照，不重複顯示同項目的 `changeFields` 技術欄位。
- 快照中文名稱以後端 `CodeDescription` 的 `codeGroup=CHT-code`、`codeField=JSON key`、`codeBefore=中文名稱` 為準，前端不得另建固定對照表。
- `changeFields` 與快照均優先顯示後端提供的中文名稱，原始英文欄位名只作為次要資訊。
- 完成／取消按鈕只出現在展開的待覆核明細內。
- 呼叫 PATCH 前必須再次確認。
- HTTP 409 表示主檔或案件狀態已改變；顯示錯誤並要求重新查詢，不可自動重送。
- 覆核中心每筆資料皆可展開預覽 `change_review_audit` 歷程；`P` 可確認或取消，`S` 已確認與 `C` 已取消只能預覽，不得再次送出決策。
- 覆核清單的異動前後內容不可直接佔用欄位，改用「資料詳細內容」眼睛按鈕開啟 Dialog，逐欄顯示中文名稱、Key、異動前與異動後；中文名稱沿用後端 `CHT-code`。
- 稽核歷程預覽不得顯示說明或重複顯示整段 `contentBefore/contentAfter`；只呈現事件、狀態、時間、操作人員與追蹤識別，詳細異動統一由眼睛 Dialog 查看。中文名稱只能來自 `CHT-code`；缺少對照時顯示未設定，不得在前端建立固定對照表。
- 覆核稽核歷程每一筆固定以單行呈現事件、狀態、時間、操作人員與追蹤識別，不因欄位增加折成多排；寬度不足時由歷程區塊提供水平捲軸。
- 覆核中心使用單一 `key1` 查詢第一主要 Key，不顯示保單序號查詢欄位；前端 state、URL query、API 參數、Controller、Service 與 DAO 一律命名 `key1`，不得殘留 `keyword` 或 `policyNo` 查詢參數。
- 命名格式固定：Vue／TypeScript／Java 使用 camelCase（`key1`、`uniqueKey`、`reviewKey`），MySQL 使用 snake_case（`unique_key`、`review_key`、`policy_no`）；不同層依各自慣例轉換不算命名不一致。
- 覆核中心第一個主要 Key 查詢欄位統一命名為 `Key1`；`MCM00001` 對應 `main.code_description` 時，Key1 的實際欄位為 `code_group`。
- 覆核清單跨多種資料來源，只顯示「完整 Key」，不得另外固定顯示保單號碼與序號欄位；保單、代碼及使用者資料都以 `uniqueKey` 呈現完整主要鍵值。
- 覆核中心進入時不要求先選功能代碼，預設查詢全部資料；後端固定每頁 20 筆並依 `created_at DESC, id DESC` 排序，篩選與換頁不可改成前端一次載入全部資料。

## 001 地址與聯絡資料

- `01/02` 開啟郵遞區號與地址，鎖住 email／電話／手機。
- 其他型態反向處理。
- 郵遞區號前三碼必填，後三碼可空白；輸滿後自動移動 focus。
- 修改前三碼要清除後三碼與舊地址，再帶入新縣市區。
- API 失敗時可由目前保單相同前三碼地址推導中文前綴。
- 未修改或改回原值時，後端應回傳 `changedFieldCount = 0`。
- 004／005／006 查無既有 email、市內電話或行動電話時必須開啟空白新增模式，不得停用輸入框或儲存按鈕；正式資料仍需等覆核通過才新增。

## 002／003 保額

- 共用 `AmountChangeDialog`，以 `main`／`rider` 模式區分。
- 002 只修改主約保額。
- 003 只顯示 `coverageItemType=RIDER` 且 `coverageItemSeq!=000` 的附約列；建立表單與送出 API 前都必須排除主約，不可只靠畫面隱藏。
- 每筆附約 payload 必須包含 `coverageItemSeq`。
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
- 測試與 Story 檔放在子目錄時，import 必須依實際目錄回到 `src/components`、`src/stores`、`src/api`；重構完成至少執行 `format:check`、`lint`、`test:unit`、`build`，不可只以 TypeScript 編譯成功判定完成。

## Docker 與環境

- 前端 image 不包含 Security build-time 參數；權限模式只能在 runtime 透過 `/api/auth/me` 判斷。
- nginx 透過 `pos-api:8081` 代理 `/api/`。
- nginx 必須以非 root 身分監聽 8080，保留 CSP、frame、referrer、HSTS、content-type 與 API rate-limit 安全設定。
- 前端、API、MySQL 以 `compose.yaml` 一起啟動。
- Compose 使用 MySQL 8.4 LTS；所有建置、執行與資料庫映像必須固定 digest，升級時同步掃描弱點並更新 digest。
- `.env` 不提交 Git；新增環境欄位時同步更新 `.env.example`。
- Compose 的 `POS_API_IMAGE`、`POS_WEB_IMAGE` 必須使用同一個不可變版號；本機可使用 `pos-api:local`、`pos-web:local`，正式環境不得只依賴 `latest`。
- 正式部署順序固定為：建置與測試 image → 本機以 `--no-build` 驗證 → 登入 Registry → push → 部署主機 pull → MySQL 備份 → `up -d --no-build` → 健康檢查與日誌確認。
- 已執行資料庫 migration 的版本不可只靠切回舊 image 回滾，必須先依 migration runbook 評估 schema 相容性。
- Compose 對外 port 預設只綁定 `127.0.0.1`，容器維持唯讀 filesystem、`no-new-privileges` 與 `cap_drop: ALL`。
- CI 必須執行 npm audit、CodeQL、OSV、測試、建置與 Docker build；npm、Docker 與 Actions 由 Dependabot 定期更新。

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

# Deployment safeguards

- Docker Compose defaults to the `prod` Spring profile and HTTPS enforcement.
- Keep credentials in an ignored `.env` or a deployment secret manager; never commit `.env` or database backups.
- Run `./backup-mysql.sh` before migrations and retain encrypted, access-controlled copies.
- Restore only against an isolated database first, then verify Flyway and application health.

# Code 清單驗證

- 前端路由：`/codes`
- 後端 API：`GET /api/user-authorizations/codes`
- 權限：`MAKER`、`REVIEWER` 可查詢
- 資料來源：`main.code_description`
- 若欄位空白，先確認後端已重新啟動，再檢查 ResponseBodyDto 的 `data` 是否包含 `codeGroup`、`codeField`、`codeBefore`、`codeAfter`、`codeDescription`。
- 權限分工：Maker 可新增、修改、刪除；Reviewer 可查詢、覆核。
- Code 對照表的操作欄由 Maker 與 Reviewer 共用：Maker 可使用修改、刪除，Reviewer 可使用覆核；沒有對應權限的按鈕保留顯示但停用。Reviewer 覆核會呼叫 `PATCH /api/user-authorizations/codes/{group}/{field}/{before}/review`。
- Code 查詢先選 `main-code.code_field`，再以下拉選擇該群組的 `code_before`；不得在前端另建固定代碼清單。
