/**
 * 地址解析服务 (Geocoding Service)
 * 使用 Nominatim (OpenStreetMap) 进行地址到坐标的转换
 * 远期可替换为高德地图 API
 */

import { GeocodeCandidate, GeocodeResponse } from '../types';

const API_BASE_URL = '/api/geocode'; // Uses Vite Proxy

/**
 * 搜索地址并返回候选位置列表
 * @param query 搜索关键词（地址/公司名称）
 * @param options 搜索选项
 */
export async function searchAddress(
    query: string,
    options: {
        limit?: number;
        countryCodes?: string; // e.g., 'cn' for China
    } = {}
): Promise<GeocodeResponse> {
    const { limit = 5, countryCodes = 'cn' } = options;

    const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: limit.toString(),
        addressdetails: '1',
    });

    if (countryCodes) {
        params.append('countrycodes', countryCodes);
    }

    const requestUrl = `${API_BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(requestUrl, {
            headers: {
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
        });

        if (!response.ok) {
            throw new Error(`Geocode API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform Nominatim response to our format
        const candidates: GeocodeCandidate[] = data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            displayName: item.display_name,
            provider: 'nominatim',
            confidence: item.importance ?? null,
        }));

        return {
            requestUrl: `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            candidates,
        };
    } catch (error) {
        console.error('Geocode search failed:', error);
        throw error;
    }
}

/**
 * 地址解析服务导出
 */
export const geocodeService = {
    searchAddress,
};
