
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
}

export interface OCRResultItem {
  id: string;
  category: string;
  voltage: string;
  prices: PriceSchema;
}

export type AppView = 'dashboard' | 'config' | 'upload' | 'manual' | 'settings' | 'analysis';
