
import React from 'react';
import { TimeConfig } from './types';

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
    month_pattern: '1,2,12',
    updated_at: new Date().toISOString(),
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
    month_pattern: 'All',
    updated_at: new Date().toISOString(),
    time_rules: [
      { start: "00:00", end: "08:00", type: "valley" },
      { start: "08:00", end: "15:00", type: "peak" },
      { start: "15:00", end: "17:00", type: "flat" },
      { start: "17:00", end: "22:00", type: "peak" },
      { start: "22:00", end: "24:00", type: "valley" }
    ]
  }
];
