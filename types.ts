
export type TimeType = 'tip' | 'peak' | 'flat' | 'valley' | 'deep';

export interface PriceSchema {
  tip: number;
  peak: number;
  flat: number;
  valley: number;
  deep?: number;
  energy_usage?: number;
  purchase_agent?: number;
  transmission_distribution?: number;
}

export interface TimeRule {
  start: string;
  end: string;
  type: TimeType;
}

export interface TimeConfig {
  id: string;
  province: string;
  year: number;
  config_type: 'monthly' | 'special_date';
  month_pattern: string; // e.g., "1,2,3" or "All"
  special_date?: string; // YYYY-MM-DD, required when config_type='special_date'
  special_date_end?: string; // YYYY-MM-DD, optional range end for config_type='special_date'
  time_rules: TimeRule[];
  updated_at: string;
  last_modified: string; // ISO string
  _deleted?: boolean;
}

export interface LoadPersona {
  id: string;
  slug: string;
  name: string;
  /** 24 hourly shares, sum to 1 */
  weekday_shares: number[];
  /** Optional 24 hourly shares; if omitted, weekend uses weekday_shares */
  weekend_shares?: number[];
  isDefault: boolean;
  updated_at: string;
  last_modified: string; // ISO string
  _deleted?: boolean;
}

export interface TariffData {
  id: string;
  created_at: string;
  province: string;
  city: string | null;
  month: string; // YYYY-MM
  category: string;
  voltage_level: string;
  prices: PriceSchema;
  time_rules: TimeRule[];
  currency_unit: string;
  source_config_id?: string;
  last_modified: string; // ISO string
  _deleted?: boolean;
}

export interface OCRResultItem {
  id: string;
  category: string;
  voltage: string;
  prices: PriceSchema;
}

export interface SavedTimeRange {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  created_at: string;
  last_modified: string; // ISO string
  _deleted?: boolean;
}

export interface ComprehensiveResult {
  id: string;
  province: string;
  category: string;
  voltage_level: string;
  avg_price: number;
  months: string[];
  start_time: string;
  end_time: string;
  last_modified: string; // ISO string
  _deleted?: boolean;
}

// ========== 操作日志相关类型 ==========

export type LogCollection = 'tariffs' | 'time_configs' | 'comprehensive_results' | 'personas';
export type LogAction = 'create' | 'update' | 'delete' | 'bulk_delete' | 'bulk_import' | 'backup' | 'restore';

export interface OperationLog {
  id: string;
  timestamp: string;
  target_collection: LogCollection;
  action: LogAction;
  count: number;
  details?: string;
}

export type AppView = 'home' | 'dashboard' | 'config' | 'upload' | 'manual' | 'settings' | 'analysis' | 'calculator' | 'admin' | 'pvgis' | 'self-consumption';
export type AppEntryMode = 'web' | 'pwa';
export type PwaView = 'overview' | 'detail';

export interface PVGISParams {
  lat: number;
  lon: number;
  peakPower: number; // kWp
  loss: number;      // %
  azimuth: number;   // -180 to 180, 0 is South, East is negative, West is positive
  angle?: number;    // tilt, optional for optimized
}

export interface PVSummary {
  annualEnergy: number; // kWh
  monthlyEnergy: number[]; // 12 months, kWh
  fullLoadHours: number; // h
  pr: number; // 0-1
  loss: number; // %
  optimalSlope: number; // degrees
  globalIrradiance: number; // kWh/m2/year (Horizontal)
  inPlaneIrradiance: number; // kWh/m2/year (In-Plane)
}

export interface HourlyData {
  time: string; // ISO string
  pvPower: number; // W
  poaIrradiance: number; // W/m2
}

export interface PVGISCacheData {
  id: string; // hash
  params: PVGISParams;
  summary: PVSummary;
  hourly: HourlyData[];
  created_at: number; // timestamp
  _deleted?: boolean;
}

// ========== 辐照度查询相关类型 ==========

/**
 * 辐照度数据点 (统一格式)
 */
export interface IrradiancePoint {
  time: string; // ISO8601 UTC
  ghi: number | null; // 水平面总辐照度 W/m2
  dni: number | null; // 法向直射辐照度 W/m2
  dhi: number | null; // 漫射辐照度 W/m2
  extras: Record<string, number | string | null>; // 其他字段
}

/**
 * 辐照度查询元数据
 */
export interface IrradianceMetadata {
  source: 'pvgis' | 'cams';
  queryType: 'tmy' | 'series';
  lat: number;
  lon: number;
  timeRef: 'UTC';
  unit: {
    irradiance?: 'W/m2';
    irradiation?: 'Wh/m2' | 'kWh/m2';
  };
  provider?: string;
  rawInputs?: unknown;
  cached?: boolean;
  requestUrl?: string;
}

/**
 * 辐照度查询响应
 */
export interface IrradianceResponse {
  metadata: IrradianceMetadata;
  data: IrradiancePoint[];
}

/**
 * 地址解析候选点
 */
export interface GeocodeCandidate {
  lat: number;
  lon: number;
  displayName: string;
  provider: string;
  confidence: number | null;
}

/**
 * 地址解析响应
 */
export interface GeocodeResponse {
  requestUrl?: string;
  candidates: GeocodeCandidate[];
}

/**
 * 辐照度缓存数据
 */
export interface IrradianceCacheData {
  id: string; // hash of query params
  metadata: IrradianceMetadata;
  data: IrradiancePoint[];
  created_at: number;
  _deleted?: boolean;
}

// ========== 太阳能自消费分析类型 ==========

/**
 * 太阳能系统配置
 */
export interface SolarSystem {
  systemSizeKw: number; // 系统容量，单位 kW
  estimatedGenerationKwh?: number; // 预计年度发电量，单位 kWh（可选）
}

/**
 * 负荷配置文件
 */
export interface LoadProfile {
  monthlyConsumptionKwh: number; // 月度平均用电量，单位 kWh
  workStartHour: string; // 工作开始时间，格式 HH:mm
  workEndHour: string; // 工作结束时间，格式 HH:mm
}

// ========== 用电数据导入 / 负荷曲线生成 ==========

export interface MonthlyLoadData {
  month: number; // 1-12
  consumption: number; // kWh
}

export interface HourlyLoadData {
  time: string; // "MM-DD HH:00"
  load: number; // kWh
}

export type ParsedLoadData =
  | {
      format: 'monthly';
      monthly: MonthlyLoadData[];
      totalAnnual: number;
    }
  | {
      format: 'hourly';
      hourly: HourlyLoadData[];
      totalAnnual: number;
    };

export interface LoadProfileConfig {
  workdayStart: number; // 0-23
  workdayEnd: number; // 0-23
  workdayRatio: number; // 0-1

  weekendAsHoliday: boolean;
  holidayRatio: number; // 0-1, relative to workday

  summerMonths: number[]; // 1-12
  summerMultiplier: number;

  winterMonths: number[]; // 1-12
  winterMultiplier: number;
}

export const DEFAULT_LOAD_PROFILE_CONFIG: LoadProfileConfig = {
  workdayStart: 9,
  workdayEnd: 17,
  workdayRatio: 0.8,

  weekendAsHoliday: true,
  holidayRatio: 0.5,

  summerMonths: [6, 7, 8],
  summerMultiplier: 1.2,

  winterMonths: [12, 1, 2],
  winterMultiplier: 1.1,
};

/**
 * 小时级别的太阳能自消费数据
 */
export interface SelfConsumptionHourlyData {
  hour: number; // 小时数 (0-23)
  solarKwh: number; // 太阳能发电量，单位 kWh
  loadKwh: number; // 负荷用电量，单位 kWh
  selfConsumedKwh: number; // 自消费量，单位 kWh
  exportKwh: number; // 上网电量，单位 kWh
  importKwh: number; // 从网购电量，单位 kWh
}

/**
 * 太阳能自消费分析结果
 */
export interface SolarSimulationResult {
  selfConsumptionRate: number; // 自消费率，范围 0-1
  totalSelfConsumedKwh: number; // 总自消费量，单位 kWh
  totalExportKwh: number; // 总上网电量，单位 kWh
  totalImportKwh: number; // 总从网购电量，单位 kWh

  hourlyData: SelfConsumptionHourlyData[]; // 小时级别数据
}

export interface HourlyConsumptionResult {
  time: string;
  pvGeneration: number;
  loadDemand: number;
  selfConsumption: number;
  gridExport: number;
  gridImport: number;
}

export interface MonthlyConsumptionData {
  month: number;
  pvGeneration: number;
  loadDemand: number;
  selfConsumption: number;
  gridExport: number;
  gridImport: number;
  selfConsumptionRate: number;
  selfSufficiencyRate: number;
}

export interface ConsumptionSummary {
  totalPvGeneration: number;
  totalLoadDemand: number;
  totalSelfConsumption: number;
  totalGridExport: number;
  totalGridImport: number;
  selfConsumptionRate: number;
  selfSufficiencyRate: number;
  hourlyData: HourlyConsumptionResult[];
  monthlyData: MonthlyConsumptionData[];
}

// ========== 节假日相关类型 ==========

/**
 * 节假日定义
 */
export interface HolidayDefinition {
  id: string;              // UUID
  name: string;            // 如 "春节"、"国庆节"
  startDate: string;       // MM-DD 格式，如 "01-31"
  endDate: string;         // MM-DD 格式，如 "02-06"
  isDefault: boolean;      // 是否为预填充的默认节假日
  updated_at: string;      // ISO timestamp
}

/**
 * 工作日程配置
 */
export interface WorkSchedulePreset {
  id: string;
  name: string;
  R_D: number;                    // 节假日负荷比例（默认 0.2）
  selectedHolidayIds: string[];   // 选中的节假日 ID 列表
  updated_at: string;             // ISO timestamp
  _deleted?: boolean;
}

/**
 * 日期类型
 */
export type DayType = 'workday' | 'restday' | 'holiday';

/**
 * 负荷等级
 */
export type LoadLevel = 'A' | 'B' | 'C' | 'D';
