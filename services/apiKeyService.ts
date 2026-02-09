/**
 * API Key 运行时管理服务 (BYOK - Bring Your Own Key)
 *
 * 安全设计：
 * - API Key 由用户在运行时输入，存储在 localStorage 中
 * - 不通过 Vite define / import.meta.env 注入到构建产物
 * - 构建产物中不包含任何 API Key 字面量
 */

const STORAGE_KEY = 'solar_gemini_api_key';

/**
 * 获取用户保存的 Gemini API Key
 */
export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

/**
 * 保存用户输入的 Gemini API Key
 */
export function setApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * 清除已保存的 API Key
 */
export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 检查是否已配置 API Key
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}
