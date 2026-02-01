import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Upload, FileSpreadsheet, Sun, MapPin, Battery, AlertCircle, Info, Loader2, Play,
  Zap, BarChart3, TrendingUp, Activity, Briefcase, Settings, Coins, FileText, Download
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { PROVINCES, DEFAULT_R_D } from '../../constants';
import { parseConsumptionFile } from '../../utils/excelParser';
import { parsePVExcelFile } from '../../utils/pvExcelParser';
import { inferProvince } from '../../services/provinceLookupService';
import { provinceMatches } from '../../utils/provinceNormalize';
import { 
  calculateAlignedConsumption, 
  AlignedConsumptionResult, 
  WorkSchedule, 
  WorkPattern,
  PVSource,
  HourlyAlignedRow
} from '../../services/consumptionAlignedService';
import { 
  calculateConsumptionFinancials, 
  ConsumptionFinancialResult 
} from '../../services/consumptionFinancials';
import { MonthlyConsumption, ExcelParseError } from '../../types/analysis';
import { PVGISParams, TimeConfig, TariffData, HourlyData } from '../../types';
import { pvgisService } from '../../services/pvgisService';
import { AnalysisSidebar } from './AnalysisSidebar';
import { exportSelfConsumptionHourlyCSV, exportSelfConsumptionMonthlyCSV } from '../../utils/exportUtils';
import { useHolidays } from '../../hooks/useDatabase';
import { expandHolidayDates } from '../../services/holidayService';
import { HolidayManager } from './HolidayManager';

interface SelfConsumptionProps {
  timeConfigs: TimeConfig[];
  tariffs: TariffData[];
  initialPvParams?: PVGISParams;
  initialPvHourlyData?: HourlyData[];
  onBack?: () => void;
}

interface PvConfig {
  lat: number | '';
  lon: number | '';
  capacity: number | '';
  tilt: number | '';
  azimuth: number | '';
  loss: number;
}

interface AnalysisResults {
  aligned: AlignedConsumptionResult;
  financial: ConsumptionFinancialResult;
}

export const SelfConsumption: React.FC<SelfConsumptionProps> = ({
  timeConfigs,
  tariffs,
  initialPvParams,
  initialPvHourlyData,
  onBack,
}) => {
  // Basic Project Info
  const [province, setProvince] = useState<string>('');
  const [isDetectingProvince, setIsDetectingProvince] = useState(false);
  const [provinceDetectError, setProvinceDetectError] = useState<string | null>(null);

  const provinceOptions = useMemo(() => {
    const list = province && !PROVINCES.includes(province) ? [province, ...PROVINCES] : PROVINCES;
    return Array.from(new Set(list));
  }, [province]);
  
  // Load Data State
  const [consumptionData, setConsumptionData] = useState<MonthlyConsumption[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // PV System State
  const [pvSourceType, setPvSourceType] = useState<'pvgis' | 'pv-excel'>('pvgis');
  const [pvConfig, setPvConfig] = useState<PvConfig>({
    lat: '',
    lon: '',
    capacity: '',
    tilt: '',
    azimuth: '',
    loss: 14,
  });
  const [pvExcelMap, setPvExcelMap] = useState<Map<string, number> | null>(null);
  const [isPvUploading, setIsPvUploading] = useState(false);
  const [pvUploadError, setPvUploadError] = useState<string | null>(null);

  const [prefetchedPvHourly, setPrefetchedPvHourly] = useState<HourlyData[] | null>(initialPvHourlyData ?? null);
  const [prefetchedPvParams, setPrefetchedPvParams] = useState<PVGISParams | null>(initialPvParams ?? null);
  
  // Work Schedule State
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    workStartHour: 9,
    workEndHour: 17,
    workPattern: '双休',
    R_B: 1, // Default flat load profile assumption outside work hours if unknown
    R_C: 1, 
    R_D: DEFAULT_R_D,
  });

  // Holiday State
  const { holidays, loading: holidaysLoading } = useHolidays();
  const [selectedHolidayIds, setSelectedHolidayIds] = useState<string[]>([]);
  const [isHolidayManagerOpen, setIsHolidayManagerOpen] = useState(false);

  // Financial / Tariff State
  const [tariffConfig, setTariffConfig] = useState({
    category: '',
    voltage: '',
    feedInPrice: 0.35
  });

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pvFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initialPvParams) return;
    setPvSourceType('pvgis');
    setPvConfig((prev) => ({
      ...prev,
      lat: initialPvParams.lat,
      lon: initialPvParams.lon,
      capacity: initialPvParams.peakPower,
      tilt: initialPvParams.angle ?? '',
      azimuth: initialPvParams.azimuth,
      loss: initialPvParams.loss,
    }));
    setPrefetchedPvParams(initialPvParams);
  }, [initialPvParams]);

  useEffect(() => {
    if (!initialPvHourlyData) return;
    setPrefetchedPvHourly(initialPvHourlyData);
  }, [initialPvHourlyData]);

  useEffect(() => {
    // Clear stale run errors as inputs change.
    setAnalysisError(null);
  }, [province, consumptionData, pvSourceType, pvConfig, pvExcelMap, tariffConfig, workSchedule]);

  function isSamePvgisParams(a: PVGISParams | null, b: PVGISParams): boolean {
    if (!a) return false;
    return (
      a.lat === b.lat &&
      a.lon === b.lon &&
      a.peakPower === b.peakPower &&
      a.loss === b.loss &&
      a.azimuth === b.azimuth &&
      (a.angle ?? null) === (b.angle ?? null)
    );
  }

  const detectProvince = async (opts: { force: boolean }) => {
    if (typeof pvConfig.lat !== 'number' || typeof pvConfig.lon !== 'number') return;
    if (!opts.force && province) return;

    setIsDetectingProvince(true);
    setProvinceDetectError(null);
    try {
      const detected = await inferProvince(pvConfig.lat, pvConfig.lon);
      if (!detected) {
        if (opts.force) setProvinceDetectError('未识别到省份（坐标可能在海域或边界附近）');
        return;
      }
      setProvince(detected);
      if (opts.force) {
        setTariffConfig((prev) => ({ ...prev, category: '', voltage: '' }));
      }
    } catch (err) {
      console.warn('Province detection failed:', err);
      if (opts.force) setProvinceDetectError('省份识别失败，请稍后重试或手动选择');
    } finally {
      setIsDetectingProvince(false);
    }
  };

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

  const handlePvExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPvUploading(true);
    setPvUploadError(null);

    try {
      const data = await parsePVExcelFile(file);
      setPvExcelMap(data);
    } catch (err) {
      console.error('PV Excel Upload failed:', err);
      setPvUploadError('PV文件解析失败，请确保格式为24x12 (Wh/kWp)');
    } finally {
      setIsPvUploading(false);
      if (pvFileInputRef.current) pvFileInputRef.current.value = '';
    }
  };

  const handlePvConfigChange = (field: keyof PvConfig, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setPvConfig(prev => ({ ...prev, [field]: numValue }));
  };

  // Tariff Selection Logic
  const tariffsForProvince = useMemo(() => {
    if (!province) return [];
    return tariffs.filter((t) => provinceMatches(t.province, province));
  }, [province, tariffs]);

  const availableCategories = useMemo(() => {
    if (!province) return [];
    return Array.from(new Set(tariffsForProvince.map(t => t.category)));
  }, [province, tariffsForProvince]);

  const availableVoltages = useMemo(() => {
    if (!province || !tariffConfig.category) return [];
    return Array.from(new Set(
      tariffsForProvince
        .filter(t => t.category === tariffConfig.category)
        .map(t => t.voltage_level)
    ));
  }, [province, tariffConfig.category, tariffsForProvince]);

  const relevantTariffs = useMemo(() => {
    if (!province || !tariffConfig.category || !tariffConfig.voltage) return [];
    return tariffsForProvince.filter((t) =>
      t.category === tariffConfig.category &&
      t.voltage_level === tariffConfig.voltage
    );
  }, [province, tariffConfig.category, tariffConfig.voltage, tariffsForProvince]);

  useEffect(() => {
    if (!province) return;
    if (tariffConfig.category && !availableCategories.includes(tariffConfig.category)) {
      setTariffConfig((prev) => ({ ...prev, category: '', voltage: '' }));
      return;
    }
    if (tariffConfig.voltage && !availableVoltages.includes(tariffConfig.voltage)) {
      setTariffConfig((prev) => ({ ...prev, voltage: '' }));
    }
  }, [province, availableCategories, availableVoltages, tariffConfig.category, tariffConfig.voltage]);

  const validateInputs = (): string | null => {
    if (!province) return '请选择所在省份';
    if (tariffsForProvince.length === 0) return '当前省份暂无电价数据，请先在电价库导入/生成';
    if (consumptionData.length === 0) return '请上传负荷数据';

    if (!Number.isFinite(workSchedule.workStartHour) || workSchedule.workStartHour < 0 || workSchedule.workStartHour > 23) {
      return '请输入有效的工作开始小时 (0~23)';
    }
    if (!Number.isFinite(workSchedule.workEndHour) || workSchedule.workEndHour < 0 || workSchedule.workEndHour > 23) {
      return '请输入有效的工作结束小时 (0~23)';
    }
    if (workSchedule.workStartHour >= workSchedule.workEndHour) return '工作时间需满足：开始小时 < 结束小时';
    if (!Number.isFinite(workSchedule.R_B) || workSchedule.R_B <= 0) return '请输入有效的 R_B (需 > 0)';
    if (!Number.isFinite(workSchedule.R_C) || workSchedule.R_C <= 0) return '请输入有效的 R_C (需 > 0)';
    if (workSchedule.R_D !== undefined && (!Number.isFinite(workSchedule.R_D) || workSchedule.R_D < 0)) return '请输入有效的 R_D (需 >= 0)';

    if (pvConfig.capacity === '' || pvConfig.capacity <= 0) return '请输入有效的装机容量';
    if (!Number.isFinite(pvConfig.loss) || pvConfig.loss < 0 || pvConfig.loss > 100) return '请输入有效的系统损耗 (0~100)';
    
    if (pvSourceType === 'pvgis') {
      if (pvConfig.lat === '' || pvConfig.lat < -90 || pvConfig.lat > 90) return '请输入有效的纬度 (-90 ~ 90)';
      if (pvConfig.lon === '' || pvConfig.lon < -180 || pvConfig.lon > 180) return '请输入有效的经度 (-180 ~ 180)';
      if (pvConfig.tilt !== '' && (pvConfig.tilt < 0 || pvConfig.tilt > 90)) return '请输入有效的倾角 (0 ~ 90)';
      if (pvConfig.azimuth !== '' && (pvConfig.azimuth < -180 || pvConfig.azimuth > 180)) return '请输入有效的方位角 (-180 ~ 180)';
    } else {
      if (!pvExcelMap) return '请上传PV发电数据文件';
    }

    if (!tariffConfig.category || !tariffConfig.voltage) return '请选择电价分类和电压等级';
    if (relevantTariffs.length === 0) return '所选“分类/电压等级”暂无电价数据，请更换选择或先导入数据';

    return null;
  };

  const handleAnalyze = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setAnalysisError(validationError);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setResults(null);

    try {
      // 1. Prepare PV Source
      let pvSource: PVSource;
      if (pvSourceType === 'pvgis') {
         const pvParams = {
          lat: pvConfig.lat as number,
          lon: pvConfig.lon as number,
          peakPower: pvConfig.capacity as number,
          loss: pvConfig.loss,
          azimuth: pvConfig.azimuth === '' ? 0 : (pvConfig.azimuth as number),
          angle: pvConfig.tilt === '' ? undefined : (pvConfig.tilt as number),
        };

        let hourlyData: HourlyData[];
        if (prefetchedPvHourly && isSamePvgisParams(prefetchedPvParams, pvParams)) {
          hourlyData = prefetchedPvHourly;
        } else {
          const pvgisResult = await pvgisService.getPVData(pvParams);
          hourlyData = pvgisResult.hourly;
          setPrefetchedPvHourly(hourlyData);
          setPrefetchedPvParams(pvParams);
        }

        pvSource = { type: 'pvgis', hourlyData };
      } else {
        if (!pvExcelMap) throw new Error('PV Excel map missing');
        pvSource = { 
          type: 'pv-excel', 
          pvWhPerKwpByTimeKey: pvExcelMap, 
          pvCapacityKwp: pvConfig.capacity as number 
        };
      }

      // 2. Run Aligned Engine
      const selectedHolidays = holidays.filter(h => selectedHolidayIds.includes(h.id));
      const expandedHolidays = selectedHolidays.flatMap(h => expandHolidayDates(h));

      const alignedResult = calculateAlignedConsumption({
        provinceName: province,
        timeConfigs,
        monthlyConsumption: consumptionData,
        pvSource,
        workSchedule: {
          ...workSchedule,
          holidays: expandedHolidays
        }
      });

      // 3. Prepare Financials
      if (relevantTariffs.length === 0) {
        throw new Error('所选“分类/电压等级”暂无电价数据');
      }

      const financialResult = calculateConsumptionFinancials({
        hourly: alignedResult.hourly,
        tariffs: relevantTariffs,
        feedInTariff: tariffConfig.feedInPrice
      });

      setResults({
        aligned: alignedResult,
        financial: financialResult
      });
      
      setSelectedMonth(1);

    } catch (err) {
      console.error('[SelfConsumption] Analysis failed:', err);
      setAnalysisError(err instanceof Error ? `分析失败: ${err.message}` : '分析失败，请检查参数');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isAnalyzeDisabled = isAnalyzing || !!validateInputs();

  // Charts Data Preparation
  const monthlyData = useMemo(() => {
    if (!results) return [];
    return results.aligned.monthly.map(m => ({
      month: m.month,
      selfConsumed: m.selfConsumption,
      gridFeedIn: m.gridExport,
      gridDraw: m.gridImport
    }));
  }, [results]);

  const typicalDayData = useMemo(() => {
    if (!results) return [];
    // Calculate average hourly profile for the selected month
    const monthHours = results.aligned.hourly.filter(h => h.month === selectedMonth);
    const hourlyAvg = new Array(24).fill(0).map((_, hour) => {
      const hoursInMonth = monthHours.filter(h => h.hour === hour);
      const count = hoursInMonth.length;
      if (count === 0) return { hour, pvKw: 0, loadKw: 0 };
      
      const totalPv = hoursInMonth.reduce((sum, h) => sum + h.pvKwh, 0);
      const totalLoad = hoursInMonth.reduce((sum, h) => sum + h.loadKwh, 0);
      
      return {
        hour,
        pvKw: totalPv / count,   // Avg Energy per hour = Avg Power (kW)
        loadKw: totalLoad / count
      };
    });
    return hourlyAvg;
  }, [results, selectedMonth]);

  const warnings = useMemo(() => {
    if (!results) return [] as string[];
    const list = [...(results.aligned.warnings ?? []), ...(results.financial.warnings ?? [])].filter((x) => typeof x === 'string' && x.trim() !== '');
    return Array.from(new Set(list));
  }, [results]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <AnalysisSidebar onBack={onBack || (() => {})} />

      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl 2xl:max-w-none mx-auto space-y-8 pb-20" data-testid="sc-container">
          <header>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sun className="w-8 h-8 text-orange-500" />
              光伏消纳分析 (Aligned Engine)
            </h1>
            <p className="mt-2 text-gray-600">
              基于8760小时对齐引擎，精确测算分时电价下的光伏自用与收益。
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Inputs */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Project Info */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-800">项目基础信息</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所在省份</label>
                    <div className="flex gap-2">
                      <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">请选择省份</option>
                        {provinceOptions.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      {(typeof pvConfig.lat === 'number' && typeof pvConfig.lon === 'number') && (
                        <button 
                          onClick={() => detectProvince({ force: true })}
                          disabled={isDetectingProvince}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDetectingProvince
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          title="根据经纬度自动识别"
                        >
                          {isDetectingProvince ? '识别中...' : '识别'}
                        </button>
                      )}
                    </div>
                    {provinceDetectError && (
                      <p className="mt-2 text-sm text-amber-700 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {provinceDetectError}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. Load Data */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  <h2 className="font-semibold text-gray-800">负荷数据</h2>
                </div>
                <div className="p-5 space-y-4">
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
                      {isUploading ? '正在解析...' : (consumptionData.length > 0 ? `已导入 ${consumptionData.length} 个月数据` : '点击上传 Excel 负荷表')}
                    </p>
                    {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
                  </div>

                  {/* Work Schedule */}
                  <div className="pt-2 border-t border-gray-100">
                     <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">工作作息配置</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">工作时间</label>
                          <div className="flex items-center gap-1">
                             <input type="number" min={0} max={23} className="w-full rounded border-gray-300 py-1 text-center"
                               value={workSchedule.workStartHour} onChange={e => setWorkSchedule(prev => ({...prev, workStartHour: Number(e.target.value)}))} />
                             <span>-</span>
                             <input type="number" min={0} max={23} className="w-full rounded border-gray-300 py-1 text-center"
                               value={workSchedule.workEndHour} onChange={e => setWorkSchedule(prev => ({...prev, workEndHour: Number(e.target.value)}))} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">休假模式</label>
                          <select className="w-full rounded border-gray-300 py-1"
                             value={workSchedule.workPattern} 
                             onChange={e => setWorkSchedule(prev => ({...prev, workPattern: e.target.value as WorkPattern}))}
                          >
                             <option value="双休">双休</option>
                             <option value="单休">单休</option>
                             <option value="无休">无休</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">工作日非工作系数 (R_B)</label>
                          <input type="number" step={0.1} className="w-full rounded border-gray-300 py-1"
                             value={workSchedule.R_B} onChange={e => setWorkSchedule(prev => ({...prev, R_B: Number(e.target.value)}))} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">休息日系数 (R_C)</label>
                          <input type="number" step={0.1} className="w-full rounded border-gray-300 py-1"
                             value={workSchedule.R_C} onChange={e => setWorkSchedule(prev => ({...prev, R_C: Number(e.target.value)}))} />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">节假日系数 (R_D)</label>
                          <input type="number" step={0.1} className="w-full rounded border-gray-300 py-1"
                             value={workSchedule.R_D} onChange={e => setWorkSchedule(prev => ({...prev, R_D: Number(e.target.value)}))} />
                        </div>
                        
                        {/* Holiday Selection */}
                        <div className="col-span-2 pt-2 border-t border-gray-100 mt-2">
                           <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-medium text-gray-700">节假日配置</label>
                              <button
                                onClick={() => setIsHolidayManagerOpen(true)}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                              >
                                编辑节假日库
                              </button>
                           </div>
                           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                             {holidaysLoading ? (
                               <span className="text-xs text-gray-400">加载中...</span>
                             ) : holidays.length === 0 ? (
                               <span className="text-xs text-gray-400">暂无节假日数据</span>
                             ) : (
                               holidays.map((holiday) => (
                                 <label key={holiday.id} className="flex items-center gap-1.5 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer transition-colors bg-white">
                                   <input
                                     type="checkbox"
                                     checked={selectedHolidayIds.includes(holiday.id)}
                                     onChange={(e) => {
                                       if (e.target.checked) {
                                         setSelectedHolidayIds(prev => [...prev, holiday.id]);
                                       } else {
                                         setSelectedHolidayIds(prev => prev.filter(id => id !== holiday.id));
                                       }
                                     }}
                                     className="rounded border-gray-300 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                                   />
                                   <span className="font-medium text-gray-700">{holiday.name}</span>
                                   <span className="text-gray-400 text-[10px] scale-95 font-mono">
                                     {holiday.startDate === holiday.endDate ? holiday.startDate : `${holiday.startDate}~${holiday.endDate}`}
                                   </span>
                                 </label>
                               ))
                             )}
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </section>

              {/* 3. Tariff Config */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  <h2 className="font-semibold text-gray-800">电价配置</h2>
                </div>
                <div className="p-5 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">用电分类</label>
                        <select 
                          className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                          value={tariffConfig.category}
                          onChange={e => setTariffConfig(prev => ({ ...prev, category: e.target.value, voltage: '' }))}
                          disabled={!province}
                        >
                          <option value="">请选择</option>
                          {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">电压等级</label>
                        <select 
                          className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                          value={tariffConfig.voltage}
                          onChange={e => setTariffConfig(prev => ({ ...prev, voltage: e.target.value }))}
                          disabled={!tariffConfig.category}
                        >
                          <option value="">请选择</option>
                          {availableVoltages.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">上网电价 (元/kWh)</label>
                        <input 
                          type="number" 
                          step={0.01}
                          className="w-full rounded-md border-gray-300 shadow-sm"
                          value={tariffConfig.feedInPrice}
                          onChange={e => {
                            const next = Number(e.target.value);
                            setTariffConfig(prev => ({...prev, feedInPrice: Number.isFinite(next) ? next : 0 }));
                          }}
                        />
                      </div>
                   </div>
                </div>
              </section>

              {/* 4. PV System */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Battery className="w-5 h-5 text-orange-600" />
                  <h2 className="font-semibold text-gray-800">光伏系统参数</h2>
                </div>
                <div className="p-5 space-y-4">
                  
                  {/* Source Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                    <button 
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${pvSourceType === 'pvgis' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setPvSourceType('pvgis')}
                    >
                      PVGIS 模拟
                    </button>
                    <button 
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${pvSourceType === 'pv-excel' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      onClick={() => setPvSourceType('pv-excel')}
                    >
                      导入发电表
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                    {pvSourceType === 'pvgis' ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">纬度 (Lat)</label>
                          <input
                            type="number"
                            placeholder="31.23"
                            value={pvConfig.lat}
                            onChange={(e) => {
                              handlePvConfigChange('lat', e.target.value);
                              // Detect province on change/blur could be triggered here
                            }}
                            onBlur={() => detectProvince({ force: false })}
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
                            onBlur={() => detectProvince({ force: false })}
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
                            className="w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">方位角 (°)</label>
                          <input
                            type="number"
                            placeholder="0 (正南)"
                            value={pvConfig.azimuth}
                            onChange={(e) => handlePvConfigChange('azimuth', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm"
                          />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-xs font-medium text-gray-500 uppercase mb-1">系统损耗 (%)</label>
                           <input
                             type="number"
                             value={pvConfig.loss}
                             onChange={(e) => handlePvConfigChange('loss', e.target.value)}
                             className="w-full rounded-md border-gray-300 shadow-sm"
                           />
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <div 
                          className={`border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${pvUploadError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                          onClick={() => pvFileInputRef.current?.click()}
                        >
                          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" ref={pvFileInputRef} onChange={handlePvExcelUpload} />
                          <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">
                             {pvExcelMap ? '已导入数据' : '上传 24x12 发电表'}
                          </p>
                          {pvUploadError && <p className="text-xs text-red-500 mt-1">{pvUploadError}</p>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                           格式要求：首列为小时(0-23)，表头包含月份(1-12月)，单元格单位 Wh/kWp。
                        </p>
                      </div>
                    )}

                    <div className="col-span-2 pt-2">
                      <button
                        onClick={handleAnalyze}
                        disabled={!!isAnalyzeDisabled}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
                          isAnalyzeDisabled
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            开始分析
                          </>
                        )}
                      </button>
                      {analysisError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {analysisError}
                        </p>
                      )}
                    </div>
                    {province && tariffsForProvince.length === 0 && (
                      <p className="text-sm text-amber-700 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        当前省份暂无电价数据，请先在电价库导入/生成。
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Results */}
            <div className="lg:col-span-8 space-y-6">
               {/* 1. Load Preview (if no results) */}
               {!results && (
                 <section className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
                   <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                     <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                       <FileSpreadsheet className="w-5 h-5 text-gray-500" />
                       负荷数据预览
                     </h2>
                   </div>
                   <div className="flex-1 overflow-auto p-0 relative">
                      {consumptionData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <FileSpreadsheet className="w-16 h-16 mb-4 opacity-20" />
                          <p>暂无数据</p>
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                            <tr>
                              <th className="p-3 pl-6">月份</th>
                              <th className="p-3 text-right">尖 (kWh)</th>
                              <th className="p-3 text-right">峰 (kWh)</th>
                              <th className="p-3 text-right">平 (kWh)</th>
                              <th className="p-3 text-right">谷 (kWh)</th>
                              <th className="p-3 text-right">深 (kWh)</th>
                              <th className="p-3 text-right font-bold">总计</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {consumptionData.map((row) => {
                              const total = row.tip + row.peak + row.flat + row.valley + row.deep;
                              return (
                                <tr key={row.month} className="hover:bg-blue-50">
                                  <td className="p-3 pl-6 font-medium">{row.month}月</td>
                                  <td className="p-3 text-right text-red-600">{row.tip.toLocaleString()}</td>
                                  <td className="p-3 text-right text-orange-500">{row.peak.toLocaleString()}</td>
                                  <td className="p-3 text-right text-green-600">{row.flat.toLocaleString()}</td>
                                  <td className="p-3 text-right text-blue-500">{row.valley.toLocaleString()}</td>
                                  <td className="p-3 text-right text-indigo-500">{row.deep.toLocaleString()}</td>
                                  <td className="p-3 text-right font-bold bg-gray-50/50">{total.toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                   </div>
                 </section>
               )}

               {/* 2. Analysis Results */}
                {results && (
                   <div className="space-y-6">
                     {warnings.length > 0 && (
                       <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 mt-0.5 text-amber-700" />
                          <div className="text-sm leading-relaxed">
                            <div className="font-semibold">提示 / 警告</div>
                            <div className="mt-1">
                              {warnings.slice(0, 4).join('；')}
                              {warnings.length > 4 ? `…（共 ${warnings.length} 条）` : ''}
                            </div>
                          </div>
                        </div>
                       </div>
                     )}

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const dateStr = new Date().toISOString().split('T')[0];
                            exportSelfConsumptionHourlyCSV(
                              results.aligned.hourly,
                              results.financial.hourly,
                              `consumption_hourly_${dateStr}.csv`
                            );
                          }}
                          className="text-sm flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors"
                          title="导出 8760 行逐时明细"
                        >
                          <Download size={16} /> 导出逐时明细
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const dateStr = new Date().toISOString().split('T')[0];
                            exportSelfConsumptionMonthlyCSV(
                              results.aligned.monthly,
                              results.financial.byMonth,
                              `consumption_monthly_${dateStr}.csv`
                            );
                          }}
                          className="text-sm flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
                          title="导出 12 行月度汇总"
                        >
                          <Download size={16} /> 导出月度汇总
                        </button>
                      </div>

                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-10"><Activity className="w-16 h-16 text-green-600" /></div>
                         <p className="text-sm text-gray-500 font-medium">自发自用率</p>
                         <p className="text-2xl font-bold text-green-600 mt-2">
                           {(results.aligned.kpis.selfConsumptionRate * 100).toFixed(1)}%
                         </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-10"><Zap className="w-16 h-16 text-orange-600" /></div>
                         <p className="text-sm text-gray-500 font-medium">自给率</p>
                         <p className="text-2xl font-bold text-orange-500 mt-2">
                           {(results.aligned.kpis.selfSufficiencyRate * 100).toFixed(1)}%
                         </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-10"><Sun className="w-16 h-16 text-amber-500" /></div>
                         <p className="text-sm text-gray-500 font-medium">年发电量 (MWh)</p>
                         <p className="text-2xl font-bold text-amber-500 mt-2">
                           {(results.aligned.kpis.totalPVGeneration / 1000).toFixed(1)}
                         </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-10"><Coins className="w-16 h-16 text-blue-600" /></div>
                         <p className="text-sm text-gray-500 font-medium">年节省电费 (万元)</p>
                         <p className="text-2xl font-bold text-blue-600 mt-2">
                           {(results.financial.totals.savingsVsNoPv / 10000).toFixed(2)}
                         </p>
                      </div>
                    </div>

                    {/* Financial Detail Card */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                       <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                          <Coins className="w-5 h-5 text-gray-500" />
                          收益测算详情
                       </h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="p-3 bg-gray-50 rounded-lg">
                             <p className="text-gray-500 mb-1">原始电费 (无光伏)</p>
                             <p className="font-semibold text-gray-900">¥ {results.financial.totals.baselineGridCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                             <p className="text-gray-500 mb-1">折后电费 (含光伏)</p>
                             <p className="font-semibold text-gray-900">¥ {results.financial.totals.importCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                             <p className="text-gray-500 mb-1">上网收益</p>
                             <p className="font-semibold text-green-600">¥ {results.financial.totals.exportRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                             <p className="text-blue-600 mb-1 font-medium">净节省</p>
                             <p className="font-bold text-blue-700">¥ {results.financial.totals.savingsVsNoPv.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                          </div>
                       </div>
                    </div>

                    {/* Monthly Chart */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-gray-500" />
                          月度电量分析
                        </h3>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tickFormatter={(val) => `${val}月`} />
                            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(val: number) => val.toLocaleString(undefined, { maximumFractionDigits: 0 })} labelFormatter={(l) => `${l}月`} />
                            <Legend />
                            <Bar dataKey="selfConsumed" name="自发自用" stackId="a" fill="#16a34a" />
                            <Bar dataKey="gridFeedIn" name="上网电量" stackId="a" fill="#f97316" />
                            <Bar dataKey="gridDraw" name="网购电量" stackId="b" fill="#9ca3af" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    {/* Typical Day Chart */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-gray-500" />
                          典型日负荷曲线 (平均)
                        </h3>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(Number(e.target.value))}
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m}月</option>
                          ))}
                        </select>
                      </div>
                      <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={typicalDayData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="hour" tickFormatter={(val) => `${val}:00`} />
                             <YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
                             <Tooltip formatter={(val: number) => val.toFixed(1)} labelFormatter={(l) => `${l}:00`} />
                             <Legend />
                             <Line type="monotone" dataKey="pvKw" name="光伏出力" stroke="#f59e0b" strokeWidth={2} dot={false} />
                             <Line type="monotone" dataKey="loadKw" name="用电负荷" stroke="#3b82f6" strokeWidth={2} dot={false} />
                           </LineChart>
                         </ResponsiveContainer>
                      </div>
                    </section>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>

      <HolidayManager 
        isOpen={isHolidayManagerOpen}
        onClose={() => setIsHolidayManagerOpen(false)}
      />
    </div>
  );
};
