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
