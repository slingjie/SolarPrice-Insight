
# 开发者速查指南：PVGIS 光伏测算功能开发

本指南基于 2025-12-29 完成的 PVGIS 功能开发实战提炼。

## 1. 核心逻辑

-   **API 聚合**: PVGIS 的完整数据需要聚合三个端点：
    -   `PVcalc`: 核心发电量、PR、斜面辐照度、最佳倾角。
    -   `MRcalc`: 水平辐照度 (Horizontal Irradiance)。
    -   `seriescalc`: 小时级功率曲线 (Hourly Profile)。
-   **读穿式缓存 (Read-Through Cache)**:
    -   **Cache Key**: 将输入参数 (`PVGISParams`) 按 key 字母排序后 JSON 序列化，再计算 SHA-256 哈希值，确保参数顺序无关且唯一。
    -   **TTL**: 气候数据变化极小，可设置较长 TTL（如 30 天）。
-   **代理转发**: 必须在 Vite (`vite.config.ts`) 中配置 `/api/pvgis` 代理，否则浏览器端调用欧盟 JRC API 会必定触发 CORS 错误。

## 2. 避坑指南

-   **坑 1: 最佳倾角显示错误 (Optimal Slope)**
    -   **现象**: 当用户手动设置倾角（如 0°）时，API 返回的 `mounting_system.fixed.slope.value` 会变为 0。
    -   **后果**: UI 上显示的 "最佳倾角" 变成了用户设置的倾角，误导用户。
    -   **修正**: 即使在手动模式下，也必须**额外**并行发起一次 `optimalinclination=1` 的轻量级请求，专门用于获取真实的最佳倾角字段。

-   **坑 2: `useEffect` 与 `Promise.all` 的竞态条件**
    -   **现象**: `PVGISAnalysis` 组件内直接调用计算，且 `LocationInput` 内部有自动回调。
    -   **后果**: 页面加载时可能触发多次冗余计算，且难以取消旧请求。
    -   **修正**:
        1. 将 API 调用封装在无副作用的 Service 层 (`getPVData`)。
        2. UI 层严控触发时机：搜索时不触发，点击“计算”时触发，参数初始化时不触发。

## 3. 复用模版：API 请求与 SHA-256 缓存

```typescript
// services/pvgisHelper.ts

/**
 * 核心模式：生成稳定的 Cache Key
 * @param params 任意参数对象
 * @returns SHA-256 唯一指纹
 */
export async function generateCacheKey(params: Record<string, any>): Promise<string> {
    // 1. 排序键名，确保 {a:1, b:2} 和 {b:2, a:1} 生成相同的 Key
    const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
    }, {} as any);
    
    // 2. 生成 Hash
    const msgBuffer = new TextEncoder().encode(JSON.stringify(sortedParams));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * 核心模式：带代理的 API 请求封装
 * 适用于需要绕过 CORS 的第三方 API
 */
export async function fetchWithProxy(endpoint: string, params: Record<string, string>) {
    // Vite Proxy: ^/api/pvgis -> https://re.jrc.ec.europa.eu/api/v5_2/
    const API_BASE = '/api/pvgis'; 
    const query = new URLSearchParams(params).toString();
    
    const response = await fetch(`${API_BASE}/${endpoint}?${query}`);
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return await response.json();
}
```
