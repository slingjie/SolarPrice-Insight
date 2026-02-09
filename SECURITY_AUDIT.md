# SolarPrice Insight - 安全审计报告
# Security Audit Report

**审计日期 (Audit Date)**: 2026-02-09  
**审计范围 (Audit Scope)**: 完整代码库安全分析  
**审计员 (Auditor)**: GitHub Copilot Security Agent

---

## 📋 执行摘要 (Executive Summary)

本报告针对 SolarPrice Insight 项目进行了全面的安全审计，重点关注：
1. **密钥泄漏风险** (Secret Leakage)
2. **外部接口交互** (External API Interactions)
3. **常见安全漏洞** (Common Vulnerabilities)

### 总体评估 (Overall Assessment)
- **安全等级**: ⚠️ **中等 (Medium)** - 存在一些需要改进的问题
- **严重问题**: 0 个
- **中等问题**: 2 个
- **轻微问题**: 3 个

---

## 🔐 1. 密钥和敏感信息检查 (Secret & Credential Analysis)

### ✅ 良好实践 (Good Practices)

1. **使用环境变量存储 API Key**
   - Gemini API Key 通过 `import.meta.env.VITE_GEMINI_API_KEY` 读取
   - 位置: `services/geminiService.ts:11`, `components/Settings.tsx:18`
   - 配置文件: `vite.config.ts:26-27`
   
2. **Git 忽略配置正确**
   - `.gitignore` 包含 `*.local` 规则，可以阻止 `.env.local` 文件提交
   - 未发现已提交的 `.env` 文件

3. **无硬编码密钥**
   - 代码库中未发现硬编码的 API Key 或 Token
   - Git 历史中未发现密钥泄漏记录

### ⚠️ 需要改进的问题 (Issues Found)

#### 问题 1: README.md 中的示例密钥格式
**文件**: `README.md:33`
```env
VITE_GEMINI_API_KEY=你的_GEMINI_API_KEY
```

**风险**: 低  
**影响**: 用户可能误将示例值当作真实密钥  
**建议**: 
```env
VITE_GEMINI_API_KEY=your-actual-api-key-here
# 或使用更明显的占位符
VITE_GEMINI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 问题 2: 缺少 `.env.example` 模板文件
**风险**: 低  
**影响**: 开发者可能不清楚需要配置哪些环境变量  
**建议**: 创建 `.env.example` 文件作为模板

---

## 🌐 2. 外部 URL 和接口清单 (External APIs & URLs)

### 2.1 AI 服务接口

| 服务名称 | 用途 | 文件位置 | 协议 | 认证方式 |
|---------|------|---------|------|---------|
| **Google Gemini API** | AI 电价表识别 (OCR) | `services/geminiService.ts` | HTTPS | API Key |
| - 模型 | `gemini-2.0-flash-exp` | - | - | - |
| - SDK | `@google/genai` v1.34.0 | - | - | - |

**请求详情**:
- **端点**: Google Generative AI SDK 内部管理
- **数据传输**: Base64 编码的图片 + JSON Prompt
- **响应格式**: JSON (`application/json`)
- **隐私影响**: 用户上传的电价表图片会发送到 Google 服务器

### 2.2 太阳能数据服务

| 服务名称 | 实际 URL | 代理路径 | 文件位置 | 功能 |
|---------|----------|---------|---------|------|
| **PVGIS API** | `https://re.jrc.ec.europa.eu/api/v5_2` | `/api/pvgis` | `services/pvgisService.ts` | 光伏发电量计算 |
| - PVcalc | `.../PVcalc` | - | - | PV 系统输出计算 |
| - MRcalc | `.../MRcalc` | - | - | 月度辐射数据 |
| - seriescalc | `.../seriescalc` | - | - | 小时级时间序列数据 |

**请求参数示例**:
```typescript
{
  lat: number,        // 纬度
  lon: number,        // 经度
  peakpower: number,  // 峰值功率 (kWp)
  loss: number,       // 系统损耗 (%)
  angle: number,      // 倾角 (度)
  aspect: number,     // 方位角 (度)
  startyear: number,  // 起始年份
  endyear: number     // 结束年份
}
```

**隐私影响**: 
- ✅ 仅发送地理坐标和技术参数，无用户身份信息
- ✅ 欧盟官方服务，数据安全性较高

### 2.3 地理编码服务

| 服务名称 | 实际 URL | 代理路径 | 文件位置 | 功能 |
|---------|----------|---------|---------|------|
| **Nominatim (OpenStreetMap)** | `https://nominatim.openstreetmap.org` | `/api/geocode` | `services/geocodeService.ts` | 地址转坐标 |

**⚠️ 直接调用位置**:
- `components/pvgis/LocationInput.tsx:55` - **未使用代理，直接调用外部服务**

**请求示例**:
```
GET https://nominatim.openstreetmap.org/search?q=城市名&format=json&limit=1
```

**隐私影响**:
- ⚠️ 用户搜索的地址会发送到 OpenStreetMap 服务器
- ⚠️ 可能包含项目敏感位置信息

### 2.4 CDN 资源 (仅用于 HTML)

| 资源 | URL | 文件位置 | 用途 |
|-----|-----|---------|------|
| Tailwind CSS | `https://cdn.tailwindcss.com` | `index.html:10` | CSS 框架 |
| Google Fonts | `https://fonts.googleapis.com` | `index.html:11` | Inter 字体 |
| ESM CDN | `https://esm.sh/*` | `index.html:22-27` | ES 模块导入映射 |

**⚠️ 问题**: 使用公共 CDN 可能存在供应链风险

### 2.5 本地资源

| 资源 | 路径 | 文件位置 | 用途 |
|-----|------|---------|------|
| 中国地图数据 | `/maps/china.json` | `services/provinceLookupService.ts`, `components/ChinaMap.tsx` | 省份地图可视化 |

**安全性**: ✅ 本地资源，无外部依赖

---

## 🛡️ 3. 常见安全漏洞检查 (Common Vulnerabilities)

### 3.1 跨站脚本攻击 (XSS)

**检查结果**: ✅ **未发现**

- ❌ 未使用 `dangerouslySetInnerHTML`
- ❌ 未使用 `innerHTML` 直接操作 DOM
- ❌ 未使用 `eval()` 或 `Function()` 构造函数
- ✅ React 默认对所有内容进行转义

### 3.2 跨站请求伪造 (CSRF)

**检查结果**: ✅ **不适用**

- 应用为纯前端应用 (Local-First)
- 所有数据存储在浏览器本地 (RxDB/IndexedDB)
- 无后端 API 需要 CSRF 保护

### 3.3 数据注入风险

**检查结果**: ⚠️ **需要验证**

#### 问题 3: Excel/JSON 导入数据验证不足

**文件**: `utils/dataImport.ts`

**风险**: 中等  
**影响**: 恶意构造的 Excel/JSON 文件可能导致：
1. 数据库污染 (根据代码注释，已修复空行问题)
2. 潜在的应用崩溃 (如果数据格式极端异常)

**现有防护**:
```typescript
// utils/dataImport.ts 已实现空行过滤
isRowNonEmpty() + rowValidators
```

**建议**: 
- ✅ 已有基础校验
- 建议添加数据类型严格验证 (使用 JSON Schema)
- 建议添加数据大小限制 (防止 DoS)

### 3.4 本地存储安全

**检查结果**: ⚠️ **需要注意**

#### 问题 4: 敏感数据本地存储

**文件**: `App.tsx:49-50`

**存储内容**:
- `localStorage.getItem('solar_tariffs_v2')` - 电价数据
- `localStorage.getItem('solar_time_configs_v2')` - 时段配置
- IndexedDB (RxDB) - 所有业务数据

**风险**: 低到中等  
**影响**: 
1. ✅ 电价数据一般不属于机密信息
2. ⚠️ 如果用户输入包含敏感项目信息（如客户名称、合同价格），则存在本地数据泄漏风险
3. ⚠️ XSS 漏洞可能导致 localStorage 被读取

**建议**:
- 如果数据包含敏感信息，考虑使用 Web Crypto API 加密
- 提醒用户在共享设备上使用隐私浏览模式

### 3.5 依赖安全

**检查结果**: ℹ️ **需定期检查**

**关键依赖**:
```json
{
  "@google/genai": "^1.34.0",
  "react": "^19.2.3",
  "rxdb": "^16.21.1",
  "xlsx": "^0.18.5"
}
```

**建议**: 
- 定期运行 `npm audit` 检查已知漏洞
- 关注 `xlsx` 库的安全更新 (解析外部文件的库风险较高)

### 3.6 日志泄漏

**检查结果**: ✅ **良好**

- 未发现敏感信息记录到 `console.log`
- 错误日志不包含 API Key 或密钥信息

---

## 🔍 4. 代码审计发现 (Code Review Findings)

### 4.1 HTTP vs HTTPS

**检查结果**: ⚠️ **混用**

- ✅ 所有外部 API 使用 HTTPS
- ⚠️ `index.html` 中的 CDN 链接使用 HTTPS
- ⚠️ 但本地开发服务器默认使用 HTTP (`vite.config.ts` 未强制 HTTPS)

**建议**: 
- 生产环境必须部署在 HTTPS 域名
- 开发环境可选配置 HTTPS (Vite 支持)

### 4.2 API 代理配置

**检查结果**: ✅ **良好**

`vite.config.ts` 正确配置了 CORS 代理:
```typescript
proxy: {
  '/api/pvgis': { target: 'https://re.jrc.ec.europa.eu/api/v5_2', ... },
  '/api/geocode': { target: 'https://nominatim.openstreetmap.org', ... }
}
```

**但存在不一致**:
- ⚠️ `LocationInput.tsx:55` 未使用代理，直接调用 Nominatim

### 4.3 Content Security Policy (CSP)

**检查结果**: ❌ **缺失**

- `index.html` 中无 CSP 头或 meta 标签
- 建议添加 CSP 防止 XSS:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.tailwindcss.com https://esm.sh;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com;
  font-src https://fonts.gstatic.com;
  connect-src 'self' https://generativelanguage.googleapis.com https://re.jrc.ec.europa.eu https://nominatim.openstreetmap.org;
  img-src 'self' data: blob:;
">
```

---

## 📊 5. 外部接口汇总表 (External Interfaces Summary)

| # | 服务 | 域名 | 用途 | 数据敏感度 | 建议 |
|---|-----|------|------|-----------|------|
| 1 | Google Gemini | `generativelanguage.googleapis.com` | AI OCR | 高 (用户上传图片) | ⚠️ 提醒用户数据传输至 Google |
| 2 | PVGIS | `re.jrc.ec.europa.eu` | 太阳能计算 | 低 (仅坐标) | ✅ 安全 |
| 3 | Nominatim | `nominatim.openstreetmap.org` | 地理编码 | 中 (项目地址) | ⚠️ 统一使用代理 |
| 4 | Tailwind CDN | `cdn.tailwindcss.com` | CSS 框架 | 无 | ℹ️ 考虑本地化 |
| 5 | Google Fonts | `fonts.googleapis.com` | 字体 | 无 | ℹ️ 可选本地化 |
| 6 | ESM CDN | `esm.sh` | 模块加载 | 无 | ⚠️ 供应链风险 |

---

## ✅ 7. 安全建议清单 (Security Recommendations)

### 高优先级 (High Priority)

1. **添加 `.env.example` 文件**
   ```env
   # Google Gemini API Key (required for AI features)
   # Get your key at: https://makersuite.google.com/app/apikey
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

2. **统一使用代理路径**
   - 修复 `LocationInput.tsx:55` 直接调用外部服务的问题
   - 所有外部 API 应通过 Vite proxy 访问

3. **添加 Content Security Policy**
   - 在 `index.html` 或生产环境服务器配置中添加 CSP 头

### 中优先级 (Medium Priority)

4. **添加数据导入大小限制**
   ```typescript
   // utils/dataImport.ts
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   if (file.size > MAX_FILE_SIZE) {
     throw new Error('文件过大，最大支持 10MB');
   }
   ```

5. **添加隐私提示**
   - 在 AI 上传功能处添加明显的隐私声明
   - 告知用户图片会传输到 Google 服务器

6. **本地化 CDN 资源**
   - 将 Tailwind CSS、字体等资源下载到本地
   - 减少对外部 CDN 的依赖

### 低优先级 (Low Priority)

7. **定期依赖审计**
   ```bash
   npm audit
   npm outdated
   ```

8. **考虑数据加密**
   - 如果用户数据包含敏感信息，使用 Web Crypto API 加密 localStorage

9. **添加 Subresource Integrity (SRI)**
   ```html
   <script src="https://cdn.tailwindcss.com" 
           integrity="sha384-..." 
           crossorigin="anonymous"></script>
   ```

---

## 📝 8. 合规性说明 (Compliance Notes)

### 数据隐私 (GDPR/PIPL)

- ✅ **Local-First 架构** 符合数据最小化原则
- ⚠️ **Google Gemini 调用** 需要在隐私政策中披露
- ⚠️ **OpenStreetMap 查询** 可能包含地理位置信息

**建议隐私政策内容**:
> 本应用使用以下第三方服务：
> 1. Google Gemini API - 用于 AI 图片识别，您上传的图片会传输至 Google 服务器进行处理
> 2. PVGIS API (欧盟联合研究中心) - 用于太阳能数据计算，仅传输地理坐标
> 3. OpenStreetMap Nominatim - 用于地址查询，传输您输入的地址信息
> 
> 除上述服务外，所有数据均存储在您的浏览器本地，我们不会将您的数据上传到任何服务器。

---

## 🎯 9. 总结 (Conclusion)

### 优点 (Strengths)
✅ 使用环境变量管理密钥  
✅ Local-First 架构保护用户隐私  
✅ 无明显的 XSS/SQL 注入风险  
✅ 所有外部 API 使用 HTTPS  
✅ 代码中无硬编码密钥

### 需要改进 (Areas for Improvement)
⚠️ 缺少 CSP 安全策略  
⚠️ 部分外部调用未使用代理  
⚠️ 缺少数据导入验证  
⚠️ 依赖公共 CDN (供应链风险)  
⚠️ 无明确的隐私政策提示

### 总体风险评估
**风险等级**: 🟡 **中等 (Medium)**

本项目在基础安全实践上做得较好，但在生产环境部署前需要完善：
1. 添加 CSP 和 SRI
2. 统一外部 API 调用方式
3. 添加用户隐私提示
4. 定期进行依赖安全审计

---

**审计完成时间**: 2026-02-09  
**下次审计建议**: 每次重大版本发布前或引入新的外部依赖时

