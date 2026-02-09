# 安全审计文档说明
# Security Audit Documentation

本目录包含 SolarPrice Insight 项目的完整安全审计文档。

---

## 📄 文档列表

### 1. [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
**完整安全审计报告**

包含内容：
- ✅ 密钥和敏感信息检查
- ✅ 常见安全漏洞分析 (XSS, CSRF, 注入等)
- ✅ 本地存储安全性评估
- ✅ 依赖安全审查
- ✅ 代码审计发现
- ✅ 安全建议清单 (按优先级分类)
- ✅ 合规性说明 (GDPR/PIPL)

**总体安全评级**: 🟡 **中等 (Medium)** - 基础安全实践良好，但需要完善生产环境配置

---

### 2. [EXTERNAL_APIS.md](./EXTERNAL_APIS.md)
**外部 URL 和接口完整清单**

详细列出项目对外交互的所有服务：
- 🤖 **Google Gemini API** - AI 电价表识别
- ☀️ **PVGIS API** - 太阳能发电量计算
- 🗺️ **Nominatim API** - 地理编码服务
- 📦 **CDN 资源** - Tailwind CSS, Google Fonts, ESM.sh

每个接口包含：
- 官方 URL 和代理配置
- 认证方式
- 数据传输内容
- 隐私影响评估
- 代码位置引用

---

### 3. [.env.example](./.env.example)
**环境变量配置模板**

用于引导开发者正确配置 API Key：
```env
VITE_GEMINI_API_KEY=your-actual-api-key-here
```

**使用方法**:
1. 复制 `.env.example` 为 `.env.local`
2. 填写真实的 API Key
3. 不要将 `.env.local` 提交到 Git

---

## 🔍 快速查阅指南

### 我想知道...

#### ❓ 项目是否存在密钥泄漏？
👉 查看 [SECURITY_AUDIT.md - 第 1 节](./SECURITY_AUDIT.md#1-密钥和敏感信息检查-secret--credential-analysis)

**结论**: ✅ **无密钥泄漏**
- 使用环境变量管理 API Key
- Git 历史中无泄漏记录
- `.gitignore` 正确配置

---

#### ❓ 项目调用了哪些外部接口？
👉 查看 [EXTERNAL_APIS.md - 完整清单](./EXTERNAL_APIS.md#-对外交互的所有-url-和接口)

**快速概览**:
| 服务 | URL | 用途 | 数据敏感度 |
|------|-----|------|-----------|
| Google Gemini | generativelanguage.googleapis.com | AI OCR | 高 (图片) |
| PVGIS | re.jrc.ec.europa.eu | 太阳能计算 | 低 (坐标) |
| Nominatim | nominatim.openstreetmap.org | 地址查询 | 中 (地址) |

---

#### ❓ 项目有哪些安全问题需要修复？
👉 查看 [SECURITY_AUDIT.md - 第 7 节](./SECURITY_AUDIT.md#7-安全建议清单-security-recommendations)

**高优先级问题** (3 个):
1. ⚠️ 添加 `.env.example` 文件 ✅ **已完成**
2. ⚠️ 统一使用代理路径 (`LocationInput.tsx` 直接调用外部服务)
3. ⚠️ 添加 Content Security Policy (CSP)

**中优先级问题** (3 个):
4. 添加数据导入大小限制
5. 添加 AI 上传隐私提示
6. 本地化 CDN 资源

---

#### ❓ 如何配置 API Key？
👉 查看 [.env.example](./.env.example)

**步骤**:
```bash
# 1. 复制模板文件
cp .env.example .env.local

# 2. 编辑 .env.local，填写真实 API Key
# VITE_GEMINI_API_KEY=你的真实密钥

# 3. 启动开发服务器
npm run dev
```

---

#### ❓ 用户数据的隐私如何保护？
👉 查看 [SECURITY_AUDIT.md - 第 8 节](./SECURITY_AUDIT.md#8-合规性说明-compliance-notes)

**隐私保护措施**:
- ✅ **Local-First 架构**: 95% 数据存储在用户浏览器本地
- ⚠️ **外部传输**: 仅 AI 功能需要上传图片到 Google
- ✅ **BYOK 模式**: 用户自己管理 API Key

**需要披露的数据传输**:
1. Google Gemini: 用户上传的电价表图片
2. PVGIS: 地理坐标 (无敏感信息)
3. Nominatim: 地址查询字符串

---

## 🎯 核心发现摘要

### ✅ 优点 (Strengths)
1. 无硬编码密钥
2. Local-First 架构保护用户隐私
3. 所有外部 API 使用 HTTPS
4. 无明显 XSS/注入漏洞
5. Git 历史干净，无密钥泄漏

### ⚠️ 需要改进 (Areas for Improvement)
1. 缺少 Content Security Policy (CSP)
2. 部分代码未使用代理直接调用外部服务
3. 依赖公共 CDN (供应链风险)
4. 缺少明确的隐私政策提示

### 🔴 严重问题
**无** - 未发现严重安全漏洞

---

## 📊 风险评级

| 类别 | 评级 | 说明 |
|------|------|------|
| **密钥管理** | 🟢 良好 | 使用环境变量，无泄漏 |
| **数据隐私** | 🟢 良好 | Local-First 架构 |
| **外部依赖** | 🟡 中等 | 依赖公共 CDN |
| **代码安全** | 🟢 良好 | 无明显漏洞 |
| **合规性** | 🟡 中等 | 需添加隐私声明 |

**总体风险**: 🟡 **中等 (Medium)**

---

## 🛠️ 后续行动

### 立即执行 (High Priority)
- [ ] 统一外部 API 调用方式 (修复 `LocationInput.tsx`)
- [ ] 添加 CSP 安全策略到 `index.html`

### 短期内完成 (Medium Priority)
- [ ] 添加数据导入文件大小限制
- [ ] 在 AI 上传界面添加隐私提示
- [ ] 编写隐私政策文档

### 长期优化 (Low Priority)
- [ ] 本地化 CDN 资源
- [ ] 定期运行 `npm audit` 检查依赖
- [ ] 考虑敏感数据加密存储

---

## 📝 维护说明

### 何时更新这些文档？
1. **添加新的外部 API** → 更新 `EXTERNAL_APIS.md`
2. **修改环境变量** → 更新 `.env.example`
3. **重大架构变更** → 重新运行安全审计
4. **发现安全问题** → 更新 `SECURITY_AUDIT.md`

### 定期审计频率
- **每次重大版本发布前**
- **引入新的外部依赖时**
- **至少每 6 个月一次**

---

## 🔗 相关资源

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google API Security](https://cloud.google.com/docs/security/best-practices)
- [GDPR Compliance Guide](https://gdpr.eu/)

---

**最后更新**: 2026-02-09  
**审计员**: GitHub Copilot Security Agent  
**下次审计**: 每次重大版本发布前
