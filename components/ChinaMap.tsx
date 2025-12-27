
import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface ChinaMapProps {
    dataCounts: Record<string, number>;
    onProvinceSelect: (province: string) => void;
}

export const ChinaMap: React.FC<ChinaMapProps> = ({ dataCounts, onProvinceSelect }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const chartRef = useRef<ReactECharts>(null);

    useEffect(() => {
        const loadMap = async () => {
            try {
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
        const data = Object.entries(dataCounts).map(([name, value]) => ({
            name,
            value
        }));

        const maxVal = Math.max(...(Object.values(dataCounts) as number[]), 1);


        return {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: {
                    color: '#1e293b'
                },
                extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); backdrop-filter: blur(8px); border-radius: 8px;',
                formatter: (params: any) => {
                    const value = params.value;
                    const name = params.name;
                    if (!value || isNaN(value)) {
                        return `
                            <div style="font-family: sans-serif;">
                                <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${name}</div>
                                <div style="font-size: 12px; color: #94a3b8;">暂无数据</div>
                            </div>
                        `;
                    }
                    return `
                        <div style="font-family: sans-serif;">
                            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${name}</div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #2563eb;"></div>
                                <div style="font-size: 12px; color: #475569;">已收录 <span style="font-weight: bold; color: #2563eb;">${value}</span> 条数据</div>
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">点击查看详情</div>
                        </div>
                    `;
                }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                left: 'left',
                bottom: '20',
                text: ['高', '低'],
                calculable: true,
                inRange: {
                    color: ['#e0f2fe', '#bae6fd', '#3b82f6', '#1d4ed8'] // sky-100 to blue-700
                },
                textStyle: {
                    color: '#64748b'
                }
            },
            geo: {
                map: 'china',
                roam: true,
                zoom: 1.2,
                itemStyle: {
                    areaColor: '#f1f5f9',
                    borderColor: '#fff',
                    borderWidth: 1,
                    // Use shadow on geo component to create the depth effect
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10,
                    shadowOffsetY: 10
                },
                label: {
                    show: true,
                    color: '#94a3b8',
                    fontSize: 10
                },
                emphasis: {
                    label: { show: true, color: '#1e293b' },
                    itemStyle: {
                        areaColor: '#cbd5e1'
                    }
                }
            },
            series: [
                {
                    name: '电价数据',
                    type: 'map',
                    geoIndex: 0, // Bind to geo component
                    data: data,
                    // Series specific styles (colors) will be handled by visualMap
                    // Labels can be inherited from geo or overridden here
                    label: {
                        show: true,
                        color: '#475569',
                        fontSize: 10
                    },
                    emphasis: {
                        label: { show: true, color: '#1e293b' },
                        itemStyle: {
                            areaColor: '#fbbf24', // amber-400 highlight
                            shadowBlur: 0, // No extra shadow on the top layer
                            shadowOffsetY: 0
                        }
                    }
                }
            ]
        };
    };

    const onChartClick = (params: any) => {
        if (params.name) {
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
        <ReactECharts
            ref={chartRef}
            option={getOption()}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            onEvents={{
                click: onChartClick
            }}
        />
    );

};
