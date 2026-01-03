# RxDB 操作日志系统与 Schema 避坑指南

本指南总结了在 RxDB 中实现操作日志系统的核心逻辑、Schema 设计限制以及浏览器兼容性处理的最佳实践。

## 1. 核心逻辑

操作日志系统通过一个独立的 RxDB 集合（`operation_logs`）记录应用内所有敏感的数据变更。设计模式采用**解耦记录逻辑**：通过一个集中的 `logService` 封装 `insert` 操作，在各业务组件（`Manager`）执行更新/删除/导入等动作后，异步触发日志写入。日志条目包含时间戳、目标集合、动作类型（CRUD+Bulk）、影响行数及详细上下文，为数据追溯提供完整审计链。

## 2. 避坑指南

- **禁止使用保留字 (SC17 Error)**: RxDB 的文档对象中，顶层字段名严禁使用 `collection`、`schema`、`parent` 等保留字。若在 Schema 中定义 `collection: {type: "string"}` 会导致整个数据库初始化失败并抛出 `SC17` 错误。**修正方法**：使用 `target_collection` 或 `collection_name` 代替。
- **Schema 验证阻塞保存**: RxDB 是强 Schema 约束的。如果新增记录时缺少 `required` 列表中的字段，或者字段值不符合 `format`（如 `date-time` 格式不规范），`bulkUpsert` 或 `insert` 会静默失败（在 `App.tsx` 的捕获链中报错），导致 UI 看起来保存了但刷新后数据消失。
- **文件选择器被静默拦截**: Chrome 等浏览器对脚本触发的 `input.click()` 有严格限制。**修正方法**：在支持的浏览器上优先使用 `HTMLInputElement.showPicker()`，或者通过 `label` 元素原生关联，确保用户的点击行为能直接穿透到文件选择对话框。

## 3. 复用模版

### Schema 模版 (OperationLog)

```typescript
// services/db.ts
const operationLogSchema = {
    title: 'operation log schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        timestamp: { type: 'string', format: 'date-time' },
        target_collection: { type: 'string' }, // 避开保留字 'collection'
        action: { type: 'string' },
        count: { type: 'number' },
        details: { type: 'string', nullable: true }
    },
    required: ['id', 'timestamp', 'target_collection', 'action', 'count']
};
```

### 日志记录函数 (logService)

```typescript
// services/logService.ts
export const recordLog = async (
    targetCollection: LogCollection,
    action: LogAction,
    count: number,
    details?: string
): Promise<void> => {
    try {
        const db = await getDatabase();
        await db.operation_logs.insert({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            target_collection: targetCollection,
            action,
            count,
            details: details || null
        });
    } catch (err) {
        console.error('[LogService] Record failed:', err);
    }
};
```

## 4. 相关资源
- [RxDB Schema 文档](https://rxdb.info/rx-schema.html)
- [RxDB 错误码查询 (SC17)](https://rxdb.info/errors.html)
