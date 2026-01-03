
export type TimeType = 'tip' | 'peak' | 'flat' | 'valley' | 'deep';

export interface PriceSchema {
  tip: number;
  peak: number;
  flat: number;
  valley: number;
  deep?: number;
}

export interface TimeRule {
  start: string;
  end: string;
  type: TimeType;
}

export interface TimeConfig {
  id: string;
  province: string;
  month_pattern: string; // e.g., "1,2,3" or "All"
  time_rules: TimeRule[];
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

export type LogCollection = 'tariffs' | 'time_configs' | 'comprehensive_results';
export type LogAction = 'create' | 'update' | 'delete' | 'bulk_delete' | 'bulk_import' | 'backup' | 'restore';

export interface OperationLog {
  id: string;
  timestamp: string;
  target_collection: LogCollection;
  action: LogAction;
  count: number;
  details?: string;
}

export type AppView = 'home' | 'dashboard' | 'config' | 'upload' | 'manual' | 'settings' | 'analysis' | 'calculator' | 'admin' | 'pvgis';

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

