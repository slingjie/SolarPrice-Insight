# PVGIS光伏发电量计算方案

**User:** 石凌杰 (mr.lingjie@gmail.com)  
**Created:** 12/28/2025 16:22:17  
**Updated:** 12/28/2025 16:37:28  
**Link:** [https://chatgpt.com/c/6950e8b8-2de0-8333-b026-f1e281e07790](https://chatgpt.com/c/6950e8b8-2de0-8333-b026-f1e281e07790)  

## Response:
下面我把\*\*“任务拆分版”**进一步整理为一份**「TodoList · 开发 Plan 文档」**。  
这个版本更偏**执行视角\*\*，适合：

*   你自己按步骤推进
*   或作为 **项目启动 / 周计划 / AI 辅助开发 checklist**
*   也可以直接贴进 Notion / 飞书文档作为开发计划页

我会做到这几点：

*   ✅ 线性顺序（从 0 → 可交付）
*   ✅ 每一条都是**可勾选 Todo**
*   ✅ 标注【前端 / 服务层 / RxDB】
*   ✅ 明确“做到什么程度算完成”

* * *

光伏发电量评估模块
=========

TodoList · 开发 Plan 文档
---------------------

* * *

阶段 0｜准备与统一认知（Day 0）
-------------------

### ☐ 0.1 确认技术形态（通用）

*   ☐ 确认使用 React + Vite 纯前端架构
*   ☐ 确认使用 `services` 目录封装 API 逻辑
*   ☐ 确认 PVGIS API 5.2 版本 endpoints

**完成标准**

*   不再讨论“是否需要 Node.js 后端”

* * *

### ☐ 0.2 固化计算口径（通用）

*   ☐ 方位角：0°=正南，东负西正
*   ☐ 倾角：PVGIS 最优倾角
*   ☐ 年型：典型年（TMY）
*   ☐ 发电量口径：AC 侧

**完成标准**

*   形成《计算口径说明》或在代码注释中明确
*   后续所有代码/报告严格遵循

* * *

阶段 1｜Project Setup & 类型定义（Day 1）
-------------------

### ☐ 1.1 定义 TypeScript 接口（types.ts）

*   ☐ 定义 `PVGISParams` (Lat, Lon, kWp, loss, etc.)
*   ☐ 定义 `PVSummary` (Annual, Monthly, PR)
*   ☐ 定义 `HourlyData` (Time, Power, Irradiance)

### ☐ 1.2 RxDB Schema 更新（db.ts）

*   ☐ 创建 `pvgis_cache` collection schema
*   ☐ 确认主键生成逻辑 (Hash of params)
*   ☐ 验证 Schema 注册成功

**完成标准**

*   应用启动无报错，RxDB 中可见新集合

* * *

阶段 2｜核心 Service 开发（Day 2）
------------------

### ☐ 2.1 创建 pvgisService.ts

*   ☐ 实现 `fetchPVGIS(params)` 基础方法
*   ☐ 处理 PVGIS API 参数映射 (CamelCase -> API snake_case)
*   ☐ 实现 `getPVSummary` (调用 `PVcalc`)
*   ☐ 实现 `getHourlyData` (调用 `tmy`)

**完成标准**

*   在 Console 调用 service 能拿到 PVGIS 原始 JSON 数据

### ☐ 2.2 衍生指标计算 (Services)

*   ☐ 实现 `calculatePR(energy, irradiance, capacity)`
*   ☐ 实现 `calculateFullLoadHours(energy, capacity)`
*   ☐ 封装到 `pvgisService` 统一返回

**完成标准**

*   Service 返回数据包含 calculated fields

* * *

阶段 3｜UI 组件开发 - 输入（Day 3）
----------------------------

### ☐ 3.1 位置输入组件 (LocationInput.tsx)

*   ☐ 经纬度输入框 (Lat/Lon)
*   ☐ (可选) 地址解析功能 (集成 OpenStreetMap 或输入框)
*   ☐ 校验坐标合法性

### ☐ 3.2 参数配置组件 (SystemParams.tsx)

*   ☐ 表单：装机容量 (kWp), 系统损耗 (%), 方位角 (Slider/Input)
*   ☐ 默认值填充 (10kWp, 14%, 0°)
*   ☐ 实时/手动触发计算按钮

**完成标准**

*   用户可输入，点击计算能触发 `console.log` 参数

* * *

阶段 4｜UI 组件开发 - 展示（Day 4）
------------------

### ☐ 4.1 核心指标卡片 (ResultsCard.tsx)

*   ☐ 展示年发电量 (Yearly Energy)
*   ☐ 展示 PR 值
*   ☐ 展示满发小时数

### ☐ 4.2 图表可视化 (Charts)

*   ☐ ECharts: 月度发电量柱状图
*   ☐ ECharts: 逐时功率曲线 (支持 Zoom)

**完成标准**

*   输入参数 -> Service -> UI 渲染闭环跑通

* * *

阶段 5｜缓存与优化（Day 5）
----------------

### ☐ 5.1 接入 RxDB 缓存

*   ☐ 在 `pvgisService` 中实现 Read-Through Cache 策略
*   ☐ 先查 `pvgis_cache`，未命中则 fetch 并写入
*   ☐ 实现简单的缓存清理或 TTL 检查

**完成标准**

*   第二次相同参数查询秒开，无 Network 请求

### ☐ 5.2 错误处理与 Loading

*   ☐ API 请求 Loading 状态 UI
*   ☐ 网络错误 / 参数错误 Toast 提示

* * *

阶段 6｜报告导出（Day 6）
----------------

### ☐ 6.1 PDF 生成 (Frontend)

*   ☐ 引入 `jspdf` 或 `react-to-print`
*   ☐ 设计简单报告模板 (Header, Summary, Charts, Footer)
*   ☐ 实现“导出报告”按钮功能

**完成标准**

*   点击可下载包含关键数据的 PDF 文件

* * *

阶段 7｜收尾与交付（Day 7）
-----------------

### ☐ 7.1 自动化测试 (Automated Testing)

*   ☐ 编写 `pvgisService.test.ts` (Vitest)
    *   Mock fetch 请求
    *   测试 PR 计算逻辑准确性
    *   测试参数转换逻辑
*   ☐ 测试 RxDB 缓存读写逻辑

### ☐ 7.2 代码 Review与清理

*   ☐ 移除 console.log
*   ☐ 完善 TSDoc 注释

### ☐ 7.2 最终验收

*   ✅ 输入地点 -> 输出结果
*   ✅ 离线/刷新后数据是否可恢复 (RxDB 持久化)
*   ✅ 报告导出可用

* * *

🎯 最终完成定义（Definition of Done）
-----------------------------

*   ✅ 纯前端实现，无额外后端部署依赖
*   ✅ 核心 PVGIS 功能完整可用
*   ✅ RxDB 缓存生效，体验流畅
*   ✅ 代码架构符合现有 React + TypeScript 规范
