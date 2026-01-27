import React, { useEffect, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sun, MapPin, Battery, AlertCircle, Info } from 'lucide-react';
import { PROVINCES } from '../../constants';
import { parseConsumptionFile } from '../../utils/excelParser';
import { MonthlyConsumption, ExcelParseError } from '../../types/analysis';

interface PvConfig {
  lat: number | '';
  lon: number | '';
  capacity: number | '';
  tilt: number | '';
  azimuth: number | '';
  loss: number;
}

export const SelfConsumption: React.FC = () => {
  const [province, setProvince] = useState<string>('');
  const [consumptionData, setConsumptionData] = useState<MonthlyConsumption[]>([]);
  const [pvConfig, setPvConfig] = useState<PvConfig>({
    lat: '',
    lon: '',
    capacity: '',
    tilt: '',
    azimuth: '',
    loss: 14,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (consumptionData.length > 0 || province || pvConfig.capacity) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [consumptionData, province, pvConfig]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await parseConsumptionFile(file);
      setConsumptionData(data);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err instanceof ExcelParseError ? err.message : '文件解析失败，请检查格式');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePvConfigChange = (field: keyof PvConfig, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setPvConfig(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sun className="w-8 h-8 text-orange-500" />
          光伏消纳分析
        </h1>
        <p className="mt-2 text-gray-600">
          上传月度用电负荷数据，配置光伏系统参数，自动测算自发自用比例与收益。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">项目基础信息</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所在省份</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">请选择省份</option>
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-800">负荷数据导入</h2>
            </div>
            <div className="p-5">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:bg-gray-50 ${uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Upload className={`w-10 h-10 mx-auto mb-3 ${uploadError ? 'text-red-400' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-700">
                  {isUploading ? '正在解析...' : '点击上传 Excel 负荷表'}
                </p>
                <p className="text-xs text-gray-500 mt-1">支持 .xlsx, .xls 格式</p>
                {uploadError && (
                  <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {uploadError}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded text-left">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>表格需包含：月份、尖峰、高峰、平段、低谷、深谷（可选）列。系统会自动识别列名。</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
              <Battery className="w-5 h-5 text-orange-600" />
              <h2 className="font-semibold text-gray-800">光伏系统参数</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">装机容量 (kWp)</label>
                <input
                  type="number"
                  placeholder="例如: 1000"
                  value={pvConfig.capacity}
                  onChange={(e) => handlePvConfigChange('capacity', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">纬度 (Lat)</label>
                <input
                  type="number"
                  placeholder="31.23"
                  value={pvConfig.lat}
                  onChange={(e) => handlePvConfigChange('lat', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">经度 (Lon)</label>
                <input
                  type="number"
                  placeholder="121.47"
                  value={pvConfig.lon}
                  onChange={(e) => handlePvConfigChange('lon', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">倾角 (°)</label>
                <input
                  type="number"
                  placeholder="20"
                  value={pvConfig.tilt}
                  onChange={(e) => handlePvConfigChange('tilt', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">方位角 (°)</label>
                <input
                  type="number"
                  placeholder="0 (正南)"
                  value={pvConfig.azimuth}
                  onChange={(e) => handlePvConfigChange('azimuth', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">系统损耗 (%)</label>
                <input
                  type="number"
                  value={pvConfig.loss}
                  onChange={(e) => handlePvConfigChange('loss', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">默认 14% (含逆变器、线损、积灰等)</p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                负荷数据预览
              </h2>
              {consumptionData.length > 0 && (
                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  已解析 {consumptionData.length} 个月数据
                </span>
              )}
            </div>
            
            <div className="flex-1 overflow-auto p-0 relative min-h-[400px]">
              {consumptionData.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <FileSpreadsheet className="w-16 h-16 mb-4 opacity-20" />
                  <p>暂无数据</p>
                  <p className="text-sm mt-2">请在左侧上传 Excel 文件</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                    <tr>
                      <th className="p-3 pl-6">月份</th>
                      <th className="p-3 text-right">尖峰 (kWh)</th>
                      <th className="p-3 text-right">高峰 (kWh)</th>
                      <th className="p-3 text-right">平段 (kWh)</th>
                      <th className="p-3 text-right">低谷 (kWh)</th>
                      <th className="p-3 text-right">深谷 (kWh)</th>
                      <th className="p-3 text-right font-bold text-gray-700">总计 (kWh)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {consumptionData.map((row) => {
                      const total = row.tip + row.peak + row.flat + row.valley + row.deep;
                      return (
                        <tr key={row.month} className="hover:bg-blue-50 transition-colors">
                          <td className="p-3 pl-6 font-medium text-gray-900">{row.month}月</td>
                          <td className="p-3 text-right text-red-600">{row.tip.toLocaleString()}</td>
                          <td className="p-3 text-right text-orange-500">{row.peak.toLocaleString()}</td>
                          <td className="p-3 text-right text-green-600">{row.flat.toLocaleString()}</td>
                          <td className="p-3 text-right text-blue-500">{row.valley.toLocaleString()}</td>
                          <td className="p-3 text-right text-indigo-500">{row.deep.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-gray-800 bg-gray-50/50">
                            {total.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
