# SolarPrice Insight - 专业的分布式光伏电价分析工具

![SolarPrice Insight Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

SolarPrice Insight 是一款为分布式光伏开发者和能源项目经理设计的专业工具。它通过 AI 技术和直观的可视化界面，简化了复杂的电价表解析和收益测算过程。

## 🌟 核心特性

- **🤖 AI 智能电价识别**: 集成 Google Gemini 3 Flash 模型，支持通过图片（电价表、政策文档）自动提取复杂的电价矩阵，识别分类、电压等级及分时价格。
- **⏰ 时段配置管理 (TOU Library)**: 内置多省份分时电力时段规则库，支持自定义月份模式（如夏季/非夏季时段切换），精准管理尖峰、高峰、平段、低谷及深谷时段。
- **📈 年度趋势分析**: 提供自动化的年度电价走势图，支持同比/环比分析，帮助评估项目长期收益。
- **📊 分时曲线预览**: 实时生成 24 小时电价阶梯曲线，直观展现电价峰谷波形。
- **🛡️ 隐私与数据安全 (Local-First)**: 数据完全存储在浏览器本地（LocalStorage），结合 BYOK（自备 API Key）模式，确保企业数据敏感性。支持一键导出/导入完整数据库备份。

## 🚀 快速启动

### 前提条件
- Node.js (推荐 v18+)
- npm 或 yarn
- Google Gemini API Key

### 安装与运行
1. **克隆并安装依赖**:
   ```bash
   git clone https://github.com/slingjie/SolarPrice-Insight.git
   cd SolarPrice-Insight
   npm install
   ```

2. **环境变量配置**:
   在项目根目录创建 `.env.local` 文件并添加你的 API Key:
   ```env
   VITE_GEMINI_API_KEY=你的_GEMINI_API_KEY
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```
   访问 `http://localhost:3000` 即可开始使用。

## 🛠️ 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS
- **图表**: Recharts
- **图标**: Lucide React
- **AI 能力**: Google Generative AI (Gemini SDK)

## 📂 项目结构
- `/components`: UI 核心组件（Dashboard, SmartUpload, Analysis 等）
- `/services`: 外部服务集成（Gemini OCR 逻辑）
- `/constants.tsx`: 全局配置、省份列表及预置分时规则
- `/types.ts`: TypeScript 类型定义

---
*SolarPrice Insight - 助力光伏数字化转型。*
