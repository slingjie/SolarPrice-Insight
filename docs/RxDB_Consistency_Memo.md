# 开发者速查指南：RxDB 数据一致性与同步优化

## 1. 核心逻辑
RxDB 的数据可靠性依赖于 **Schema 强校验** 与 **显式状态同步**。
- **字段完备性**：所有在 Schema 中标记为必填的字段（如 `last_modified`）在 `bulkInsert` 或 `bulkUpsert` 时必须显式初始化，否则 RxDB 会静默失败或抛出校验错误。
- **全量同步闭环**：在进行列表级别的更新时，必须遵循 `差异比对 -> bulkRemove(余项) -> bulkUpsert(现项)` 的模式，单纯的 `bulkUpsert` 无法处理物理删除逻辑。
- **响应式兜底**：UI 订阅（`Observable`）不应包含过滤空数据的逻辑（如 `if(docs.length > 0)`），以确保数据库清空时 UI 能同步重置。

## 2. 避坑指南
- **默认常量陷阱**：硬编码在代码中的初始配置（如 `DEFAULT_TIME_CONFIGS`）极易漏掉 Schema 迭代后新增的必填字段，导致主程序启动时数据库初始化失败。
- **软删除 vs 物理删除**：若业务需要物理删除，切记 RxDB 的 `bulkUpsert` 不会覆盖掉不在输入列表中的旧文档，必须手动计算差集并调用 `bulkRemove`。
- **订阅空状态阻塞**：在 `App.tsx` 等顶层容器建立 DB 订阅时，若由于习惯性防御（防止渲染空态）而过滤掉空数组，将导致用户删除最后一项数据后 UI 依然显示旧数据的假象。

## 3. 复用模版：RxDB 列表全量同步模式
```typescript
/**
 * 高效同步前端 List 到 RxDB 集合
 * 包含：差异化删除、字段补全、批量更新
 */
async function syncCollection<T extends { id: string }>(
  collection: RxCollection<T>, 
  newList: T[]
) {
  // 1. 获取当前数据库快照
  const existingDocs = await collection.find().exec();
  const existingIds = new Set(existingDocs.map(d => d.id));
  const newIds = new Set(newList.map(c => c.id));

  // 2. 执行物理删除动作
  const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
  if (idsToDelete.length > 0) {
    await collection.bulkRemove(idsToDelete);
  }

  // 3. 字段补全与批量更新 (Upsert)
  const docsToUpsert = newList.map(item => ({
    ...item,
    last_modified: (item as any).last_modified || new Date().toISOString(),
    _deleted: false // 确保显式覆盖软删除标记
  }));
  
  await collection.bulkUpsert(docsToUpsert);
}
```

## 4. 最佳实践
- 为所有集合添加 `last_modified` 或 `updated_at` 字段并建立索引，方便未来进行增量同步或冲突解决。
- 在 `createRxDatabase` 阶段始终包裹 `wrappedValidateAjvStorage` 或开启 `dev-mode` 插件，确保开发阶段第一时间捕获 Schema 校验错误。
