# SolarPrice Insight 一步到位“自动跨设备同步（阶段B）”实施计划（Cloudflare 全栈）

## 摘要
本方案直接落地“自动跨设备同步”，采用已确认策略：
- 身份层：Cloudflare One（Access）
- 保护范围：整站 + API 全保护
- 成员准入：邮箱白名单
- 数据模型：全体登录用户共享同一云端数据集（单库）
- 冲突策略：记录级 LWW（`modified_at` 最新覆盖）
- 首次登录：双向合并 + LWW
- 同步范围：`tariffs/time_configs/personas/comprehensive_results/saved_time_ranges/holidays`（不含 `pvgis_cache/operation_logs`）
- 同步方式：自动（写后延迟 + 前后台切换 + 周期轮询）+ 手动“立即同步”兜底

---

## 1. 目标与验收标准
1. 同一账号白名单成员在任意设备登录后，业务数据自动收敛到一致状态。
2. 离线修改可排队，恢复网络后自动上传并拉取。
3. 删除可跨设备传播。
4. 并发修改按 LWW 收敛，不出现死循环同步。
5. 未登录（未通过 Access）不可访问站点与同步接口。
6. 不改变现有 PWA/本地 RxDB 主体验，云同步是增量能力。

---

## 2. 架构定稿
1. 前端：Cloudflare Pages（React + PWA）。
2. API：Pages Functions（`/api/sync/*`、`/api/auth/me`）。
3. 存储：D1（云端“文档当前态 + 变更日志”双表）。
4. 身份：Cloudflare Access，Functions 通过 `CF-Access-Authenticated-User-Email` 识别用户。
5. 同步协议：`push + pull(cursor)`，客户端维护本地 `cursor` 与 outbox。

---

## 3. 公共接口与类型变更（必须落实）
1. 新增接口 `GET /api/auth/me`
返回：`{ email: string, authenticated: true }`。

2. 新增接口 `POST /api/sync/push`
请求体：

```json
{
  "client_id": "uuid",
  "changes": [
    {
      "collection": "tariffs",
      "doc_id": "id",
      "op": "upsert|delete",
      "modified_at": "2026-02-25T12:34:56.000Z",
      "doc": {}
    }
  ]
}
```

响应体：

```json
{
  "applied": [{"collection":"tariffs","doc_id":"id"}],
  "skipped": [{"collection":"tariffs","doc_id":"id","reason":"stale"}],
  "server_cursor": 1234
}
```

3. 新增接口 `GET /api/sync/pull?cursor=0&limit=500`
响应体：

```json
{
  "changes": [
    {
      "seq": 123,
      "collection": "tariffs",
      "doc_id": "id",
      "op": "upsert|delete",
      "modified_at": "2026-02-25T12:34:56.000Z",
      "doc": {}
    }
  ],
  "next_cursor": 123
}
```

4. 前端新增同步类型（`types.ts` 或 `services/sync/types.ts`）
`SyncCollection`、`SyncChange`、`SyncState`、`SyncOutboxItem`。

---

## 4. D1 结构（一次建好）
1. `sync_documents`（当前态）
- `collection TEXT NOT NULL`
- `doc_id TEXT NOT NULL`
- `is_deleted INTEGER NOT NULL DEFAULT 0`
- `doc_json TEXT`
- `modified_at TEXT NOT NULL`
- `payload_hash TEXT NOT NULL`
- `updated_by_email TEXT NOT NULL`
- `updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `PRIMARY KEY (collection, doc_id)`

2. `sync_changes`（增量拉取日志）
- `seq INTEGER PRIMARY KEY AUTOINCREMENT`
- `collection TEXT NOT NULL`
- `doc_id TEXT NOT NULL`
- `op TEXT NOT NULL` (`upsert|delete`)
- `modified_at TEXT NOT NULL`
- `doc_json TEXT`
- `payload_hash TEXT NOT NULL`
- `updated_by_email TEXT NOT NULL`
- `created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`
- 索引：`idx_sync_changes_seq(seq)`、`idx_sync_changes_collection_seq(collection, seq)`

3. `sync_meta`（可选）
- 用于全局配置（如 tombstone 保留天数）。

---

## 5. 冲突与幂等规则（定死）
1. 比较键：`modified_at`。
2. 新变更 `modified_at` 大于云端当前态则应用。
3. 小于则 `skipped(stale)`。
4. 相等时比较 `payload_hash`：相同视为幂等重试；不同按 `payload_hash` 字典序稳定决胜（防抖动）。
5. 所有“被应用”的变更必须写入 `sync_changes`，用于 cursor 拉取。

---

## 6. 前端实现拆解（文件级）
1. 新增 `services/sync/syncManager.ts`
- 生命周期：`start/stop/syncNow/requestSyncSoon`
- 自动触发：应用启动后、`online`、`visibilitychange`、轮询（30s）、本地写入后 debounce（3s）。

2. 新增 `services/sync/syncOutboxService.ts`
- 本地 outbox（建议 RxDB 新集合 `sync_outbox`，键为 `collection:doc_id`，自动折叠重复操作）。
- `enqueueUpsert/enqueueDelete/drainBatch/ackApplied/requeueFailed`。

3. 新增 `services/sync/syncAdapters.ts`
- 统一映射各集合读写：
`tariffs/time_configs/personas/comprehensive_results/saved_time_ranges/holidays`。
- `delete` 远端传播用 tombstone，不依赖本地 `_deleted` 字段。

4. 在现有写路径注入 outbox 入队（必须全覆盖）
- `App.tsx`：`handleUpdate* / handleMerge* / handleUpdatePersonas`。
- `services/priceService.ts`、`services/configService.ts`、`services/personaService.ts`、`services/holidayService.ts`。
- `components/ComprehensivePriceCalculator.tsx`、`components/admin/AdminModule.tsx` 的直接 DB 写路径。

5. 新增同步状态 UI
- `components/SyncStatusBadge.tsx`（同步中/已同步/离线待同步/失败重试）。
- 在主布局（`App.tsx` 顶部或设置页）展示，并提供“立即同步”。

---

## 7. Functions 实现拆解（文件级）
1. `functions/_shared/access.ts`
- 读取并校验 Access 身份头；无身份返回 401。

2. `functions/_shared/syncRepo.ts`
- D1 读写封装：apply change、query by cursor、hash 计算。

3. `functions/api/auth/me.ts`
- 返回当前 Access 邮箱。

4. `functions/api/sync/push.ts`
- 批量应用 change，返回 applied/skipped/server_cursor。

5. `functions/api/sync/pull.ts`
- 按 cursor 增量返回 change log。

6. `functions/db/migrations/0001_sync.sql`
- 建表与索引。

7. `wrangler.toml`
- 绑定 D1，配置 `pages_build_output_dir="dist"`。

---

## 8. 测试计划（必须覆盖）
1. 单元测试：冲突比较器（`newer/stale/tie`）。
2. 单元测试：outbox 折叠策略（同 doc 连续 upsert/delete）。
3. 接口测试：`push` 幂等重试不重复写日志。
4. 接口测试：`pull` cursor 连续拉取不漏不重。
5. 集成测试：设备 A 新增，设备 B 自动拉取。
6. 集成测试：设备 A 删除，设备 B 自动删除。
7. 集成测试：A/B 并发修改同 doc，按 LWW 收敛。
8. 集成测试：离线期间多次改动，恢复网络后自动同步。
9. 权限测试：无 Access 身份访问 `/api/sync/*` 返回 401。
10. 回归测试：现有 `vitest` 通过，`pvgis_cache/operation_logs` 不参与同步。

---

## 9. 部署与上线步骤
1. 创建 D1 并执行 `0001_sync.sql`。
2. 配置 Pages 项目并绑定 D1。
3. 在 Cloudflare Zero Trust 创建 Access 应用：
- 应用域名=站点域名
- 策略=邮箱白名单允许
- 保护整站路径 `/*`
4. 部署 Pages + Functions。
5. 首次灰度：白名单先放 2-3 人，验证多端同步后扩白名单。

---

## 10. 风险与默认假设（已锁定）
1. 选择“全体用户共享同一库”，默认代表：白名单内任意成员可读写全部业务数据。
2. 不做 tenant 隔离、不做角色权限。
3. LWW 依赖客户端时间戳，默认接受少量时钟偏差风险。
4. 自动同步间隔默认 30 秒，pull 批次默认 500。
5. tombstone 默认保留 90 天（后续可做定时清理）。
