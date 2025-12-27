### 开发者速查指南：RxDB 模式管理与迁移实战

针对 **"RxDB 数据持久化失效与版本迁移错误"** 问题总结的开发规范。

---

#### 1. 核心逻辑 (Core Logic)
*   **命名隔离原则**：RxDB 严禁在 Schema 文档中使用以下划线（`_`）开头的用户自定义字段（内部元数据除外）。在处理兼容性字段（如 `_modified`）时需重映射为业务名称（如 `last_modified`）。
*   **迁移闭环机制**：当 Schema 版本号（`version`）增加时，必须构成“**版本升级 + 迁移策略 + 迁移插件**”的完整闭环，缺失任一环节都会导致数据库初始化失败（RxError COL12）。
*   **必填项校验逻辑**：在持久化前，必须在服务层或组件层对 Schema 定义的 `required` 字段（如 `last_modified`, `id`）进行强制注入，确保数据 100% 符合 JSON-Schema 规范。

#### 2. 避坑指南 (Pitfalls & Fixes)
*   **错误：`RxError (COL12): A migrationStrategy is missing`**
    *   **原因**：Schema 的 `version` 增加了（如从 0 到 1），但在 `addCollections` 中未定义 `migrationStrategies`。
    *   **修正**：在集合配置中为每个增量版本提供迁移函数，即使数据为空也需提供。
*   **错误：`Error: You are using a function which must be overwritten by a plugin`**
    *   **原因**：在代码中使用了隔离插件的功能（如迁移策略），但未在 RxDB 全局实例中注册该插件。
    *   **修正**：显式调用 `addRxPlugin(RxDBMigrationSchemaPlugin)` 注入迁移引擎。

#### 3. 复用模版 (Code Template)
一段标准化的 RxDB 集合定义与鲁棒性初始化模版：

```typescript
import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';

// 1. 核心插件预注册
addRxPlugin(RxDBMigrationSchemaPlugin);

// 2. 参数化 Schema 定义
const mySchema = {
    version: 1, // 升级后需同步更新迁移策略
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        last_modified: { type: 'string', format: 'date-time' }, // 避开下划线命名
        _deleted: { type: 'boolean', default: false }
    },
    required: ['id', 'last_modified']
};

// 3. 构建数据库并注入策略
const db = await createRxDatabase({ /* ...config */ });
await db.addCollections({
    items: {
        schema: mySchema,
        migrationStrategies: {
            // 版本递增策略：确保新旧 Schema 数据平滑过渡
            1: (oldDoc: any) => {
                oldDoc.last_modified = oldDoc.last_modified || new Date().toISOString();
                return oldDoc;
            }
        }
    }
});
```
