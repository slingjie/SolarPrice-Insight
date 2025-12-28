
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationInputProps {
    lat: number;
    lon: number;
    onChange: (field: 'lat' | 'lon', value: number) => void;
    onLocationSelect?: (lat: number, lon: number) => void;
}

const CITIES = [
    { name: '杭州 (Hangzhou)', lat: 30.27, lon: 120.15 },
    { name: '上海 (Shanghai)', lat: 31.23, lon: 121.47 },
    { name: '北京 (Beijing)', lat: 39.90, lon: 116.40 },
    { name: '广州 (Guangzhou)', lat: 23.13, lon: 113.26 },
    { name: '深圳 (Shenzhen)', lat: 22.54, lon: 114.06 },
    { name: '南京 (Nanjing)', lat: 32.06, lon: 118.79 },
    { name: '成都 (Chengdu)', lat: 30.57, lon: 104.06 },
    { name: '武汉 (Wuhan)', lat: 30.59, lon: 114.30 },
    { name: '西安 (Xi\'an)', lat: 34.34, lon: 108.94 },
    { name: '重庆 (Chongqing)', lat: 29.56, lon: 106.55 },
    { name: '天津 (Tianjin)', lat: 39.08, lon: 117.20 },
    { name: '苏州 (Suzhou)', lat: 31.30, lon: 120.58 },
    { name: '长沙 (Changsha)', lat: 28.23, lon: 112.93 },
    { name: '郑州 (Zhengzhou)', lat: 34.75, lon: 113.62 },
    { name: '青岛 (Qingdao)', lat: 36.06, lon: 120.38 },
];

export const LocationInput: React.FC<LocationInputProps> = ({ lat, lon, onChange, onLocationSelect }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [foundAddress, setFoundAddress] = React.useState<string | null>(null);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = parseInt(e.target.value);
        if (index >= 0) {
            const city = CITIES[index];
            setFoundAddress(city.name);
            if (onLocationSelect) {
                onLocationSelect(city.lat, city.lon);
            } else {
                onChange('lat', city.lat);
                onChange('lon', city.lon);
            }
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setFoundAddress(null);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&addressdetails=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const newLat = parseFloat(result.lat);
                const newLon = parseFloat(result.lon);
                setFoundAddress(result.display_name);

                if (onLocationSelect) {
                    onLocationSelect(newLat, newLon);
                } else {
                    onChange('lat', newLat);
                    onChange('lon', newLon);
                }
            } else {
                alert('未找到该城市，请尝试搜索英文名或更详细的地址');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('搜索失败，请检查网络');
        } finally {
            setSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                地理位置
            </h3>

            {/* City Search */}
            <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium">搜索城市 / 地址</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="输入城市名 (如: Wuxi, 无锡)..."
                        className="flex-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || !searchQuery.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-3 rounded-lg transition-colors flex items-center justify-center min-w-[44px]"
                    >
                        {searching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Navigation size={16} className="rotate-45" />}
                    </button>
                </div>

                {foundAddress && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <span className="font-medium line-clamp-2">{foundAddress}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-xs text-slate-500 font-medium">常用城市列表</label>
                <div className="relative">
                    <select
                        onChange={handleCityChange}
                        className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white"
                        defaultValue={-1}
                    >
                        <option value={-1}>-- 自定义 / 选择城市 --</option>
                        {CITIES.map((city, idx) => (
                            <option key={idx} value={idx}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    <Navigation size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">纬度 (Latitude)</label>
                    <input
                        type="number"
                        value={lat}
                        onChange={(e) => onChange('lat', parseFloat(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        placeholder="30.27"
                        step="0.0001"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">经度 (Longitude)</label>
                    <input
                        type="number"
                        value={lon}
                        onChange={(e) => onChange('lon', parseFloat(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                        placeholder="120.15"
                        step="0.0001"
                    />
                </div>
            </div>
        </div>
    );
};
