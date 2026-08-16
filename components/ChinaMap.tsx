import React, { useEffect, useState, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { TariffData } from '../types';
import { normalizeProvinceName } from '../utils/provinceNormalize';

interface ChinaMapProps {
    dataCounts?: Record<string, number>;
    tariffs?: TariffData[];
    selectedProvince?: string;
    onProvinceSelect?: (province: string) => void;
    onSelectProvince?: (province: string) => void;
}

export const ChinaMap: React.FC<ChinaMapProps> = ({
    dataCounts,
    tariffs,
    selectedProvince,
    onProvinceSelect,
    onSelectProvince
}) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const chartRef = useRef<ReactECharts>(null);

    // 统一选择回调
    const handleSelect = onProvinceSelect || onSelectProvince || (() => {});

    // 计算省份计数，同时兼容简称与全称
    const resolvedCounts = useMemo<Record<string, number>>(() => {
        if (dataCounts && Object.keys(dataCounts).length > 0) {
            return dataCounts;
        }
        if (!tariffs || tariffs.length === 0) {
            return {};
        }
        const counts: Record<string, number> = {};
        tariffs.forEach((t) => {
            const raw = t.province;
            const norm = normalizeProvinceName(raw);
            counts[raw] = (counts[raw] || 0) + 1;
            if (norm && norm !== raw) {
                counts[norm] = (counts[norm] || 0) + 1;
            }
            // 补齐常用全称后缀
            if (!raw.endsWith('省') && !raw.endsWith('市') && !raw.endsWith('自治区')) {
                counts[`${raw}省`] = (counts[`${raw}省`] || 0) + 1;
                counts[`${raw}市`] = (counts[`${raw}市`] || 0) + 1;
                counts[`${raw}维吾尔自治区`] = (counts[`${raw}维吾尔自治区`] || 0) + 1;
                counts[`${raw}壮族自治区`] = (counts[`${raw}壮族自治区`] || 0) + 1;
                counts[`${raw}回族自治区`] = (counts[`${raw}回族自治区`] || 0) + 1;
                counts[`${raw}自治区`] = (counts[`${raw}自治区`] || 0) + 1;
            }
        });
        return counts;
    }, [dataCounts, tariffs]);

    useEffect(() => {
        const loadMap = async () => {
            try {
                if (echarts.getMap('china')) {
                    setMapLoaded(true);
                    return;
                }

                // 优先从 CDN 或本地加载中国地图 GeoJSON
                let geoJson = null;
                try {
                    const localRes = await fetch('/maps/china.json');
                    if (localRes.ok) {
                        geoJson = await localRes.json();
                    }
                } catch (e) {
                    console.warn('[ChinaMap] Local map fetch failed, trying fallback CDN...', e);
                }

                if (!geoJson) {
                    const cdnRes = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
                    if (!cdnRes.ok) throw new Error('Failed to load China map GeoJSON from CDN');
                    geoJson = await cdnRes.json();
                }

                echarts.registerMap('china', geoJson);
                setMapLoaded(true);
            } catch (error: any) {
                console.error('[ChinaMap] Error loading China map:', error);
                setMapError(error.message || '地图数据加载失败');
            }
        };
        loadMap();
    }, []);

    const getOption = () => {
        const safeCounts = resolvedCounts || {};
        const data = Object.entries(safeCounts).map(([name, value]) => ({
            name,
            value
        }));

        const values = (Object.values(safeCounts) as number[]).filter((v) => typeof v === 'number' && !isNaN(v));
        const maxVal = values.length > 0 ? Math.max(...values, 10) : 50;

        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [10, 14],
                textStyle: {
                    color: '#0f172a'
                },
                extraCssText: 'box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); backdrop-filter: blur(12px); border-radius: 12px;',
                formatter: (params: any) => {
                    const value = params.value;
                    const name = params.name;
                    if (!value || isNaN(value)) {
                        return `
                            <div style="font-family: system-ui, sans-serif;">
                                <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">${name}</div>
                                <div style="font-size: 11px; color: #94a3b8;">暂无电价收录</div>
                            </div>
                        `;
                    }
                    return `
                        <div style="font-family: system-ui, sans-serif;">
                            <div style="font-weight: bold; font-size: 13px; margin-bottom: 3px; color: #0f172a;">${name}</div>
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                                <div style="width: 7px; height: 7px; border-radius: 50%; background: #4f46e5;"></div>
                                <div style="font-size: 12px; color: #475569;">已收录 <b style="color: #4f46e5;">${value}</b> 条分时电价</div>
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">点击直接筛选该省</div>
                        </div>
                    `;
                }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                left: 'left',
                bottom: '10',
                text: ['多', '少'],
                calculable: true,
                inRange: {
                    color: ['#f1f5f9', '#e0e7ff', '#818cf8', '#4f46e5', '#3730a3']
                },
                textStyle: {
                    color: '#64748b',
                    fontSize: 11
                }
            },
            geo: {
                map: 'china',
                roam: true,
                zoom: 1.15,
                itemStyle: {
                    areaColor: '#f8fafc',
                    borderColor: '#cbd5e1',
                    borderWidth: 0.8,
                    shadowColor: 'rgba(0, 0, 0, 0.04)',
                    shadowBlur: 8,
                    shadowOffsetY: 4
                },
                label: {
                    show: true,
                    color: '#64748b',
                    fontSize: 10
                },
                emphasis: {
                    label: { show: true, color: '#0f172a', fontWeight: 'bold' },
                    itemStyle: {
                        areaColor: '#c7d2fe',
                        borderColor: '#6366f1',
                        borderWidth: 1.5
                    }
                }
            },
            series: [
                {
                    name: '电价数据',
                    type: 'map',
                    geoIndex: 0,
                    data: data,
                    label: {
                        show: true,
                        color: '#475569',
                        fontSize: 10
                    },
                    emphasis: {
                        label: { show: true, color: '#0f172a', fontWeight: 'bold' },
                        itemStyle: {
                            areaColor: '#c7d2fe'
                        }
                    }
                }
            ]
        };
    };

    const onChartClick = (params: any) => {
        if (params.name) {
            handleSelect(params.name);
        }
    };

    if (mapError) {
        return (
            <div className="h-96 w-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 gap-2">
                <div className="text-xs font-semibold text-rose-500">{mapError}</div>
                <div className="text-[11px]">请检查网络或地图资源加载</div>
            </div>
        );
    }

    if (!mapLoaded) {
        return (
            <div className="h-96 w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span>全国电价地图加载中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[460px] w-full">
            <ReactECharts
                ref={chartRef}
                option={getOption()}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                onEvents={{
                    click: onChartClick
                }}
            />
        </div>
    );
};
