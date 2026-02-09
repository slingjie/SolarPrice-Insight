
import React from 'react';
import { LoadPersona, TimeConfig, HolidayDefinition } from './types';

export const PROVINCES = [
  "江苏省", "浙江省", "广东省", "山东省", "河南省",
  "安徽省", "河北省", "湖南省", "湖北省", "上海市", "北京市"
];

export const getTypeColor = (type: string) => {
  switch (type) {
    case 'tip': return '#ef4444';
    case 'peak': return '#f97316';
    case 'flat': return '#22c55e';
    case 'valley': return '#3b82f6';
    case 'deep': return '#6366f1';
    default: return '#94a3b8';
  }
};

export const getTypeLabel = (type: string) => {
  const map: Record<string, string> = { tip: '尖峰', peak: '高峰', flat: '平段', valley: '低谷', deep: '深谷' };
  return map[type] || type;
};

export const DEFAULT_TIME_CONFIGS: TimeConfig[] = [
  {
    id: 'tc-js-winter',
    province: '江苏省',
    year: new Date().getFullYear(),
    config_type: 'monthly',
    month_pattern: '1,2,12',
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    time_rules: [
      { start: "00:00", end: "08:00", type: "valley" },
      { start: "08:00", end: "11:00", type: "peak" },
      { start: "11:00", end: "13:00", type: "flat" },
      { start: "13:00", end: "15:00", type: "peak" },
      { start: "15:00", end: "18:00", type: "tip" },
      { start: "18:00", end: "22:00", type: "peak" },
      { start: "22:00", end: "24:00", type: "valley" }
    ]
  },
  {
    id: 'tc-zj-gen',
    province: '浙江省',
    year: new Date().getFullYear(),
    config_type: 'monthly',
    month_pattern: 'All',
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    time_rules: [
      { start: "00:00", end: "08:00", type: "valley" },
      { start: "08:00", end: "15:00", type: "peak" },
      { start: "15:00", end: "17:00", type: "flat" },
      { start: "17:00", end: "22:00", type: "peak" },
      { start: "22:00", end: "24:00", type: "valley" }
    ]
  },
  {
    id: 'tc-national-fallback',
    province: '全部',
    year: new Date().getFullYear(),
    config_type: 'monthly',
    month_pattern: 'All',
    updated_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    time_rules: [
      { start: "00:00", end: "08:00", type: "valley" },
      { start: "08:00", end: "12:00", type: "peak" },
      { start: "12:00", end: "14:00", type: "flat" },
      { start: "14:00", end: "17:00", type: "peak" },
      { start: "17:00", end: "21:00", type: "peak" },
      { start: "21:00", end: "24:00", type: "valley" }
    ]
  }
];

export const DEFAULT_HOLIDAYS: HolidayDefinition[] = [
  {
    id: 'holiday-new-year',
    name: '元旦',
    startDate: '01-01',
    endDate: '01-01',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-spring-festival',
    name: '春节',
    startDate: '01-29',
    endDate: '02-04',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-qingming',
    name: '清明节',
    startDate: '04-04',
    endDate: '04-06',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-labor-day',
    name: '劳动节',
    startDate: '05-01',
    endDate: '05-05',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-dragon-boat',
    name: '端午节',
    startDate: '06-10',
    endDate: '06-12',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-mid-autumn',
    name: '中秋节',
    startDate: '09-15',
    endDate: '09-17',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  },
  {
    id: 'holiday-national-day',
    name: '国庆节',
    startDate: '10-01',
    endDate: '10-07',
    isDefault: true,
    updated_at: '2026-01-31T00:00:00.000Z'
  }
];

export const DEFAULT_R_D = 0.2;

function normalizeShares24(raw: number[]): number[] {
  if (!Array.isArray(raw) || raw.length !== 24) {
    return new Array(24).fill(1 / 24);
  }
  let sum = 0;
  for (const v of raw) {
    if (Number.isFinite(v) && v > 0) sum += v;
  }
  if (sum <= 0) return new Array(24).fill(1 / 24);
  return raw.map((v) => (Number.isFinite(v) && v > 0 ? v / sum : 0));
}

export const DEFAULT_PERSONAS: LoadPersona[] = (() => {
  const now = new Date().toISOString();

  const manufacturing_general = normalizeShares24([
    0.015, 0.015, 0.015, 0.015, 0.015, 0.02,
    0.03, 0.05,
    0.07, 0.075, 0.075, 0.07,
    0.06,
    0.075, 0.08, 0.08, 0.075,
    0.06, 0.045,
    0.03, 0.025, 0.02, 0.02, 0.02,
  ]);

  const process_continuous = normalizeShares24(new Array(24).fill(1));

  const commercial_mall = normalizeShares24([
    0.005, 0.005, 0.005, 0.005, 0.005, 0.01,
    0.02, 0.04,
    0.06, 0.07, 0.075,
    0.08, 0.08, 0.08, 0.08, 0.075,
    0.07, 0.065,
    0.06, 0.055,
    0.04, 0.025, 0.01, 0.01,
  ]);

  const office = normalizeShares24([
    0.004, 0.004, 0.004, 0.004, 0.004, 0.008,
    0.02, 0.045,
    0.075, 0.085, 0.085,
    0.08, 0.07,
    0.08, 0.085, 0.085,
    0.07, 0.05,
    0.03, 0.02,
    0.015, 0.01, 0.008, 0.008,
  ]);

  const cold_chain = normalizeShares24([
    0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
    0.04, 0.045,
    0.05, 0.055, 0.055,
    0.06, 0.06, 0.06, 0.06, 0.055,
    0.05, 0.045,
    0.045, 0.045,
    0.045, 0.045, 0.045, 0.045,
  ]);

  const data_center = normalizeShares24([
    0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
    0.04, 0.04,
    0.042, 0.042, 0.042, 0.042,
    0.042, 0.042, 0.042, 0.042,
    0.042, 0.042,
    0.041, 0.041,
    0.04, 0.04, 0.04, 0.04,
  ]);

  const hospital = data_center;

  const manufacturing_2shift = normalizeShares24([
    0.02, 0.02, 0.02, 0.02, 0.02, 0.025,
    0.035, 0.05,
    0.065, 0.07, 0.07, 0.07,
    0.06,
    0.07, 0.075, 0.075, 0.07,
    0.06, 0.055,
    0.05, 0.045, 0.03, 0.025, 0.025,
  ]);

  const manufacturing_3shift = process_continuous;

  const supermarket = normalizeShares24([
    0.008, 0.008, 0.008, 0.008, 0.01, 0.015,
    0.03, 0.045,
    0.06, 0.07, 0.075, 0.08,
    0.08, 0.08, 0.08, 0.075,
    0.07, 0.065,
    0.06, 0.055, 0.045, 0.03,
    0.02, 0.012,
  ]);

  const school = normalizeShares24([
    0.004, 0.004, 0.004, 0.004, 0.004, 0.008,
    0.02, 0.05,
    0.08, 0.09, 0.085, 0.075,
    0.06,
    0.075, 0.085, 0.08, 0.06,
    0.04, 0.03,
    0.02, 0.015, 0.01, 0.008, 0.008,
  ]);

  const hotel = normalizeShares24([
    0.03, 0.03, 0.028, 0.028, 0.028, 0.03,
    0.035, 0.04,
    0.045, 0.05, 0.05, 0.05,
    0.048,
    0.05, 0.05, 0.05, 0.05,
    0.055, 0.06,
    0.06, 0.055, 0.045, 0.038, 0.035,
  ]);

  const restaurant = normalizeShares24([
    0.01, 0.01, 0.01, 0.01, 0.012, 0.015,
    0.02, 0.03,
    0.045, 0.06, 0.07, 0.085,
    0.07,
    0.06, 0.055, 0.06, 0.075,
    0.095, 0.09,
    0.06, 0.04, 0.025, 0.018, 0.012,
  ]);

  const ev_charging = normalizeShares24([
    0.06, 0.06, 0.055, 0.05, 0.045, 0.04,
    0.03, 0.025,
    0.02, 0.02, 0.02, 0.02,
    0.02,
    0.02, 0.02, 0.02, 0.025,
    0.03, 0.04,
    0.05, 0.055, 0.055, 0.06, 0.06,
  ]);

  const water_wastewater = normalizeShares24([
    0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
    0.04, 0.04,
    0.042, 0.042, 0.042, 0.042,
    0.042,
    0.042, 0.042, 0.042, 0.042,
    0.042, 0.042,
    0.04, 0.04, 0.04, 0.04,
  ]);

  const make = (p: Omit<LoadPersona, 'updated_at' | 'last_modified'>): LoadPersona => ({
    ...p,
    updated_at: now,
    last_modified: now,
  });

  return [
    make({ id: 'persona-manufacturing_general', slug: 'manufacturing_general', name: '一般制造业（白班）', weekday_shares: manufacturing_general, isDefault: true }),
    make({ id: 'persona-manufacturing_2shift', slug: 'manufacturing_2shift', name: '制造业（两班倒）', weekday_shares: manufacturing_2shift, isDefault: true }),
    make({ id: 'persona-manufacturing_3shift', slug: 'manufacturing_3shift', name: '制造业（三班倒/24h）', weekday_shares: manufacturing_3shift, isDefault: true }),
    make({ id: 'persona-process_continuous', slug: 'process_continuous', name: '连续型工业（化工/冶金/水泥）', weekday_shares: process_continuous, isDefault: true }),
    make({ id: 'persona-cold_chain', slug: 'cold_chain', name: '冷链/仓储', weekday_shares: cold_chain, isDefault: true }),
    make({ id: 'persona-data_center', slug: 'data_center', name: '数据中心', weekday_shares: data_center, isDefault: true }),
    make({ id: 'persona-hospital', slug: 'hospital', name: '医院', weekday_shares: hospital, isDefault: true }),
    make({ id: 'persona-commercial_mall', slug: 'commercial_mall', name: '商业综合体/商场', weekday_shares: commercial_mall, isDefault: true }),
    make({ id: 'persona-supermarket', slug: 'supermarket', name: '超市/便利店', weekday_shares: supermarket, isDefault: true }),
    make({ id: 'persona-office', slug: 'office', name: '办公楼/园区办公', weekday_shares: office, isDefault: true }),
    make({ id: 'persona-school', slug: 'school', name: '学校', weekday_shares: school, isDefault: true }),
    make({ id: 'persona-hotel', slug: 'hotel', name: '酒店', weekday_shares: hotel, isDefault: true }),
    make({ id: 'persona-restaurant', slug: 'restaurant', name: '餐饮（午晚高峰）', weekday_shares: restaurant, isDefault: true }),
    make({ id: 'persona-ev_charging', slug: 'ev_charging', name: '充电站/停车场充电', weekday_shares: ev_charging, isDefault: true }),
    make({ id: 'persona-water_wastewater', slug: 'water_wastewater', name: '自来水/污水处理', weekday_shares: water_wastewater, isDefault: true }),
  ];
})();
