
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

export type AppView = 'home' | 'dashboard' | 'config' | 'upload' | 'manual' | 'settings' | 'analysis' | 'calculator' | 'database' | 'pvgis';

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


