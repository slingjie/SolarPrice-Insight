# 外部 URL 和接口清单
# External URLs and APIs Inventory

**最后更新 (Last Updated)**: 2026-02-09

---

## 📡 对外交互的所有 URL 和接口

### 1. AI 服务 (AI Services)

#### Google Gemini API
- **用途**: AI 电价表图片识别 (OCR)
- **SDK**: `@google/genai` v1.34.0
- **模型**: `gemini-2.0-flash-exp`
- **认证**: API Key (通过环境变量 `VITE_GEMINI_API_KEY`)
- **数据传输**: 
  - **发送**: Base64 编码的电价表图片 + JSON Prompt
  - **接收**: JSON 格式的结构化电价数据
- **隐私影响**: 用户上传的图片会传输到 Google 服务器
- **代码位置**: 
  - `services/geminiService.ts:11`
  - `components/Settings.tsx:18`

**实际端点** (由 SDK 管理):
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

---

### 2. 太阳能数据服务 (Solar Energy Services)

#### PVGIS API (JRC European Commission)
- **官方网站**: https://re.jrc.ec.europa.eu/
- **基础 URL**: `https://re.jrc.ec.europa.eu/api/v5_2`
- **代理路径**: `/api/pvgis` (通过 Vite proxy)
- **认证**: 无需认证 (公开 API)
- **数据传输**:
  - **发送**: 地理坐标、系统参数 (纬度、经度、倾角、方位角等)
  - **接收**: 光伏发电量预测数据 (年度、月度、小时级)
- **代码位置**: `services/pvgisService.ts`

**子端点**:

1. **PVcalc** - PV 系统输出计算
   ```
   GET /api/pvgis/PVcalc?lat={lat}&lon={lon}&peakpower={kWp}&loss={%}...
   ```
   - 参数: `lat`, `lon`, `peakpower`, `loss`, `angle`, `aspect`, `outputformat=json`
   - 返回: 年均发电量、最优倾角、系统性能等

2. **MRcalc** - 月度辐射数据
   ```
   GET /api/pvgis/MRcalc?lat={lat}&lon={lon}&outputformat=json
   ```
   - 参数: `lat`, `lon`, `outputformat=json`
   - 返回: 月度太阳辐射数据

3. **seriescalc** - 小时级时间序列
   ```
   GET /api/pvgis/seriescalc?lat={lat}&lon={lon}&startyear={year}&endyear={year}...
   ```
   - 参数: `lat`, `lon`, `peakpower`, `loss`, `angle`, `aspect`, `startyear`, `endyear`
   - 返回: 逐小时发电量数据 (CSV 格式)

**使用场景**:
- 光伏系统发电量预测
- 24 小时发电曲线生成
- 自消纳率计算

---

### 3. 地理编码服务 (Geocoding Services)

#### Nominatim (OpenStreetMap)
- **官方网站**: https://nominatim.openstreetmap.org/
- **基础 URL**: `https://nominatim.openstreetmap.org`
- **代理路径**: `/api/geocode` (部分使用，部分直接调用)
- **认证**: 无需认证
- **使用政策**: 遵守 [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- **数据传输**:
  - **发送**: 地址/城市名称查询
  - **接收**: 坐标 (经纬度)、格式化地址
- **代码位置**: 
  - `services/geocodeService.ts:9` (通过代理)
  - `components/pvgis/LocationInput.tsx:55` ⚠️ **直接调用，未使用代理**

**端点**:
```
GET https://nominatim.openstreetmap.org/search?q={地址}&format=json&limit=1
```

**请求头**:
```http
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
```

**⚠️ 安全问题**: 
- `LocationInput.tsx` 中存在直接调用外部服务的情况，未经过代理
- 建议修改为统一使用 `/api/geocode` 代理路径

---

### 4. CDN 资源 (Content Delivery Networks)

仅在 `index.html` 中使用，用于加载第三方库：

#### Tailwind CSS CDN
```html
<script src="https://cdn.tailwindcss.com"></script>
```
- **用途**: CSS 框架
- **文件**: `index.html:10`

#### Google Fonts
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```
- **用途**: Inter 字体
- **文件**: `index.html:11`
- **实际请求**: `https://fonts.gstatic.com/` (字体文件)

#### ESM.sh (ES Module CDN)
```html
<script type="importmap">
{
  "imports": {
    "recharts": "https://esm.sh/recharts@^3.6.0",
    "react": "https://esm.sh/react@^19.2.3",
    "lucide-react": "https://esm.sh/lucide-react@^0.562.0",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0"
  }
}
</script>
```
- **用途**: ES 模块动态导入映射
- **文件**: `index.html:19-30`
- **⚠️ 注意**: 仅用于开发/演示，生产环境应使用 `npm run build` 打包本地依赖

---

### 5. 本地资源 (Local Resources)

#### 中国地图 JSON
- **路径**: `/maps/china.json`
- **用途**: 省份边界可视化
- **代码位置**:
  - `services/provinceLookupService.ts:66`
  - `components/ChinaMap.tsx:61`
- **类型**: 静态本地文件，无外部请求

---

## 🔐 认证方式汇总

| 服务 | 认证方式 | 密钥位置 | 安全等级 |
|-----|---------|---------|---------|
| Google Gemini | API Key | 环境变量 `VITE_GEMINI_API_KEY` | 🔴 高敏感 |
| PVGIS | 无需认证 | - | 🟢 公开 API |
| Nominatim | 无需认证 | - | 🟢 公开 API |
| CDN 资源 | 无需认证 | - | 🟢 公开资源 |

---

## 📊 数据流向图

```
用户浏览器 (Browser)
    │
    ├─► IndexedDB/LocalStorage (本地存储)
    │   └─► 电价数据、配置、历史记录
    │
    ├─► Google Gemini API
    │   ├─ 发送: 电价表图片 (Base64)
    │   └─ 接收: 结构化电价数据 (JSON)
    │
    ├─► PVGIS API (通过代理)
    │   ├─ 发送: 地理坐标 + 系统参数
    │   └─ 接收: 发电量预测数据
    │
    ├─► Nominatim API
    │   ├─ 发送: 地址查询字符串
    │   └─ 接收: 坐标 (经纬度)
    │
    └─► CDN 资源
        ├─ Tailwind CSS
        ├─ Google Fonts
        └─ ESM.sh (模块加载)
```

---

## 🚨 安全注意事项

### API Key 管理
1. ✅ 使用环境变量存储 (`VITE_GEMINI_API_KEY`)
2. ✅ `.gitignore` 包含 `*.local` 规则
3. ⚠️ Vite 打包后 API Key 会包含在客户端代码中（不可避免）
4. ⚠️ 建议在 Google Cloud Console 设置 API Key 使用限制：
   - HTTP referrer 限制 (仅允许您的域名)
   - API 限制 (仅允许 Generative Language API)
   - 每日配额限制

### 数据隐私
1. **本地优先**: 95% 的数据存储在用户浏览器本地
2. **外部传输**:
   - 🔴 Google Gemini: 用户上传的电价表图片
   - 🟡 Nominatim: 用户搜索的地址信息
   - 🟢 PVGIS: 仅地理坐标 (无敏感信息)

### CORS 和代理
- ✅ PVGIS 通过 Vite proxy (`/api/pvgis`)
- ✅ Nominatim 部分通过 Vite proxy (`/api/geocode`)
- ⚠️ `LocationInput.tsx:55` 未使用代理，直接调用外部服务

**Vite 代理配置** (`vite.config.ts`):
```typescript
proxy: {
  '/api/pvgis': {
    target: 'https://re.jrc.ec.europa.eu/api/v5_2',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/pvgis/, ''),
  },
  '/api/geocode': {
    target: 'https://nominatim.openstreetmap.org',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/geocode/, '/search'),
  },
}
```

---

## 📋 合规性检查清单

- [ ] 隐私政策中披露 Google Gemini 数据传输
- [ ] 隐私政策中披露 OpenStreetMap 地址查询
- [ ] Nominatim 使用符合 OSM 使用政策 (Usage Policy)
- [ ] 在 AI 上传界面添加隐私提示
- [ ] 生产环境部署在 HTTPS 域名
- [ ] 添加 Content Security Policy (CSP)

---

## 🔄 版本历史

| 日期 | 变更内容 |
|------|---------|
| 2026-02-09 | 初始版本：完整列出所有外部 URL 和接口 |

---

**维护者**: SolarPrice Insight 开发团队  
**联系方式**: 见项目 README.md
