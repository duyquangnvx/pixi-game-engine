# Requirements — Thiết kế harness PixiJS + React-overlay cho coding agent

> **Đối tượng đọc:** một session Claude Code khác sẽ *thiết kế và build* harness này từ đầu (repo riêng hoặc package riêng).
> **Brief này làm gì:** cố định mục tiêu, ràng buộc, quyết định đã chốt, và tiêu chí nghiệm thu — để session đó không phải đoán lại bối cảnh.
> **Tài liệu đính kèm bắt buộc đọc trước:**
> - [`pixi-react-skeleton-spec.md`](./pixi-react-skeleton-spec.md) — bản nháp DX (điểm khởi đầu, **không phải** thiết kế chốt).
> - `../CLAUDE.md` — final goal của repo (GDD → game 2D hoàn chỉnh qua coding agent).
> - `../references/research-01.md`, `research-02.md` — research nền (IR + multi-agent, OpenGame/WorldCraft/GameUIAgent).

---

## 1. North star

Xây **workspace + tooling cho coding agent** để: **đầu vào là Game Design Document (GDD), đầu ra là một web game 2D chạy được**, build trên **PixiJS v8 (game-world) + React DOM (UI overlay)**.

Trọng tâm output: **UI nặng** (menu, shop, inventory, character, settings) + **game flow** (click button → đổi scene) + **asset/scene structure**. Gameplay logic phức tạp **không** phải trọng tâm.

**Đóng góp giá trị nhất của harness là *phương pháp DX* (contract-first, type-safe assets, scene lifecycle, agent-observable, verification-gated), không phải code engine cụ thể.** Phương pháp đó phải được giữ nguyên vẹn.

---

## 2. Quyết định đã chốt (không mở lại trừ khi có lý do mạnh)

1. **Kiến trúc = DOM overlay.** Pixi canvas render game-world; React DOM render toàn bộ UI (absolute, đè canvas), nối nhau qua một store + command bus. **Không** dùng `@pixi/react` làm xương sống (chỉ optional escape hatch cho node in-world). Lý do đầy đủ ở §0 của skeleton spec.
2. **Phạm vi = full agent-harness.** Không chỉ game skeleton, mà cả: asset codegen, skill/guide cho agent, **browser-sim MCP**, và verification loop GDD→game.
3. **Stack:** Vite + TypeScript (strict) + PixiJS v8 + React 19/React DOM + **AssetPack** (pipeline asset chính chủ Pixi) + store nhỏ (Zustand đề xuất, nhưng để sau interface `bridge`).
4. **Pure-React scene là first-class.** Phần lớn scene UI không cần Pixi world; agent chỉ viết TSX. Đây là lợi thế DX chính, phải được tài liệu hoá và scaffold hỗ trợ.

---

## 3. Ràng buộc (tuân thủ `../.claude/rules/`)

- **TypeScript strict.** Không `any`/`as any`/`!`. Public API có type tường minh. Validate input ở boundary (xem `rules/typescript/*`).
- **Immutability**, KISS/DRY/YAGNI, file 200–400 dòng (max 800), function < 50 dòng (xem `rules/common/coding-style.md`).
- **Không secret hardcode, không `console.log` trong production code.**
- **Test:** unit + integration + E2E, coverage tối thiểu 80% (xem `rules/common/testing.md`).
- **Engine-agnostic boundary:** `core/` (SceneManager, ServiceRegistry, bridge, asset-loader interface) **không** được phụ thuộc trực tiếp Pixi/React ở tầng type công khai nếu có thể — để tái sử dụng và test bằng fake. Dùng dependency-cruiser enforce như repo gốc.

---

## 4. Deliverables mong đợi

### 4.1 Core skeleton (`@studio/core` hoặc `src/core/`)
- `createGame()/Game`: boot Pixi `Application` + React root + bridge, theo §2 skeleton spec.
- `BaseScene`: hai mặt `world: Container` + `static Screen: React.ComponentType`. Lifecycle `onPreload/onCreate/onUpdate/onDestroy`, helper `spawn`/`onCleanup` auto-cleanup, tick qua `app.ticker`.
- `SceneManager`: `go/push/pop` + transition đồng bộ canvas↔DOM. Push/pop dùng cho overlay (modal/pause/shop popup).
- `bridge`: store (single source of truth) + command bus (React → logic), `setRoute`. Quy ước pointer-events cho `#ui-root`.
- `ServiceRegistry` + `GamePlugin` (engine-agnostic).
- React glue: `GameProvider`, `useGame`, `useScene`, `useStore`, `<Overlay>`.

### 4.2 Asset pipeline + codegen
- Cấu hình **AssetPack** (`raw-assets/` → `public/assets/` + `manifest.json`, bundle theo folder tag).
- `scripts/gen-assets.ts`: `manifest.json` → `assets.gen.ts` (typed `BundleName`, `AssetAlias`, `ASSETS` const).
- `AssetLoader` wrap `Assets.init/loadBundle/backgroundLoadBundle/get`.
- Vite plugin watch để re-gen khi manifest đổi.

### 4.3 Browser-sim MCP
- Một MCP server cho agent điều khiển/giám sát game đang chạy trong **browser headless** (Playwright) — *hoặc* tận dụng MCP **chrome-devtools / playwright đã kết nối sẵn trong repo này* nếu phù hợp; quyết định build-mới-hay-tái-dùng là một open question (§6).
- Bộ tool **tối thiểu**: `launch`/`stop`/`restart`, `snapshot` (DOM + scene tree), `eval_in_runtime`, `click`/`input_text`/`swipe`, `take_screenshot`, `read_console`, `wait_for`, và `get_node_detail`/`set_node_prop`/`assert_no_defects`.
- **Lợi thế cần khai thác:** UI là DOM thật → introspection/click/verify qua accessibility tree sẵn có, không cần custom bridge. Game-world (Pixi) cần một cầu nhỏ expose scene-tree (vd `window.__GAME__` debug API) để snapshot canvas-side.

### 4.4 Skills + guide cho agent
- Skill cho agent (Pixi+React):
  - **scene-convention**: scene = `world` + `Screen`; nơi đặt class theo vai (Orchestrator/Service/UI Component); quy ước communication (logic→UI qua store, UI→logic qua command bus).
  - **tester**: convention test (unit logic + E2E qua browser-sim MCP).
  - Guide PixiJS v8 + React-overlay: node hierarchy Pixi, Assets API, anchor/coord (Pixi gốc top-left, y-down — phải nêu rõ quy ước này), pointer-events overlay, responsive/fit.
- CLI scaffold `npx create-pixi-react-game` (scaffold scene pure-React + scene có world + HUD).

### 4.5 Verification loop (GDD → game)
- Tài liệu hoá pipeline contract-first (IR 3 lớp: game tokens / asset registry / scene composition) — **engine-agnostic, tái dùng từ research**.
- Vòng verify: build → launch browser-sim → screenshot (VLM chấm layout) → click điều hướng (kiểm tra flow) → `read_console`/`wait_for` (bắt lỗi) → feedback về IR.

---

## 5. DX north star (đối chiếu khi review)

Một coding agent nhận GDD phải có thể:
1. Khai báo scene mới bằng cách thêm 1 file `scene.ts` (+ `Screen.tsx` nếu cần UI) — đăng ký tự động, không sửa chỗ khác.
2. Viết UI menu/shop/inventory bằng **TSX + CSS thuần** — không đụng canvas.
3. Dùng asset qua `ASSETS.<alias>` **type-safe**, không lo typo runtime.
4. Điều hướng bằng `game.scenes.go('X')` / `push`/`pop`; overlay/popup là `push` một React modal.
5. Đọc/ghi state qua `store`; UI và logic không gọi thẳng vào nhau.
6. **Tự verify** bằng browser-sim MCP (screenshot + click + console) mà không cần con người.

Nếu một thao tác phổ biến của agent cần > 1 file "plumbing" hoặc dễ sai toạ độ/typo, thiết kế chưa đạt.

---

## 6. Open questions cần session sau quyết định

1. **Store**: Zustand vs signal store tự viết? Giữ `bridge` là interface để swap được.
2. **Transition đồng bộ canvas↔DOM**: timeline chung nào (TweenJS / Web Animations API) để Pixi alpha và CSS overlay không lệch frame?
3. **Resize/fit**: scale overlay theo design-resolution (transform-scale) hay responsive CSS thuần? Áp đồng thời cho canvas + `#ui-root` ra sao?
4. **Browser-sim MCP**: build server mới (Playwright) hay tái dùng MCP `chrome-devtools`/`playwright` đã có trong repo? So sánh: tool-surface kiểm soát được vs công sức.
5. **Scene-tree introspection của Pixi**: hình thù `window.__GAME__` debug API (chỉ bật khi `debug:true`) để snapshot canvas-side ra sao?
6. **Monorepo layout**: package riêng trong workspace chung (thêm `packages/pixi-*`) hay tách repo? Brief này nghiêng về **package riêng trong cùng workspace** để tái dùng skills/rules/MCP convention.
7. **`@pixi/react`**: có ship như optional plugin không, hay để ngoài hoàn toàn ở v1?

---

## 7. Tiêu chí nghiệm thu (Definition of Done cho v1)

- [ ] `createGame().start()` boot được canvas + overlay, chạy 1 scene **pure-React** và 1 scene **có Pixi world + HUD**.
- [ ] `go/push/pop` hoạt động; có ít nhất 1 overlay modal (pause hoặc shop) qua `push`.
- [ ] Bridge store + command bus: HUD đọc state, button React `dispatch` đổi state/scene; pointer-events overlay đúng (click xuyên canvas ở vùng trống).
- [ ] AssetPack pipeline + `assets.gen.ts` typed; load bundle theo scene; gõ sai alias → lỗi compile.
- [ ] Browser-sim MCP: `launch` + `screenshot` + `click` + `read_console` chạy được trên game build; demo verify 1 flow menu→game.
- [ ] CLI scaffold tạo được scene mới (pure-React và world) chạy ngay.
- [ ] Có skill scene-convention + guide Pixi/React-overlay + skill tester.
- [ ] Test: core (SceneManager/bridge/registry) unit + 1 E2E flow qua MCP; coverage ≥ 80% cho `core/`.
- [ ] Tuân thủ `rules/`: TS strict không `any`, file/function trong ngưỡng, không `console.log` production, dependency-cruiser pass (core không leak Pixi/React ở public boundary).

---

## 8. Cạm bẫy đã biết (để session sau khỏi vấp)

- **Hệ toạ độ:** Pixi y-**down**, gốc top-left. Mọi guide/asset placement phải nêu rõ quy ước này để khỏi sai công thức anchor.
- **Hai cây render dễ lệch:** transition, resize, z-order phải xử lý đồng bộ; đừng để React UI và Pixi world "trôi" độc lập. Store là trục đồng bộ.
- **Pointer-events:** quên `pointer-events:none` mặc định cho `#ui-root` → overlay nuốt hết input game. Đây là bug kinh điển của DOM-overlay.
- **HMR:** React Fast Refresh ổn cho UI; Pixi `world` không hot-reload tự nhiên — cần handler re-`go` scene hiện tại khi module `scene.ts` đổi.
- **Đừng over-engineer:** YAGNI. v1 không cần ECS, không cần networking, không cần `@pixi/react`. Bám trọng tâm UI + flow + scene structure.

---

## 9. Cách bắt đầu (đề xuất cho session sau)

1. Đọc các tài liệu đính kèm ở đầu brief để nắm interface MCP cần đạt.
2. Dựng skeleton theo **thứ tự build §9** của skeleton spec (Game→Scene→Manager trước, rồi bridge, rồi assets, rồi overlay/transition).
3. Chốt lần lượt 7 open question §6 — ưu tiên #1, #3, #4 vì ảnh hưởng kiến trúc sớm.
4. Mỗi mốc build xong → verify thật bằng browser-sim MCP trước khi đi tiếp (đừng tự nhận "done" khi chưa chạy — theo `rules/coding.md`).
