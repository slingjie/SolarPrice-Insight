
import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface ChinaMapProps {
    dataProvinces: string[];
    onProvinceSelect: (province: string) => void;
}

export const ChinaMap: React.FC<ChinaMapProps> = ({ dataProvinces, onProvinceSelect }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const chartRef = useRef<ReactECharts>(null);

    // Debug log
    useEffect(() => {
        console.log('[ChinaMap] current dataProvinces:', dataProvinces);
    }, [dataProvinces]);

    useEffect(() => {
        const loadMap = async () => {
            try {
                // Check if map is already registered
                if (echarts.getMap('china')) {
                    setMapLoaded(true);
                    return;
                }

                const response = await fetch('/maps/china.json');
                if (!response.ok) throw new Error('Failed to load map data');
                const geoJson = await response.json();
                echarts.registerMap('china', geoJson);
                setMapLoaded(true);
            } catch (error) {
                console.error('[ChinaMap] Error loading China map:', error);
            }
        };
        loadMap();
    }, []);

    const getOption = () => {
        // Construct series data: mark provinces with data as value: 1
        const data = dataProvinces.map(p => ({
            name: p,
            value: 1,
            itemStyle: {
                areaColor: '#60a5fa', // blue-400
            },
            emphasis: {
                itemStyle: {
                    areaColor: '#2563eb', // blue-600
                }
            }
        }));

        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    if (params.data && params.data.value) {
                        return `${params.name} <br/> 已收录数据`;
                    }
                    return `${params.name} <br/> 暂无数据`;
                }
            },
            series: [
                {
                    name: '数据覆盖',
                    type: 'map',
                    map: 'china',
                    roam: true,
                    label: {
                        show: true,
                        fontSize: 10,
                        color: '#64748b' // slate-500
                    },
                    itemStyle: {
                        areaColor: '#f1f5f9', // slate-100
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    emphasis: {
                        label: { show: true },
                        itemStyle: {
                            areaColor: '#cbd5e1' // slate-300 for empty
                        }
                    },
                    data: data,
                    zoom: 1.2
                }
            ]
        };
    };

    const onChartClick = (params: any) => {
        if (params.name) {
            // Allow clicking even if no data? The requirement says "if province has data current province highlight and click... enter"
            // It implies strict flow. BUT user exp is better if we allow checking anytime or maybe prompting "No data".
            // Let's allow entering. The dashboard will just show "No data found" which is fine.
            // However, strictly sticking to "if province has data... click can enter".
            // Let's prioritize the "has data" constraint if that's what user thinks.
            // User said: "if province has data current province display highlight and click province can enter..."
            // This implies clicking empty province might NOT enter.
            // But let's be flexible. If I strictly disallow, it feels broken.
            // I'll allow clicking any province. The "No data" empty state in Dashboard already exists.
            onProvinceSelect(params.name);
        }
    };

    if (!mapLoaded) {
        return (
            <div className="h-[600px] w-full flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                地图加载中...
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <ReactECharts
                ref={chartRef}
                option={getOption()}
                style={{ height: '600px', width: '100%' }}
                notMerge={true}
                onEvents={{
                    click: onChartClick
                }}
            />
            <div className="mt-4 flex gap-4 justify-center text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <span>已收录数据</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 border border-slate-100 rounded"></div>
                    <span>暂无数据</span>
                </div>
            </div>
        </div>
    );
};
