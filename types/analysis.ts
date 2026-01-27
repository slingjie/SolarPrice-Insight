/**
 * Monthly electricity consumption data by TOU (Time-of-Use) periods.
 * Each field represents consumption in kWh for that period type.
 */
export interface MonthlyConsumption {
  /** Month number (1-12) */
  month: number;
  /** Tip period consumption in kWh (尖峰/尖) */
  tip: number;
  /** Peak period consumption in kWh (高峰/峰) */
  peak: number;
  /** Flat period consumption in kWh (平段/平) */
  flat: number;
  /** Valley period consumption in kWh (低谷/谷) */
  valley: number;
  /** Deep valley period consumption in kWh (深谷) */
  deep: number;
}

/**
 * TOU period types matching the existing TimeType in types.ts
 */
export type TOUType = 'tip' | 'peak' | 'flat' | 'valley' | 'deep';

/**
 * Error thrown when Excel parsing fails
 */
export class ExcelParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExcelParseError';
  }
}

/**
 * Hourly load data point for a specific timestamp.
 */
export interface HourlyLoad {
  /** ISO 8601 timestamp (e.g., "2025-01-15T08:00:00Z") */
  time: string;
  /** Load in kW for this hour */
  loadKw: number;
  /** TOU type for this hour */
  type: TOUType;
}

/**
 * Hourly PV generation data point for a specific timestamp.
 */
export interface HourlyPV {
  /** ISO 8601 timestamp (e.g., "2025-01-15T08:00:00Z") */
  time: string;
  /** PV generation in kW for this hour */
  pvKw: number;
}

/**
 * Self-consumption metrics from load and PV balance calculation.
 */
export interface SelfConsumptionMetrics {
  /** Total self-consumed energy in kWh (min(PV, Load) each hour, summed) */
  selfConsumptionKwh: number;
  /** Total energy fed to grid in kWh (excess PV when PV > Load) */
  gridFeedInKwh: number;
  /** Total energy drawn from grid in kWh (deficit when Load > PV) */
  gridDrawKwh: number;
  /** Total load consumption in kWh */
  totalLoadKwh: number;
  /** Total PV generation in kWh */
  totalPvKwh: number;
  /** Self-consumption rate (0-1), self-consumed / total PV */
  selfConsumptionRate: number;
  /** Self-sufficiency rate (0-1), self-consumed / total load */
  selfSufficiencyRate: number;
}

/**
 * Error thrown when load synthesis fails due to invalid configuration.
 */
export class LoadSynthesisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoadSynthesisError';
  }
}
