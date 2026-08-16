import { TariffData, TimeConfig, TimeRule, TimeType } from '../types';
import { rulesToGrid, gridToRules } from './timeUtils';
import { normalizeProvinceName, provinceMatches } from './provinceNormalize';

export interface ParsedSpecialPeriod {
  id: string;
  province: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  year: number;
  rawNote: string;
  policyCode?: string;
  timeRules: TimeRule[];
  overrideType?: TimeType;
  timeRangesDescription: string;
  seasonTag: 'summer' | 'winter' | 'holiday' | 'weather' | 'general';
}

const parseHour = (value: string): number => {
  const [h] = value.split(':');
  const num = Number.parseInt(h, 10);
  return Number.isFinite(num) && num >= 0 && num <= 24 ? num : 0;
};

// 提取时间段区间，如 "20:00-22:00" 或 "13:00-14:00、21:00-23:00"
export function extractTimeRanges(text: string): { start: string; end: string }[] {
  const ranges: { start: string; end: string }[] = [];
  const regex = /(\d{1,2}:\d{2})\s*[-~至到]\s*(\d{1,2}:\d{2})/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    let s = match[1];
    let e = match[2];
    if (s.length === 4) s = `0${s}`;
    if (e.length === 4) e = `0${e}`;
    ranges.push({ start: s, end: e });
  }

  return ranges;
}

// 提取日期区间，如 "7/15-8/31"、"12/15-1/31"、"5月1-5日"、"10月1-7日"
export function extractDateRanges(
  text: string,
  baseYear: number = new Date().getFullYear(),
): { start: string; end: string; raw: string; isCrossYear: boolean }[] {
  const results: { start: string; end: string; raw: string; isCrossYear: boolean }[] = [];

  // 匹配形式 1: "7/15-8/31" 或 "12/15-1/31" 或 "7.15-8.31"
  const slashPattern = /(\d{1,2})[\/\.](\d{1,2})\s*[-~至到]\s*(\d{1,2})[\/\.](\d{1,2})/g;
  let match: RegExpExecArray | null;

  while ((match = slashPattern.exec(text)) !== null) {
    const sm = Number.parseInt(match[1], 10);
    const sd = Number.parseInt(match[2], 10);
    const em = Number.parseInt(match[3], 10);
    const ed = Number.parseInt(match[4], 10);

    const isCrossYear = sm > em; // 如 12/15 - 1/31 跨年
    const endYear = isCrossYear ? baseYear + 1 : baseYear;

    const start = `${baseYear}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
    const end = `${endYear}-${String(em).padStart(2, '0')}-${String(ed).padStart(2, '0')}`;
    results.push({ start, end, raw: match[0], isCrossYear });
  }

  // 匹配形式 2: "5月1-5日" 或 "10月1-7日" 或 "5月1日-5月5日"
  const monthDayPattern = /(\d{1,2})月(\d{1,2})日?\s*[-~至到]\s*(?:(\d{1,2})月)?(\d{1,2})日/g;
  while ((match = monthDayPattern.exec(text)) !== null) {
    const sm = Number.parseInt(match[1], 10);
    const sd = Number.parseInt(match[2], 10);
    const em = match[3] ? Number.parseInt(match[3], 10) : sm;
    const ed = Number.parseInt(match[4], 10);

    const isCrossYear = sm > em;
    const endYear = isCrossYear ? baseYear + 1 : baseYear;

    const start = `${baseYear}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
    const end = `${endYear}-${String(em).padStart(2, '0')}-${String(ed).padStart(2, '0')}`;
    results.push({ start, end, raw: match[0], isCrossYear });
  }

  return results;
}

// 根据时段说明和基准时段规则生成包含特殊时段的 24h 规则
export function applySpecialPeriodOverride(
  baseRules: TimeRule[],
  overrideRanges: { start: string; end: string }[],
  overrideType: TimeType = 'tip',
): TimeRule[] {
  const grid = rulesToGrid(baseRules);

  overrideRanges.forEach((range) => {
    const startHour = parseHour(range.start);
    const endHour = parseHour(range.end);
    const count = endHour >= startHour ? endHour - startHour : 24 - startHour + endHour;

    for (let i = 0; i < count; i++) {
      const h = (startHour + i) % 24;
      grid[h] = overrideType;
    }
  });

  return gridToRules(grid);
}

// 主解析器：从 tariffs 的 special_period_note / formula_note 中解析出结构化特殊日期规则
export function parseSpecialPeriodsFromTariffs(
  tariffs: TariffData[],
  province: string,
  year: number = new Date().getFullYear(),
  baseMonthlyRules?: TimeRule[],
): ParsedSpecialPeriod[] {
  const matchedTariffs = tariffs.filter((t) => provinceMatches(t.province, province));
  if (matchedTariffs.length === 0) return [];

  // 搜集所有的 special_period_note
  const noteSet = new Set<string>();
  const results: ParsedSpecialPeriod[] = [];

  // 默认回退基准规则
  const defaultRules: TimeRule[] = baseMonthlyRules || matchedTariffs[0]?.time_rules || [
    { start: '00:00', end: '08:00', type: 'valley' },
    { start: '08:00', end: '11:00', type: 'peak' },
    { start: '11:00', end: '13:00', type: 'flat' },
    { start: '13:00', end: '17:00', type: 'peak' },
    { start: '17:00', end: '22:00', type: 'peak' },
    { start: '22:00', end: '24:00', type: 'valley' },
  ];

  matchedTariffs.forEach((t) => {
    const note = t.float_rules?.special_period_note || t.float_rules?.formula_note || t.market_notes;
    if (!note || noteSet.has(note.trim())) return;
    noteSet.add(note.trim());

    const dateRanges = extractDateRanges(note, year);
    if (dateRanges.length === 0) return;

    const timeRanges = extractTimeRanges(note);
    const isTip = note.includes('尖峰') || note.includes('尖');
    const isDeep = note.includes('深谷') || note.includes('深');
    const overrideType: TimeType = isDeep ? 'deep' : isTip ? 'tip' : 'peak';

    dateRanges.forEach((dr, idx) => {
      let seasonTag: 'summer' | 'winter' | 'holiday' | 'weather' | 'general' = 'general';
      let title = '政策特殊日期时段';

      if (dr.raw.includes('7/') || dr.raw.includes('8/') || dr.raw.includes('7月') || dr.raw.includes('8月') || note.includes('夏')) {
        seasonTag = 'summer';
        title = '🌞 夏季迎峰度夏尖峰时段';
      } else if (dr.raw.includes('12/') || dr.raw.includes('1/') || dr.raw.includes('12月') || dr.raw.includes('1月') || note.includes('冬')) {
        seasonTag = 'winter';
        title = '❄️ 冬季迎峰度冬尖峰时段';
      } else if (note.includes('节') || note.includes('五一') || note.includes('国庆') || note.includes('春节')) {
        seasonTag = 'holiday';
        title = '🏖️ 重大节假日特殊深谷时段';
      } else if (note.includes('气温') || note.includes('35度')) {
        seasonTag = 'weather';
        title = '🌡️ 高温负荷灵活响应尖峰';
      }

      const effectiveTimeRules = timeRanges.length > 0
        ? applySpecialPeriodOverride(defaultRules, timeRanges, overrideType)
        : defaultRules;

      const timeRangesDescription = timeRanges.length > 0
        ? timeRanges.map((r) => `${r.start}-${r.end}`).join('、')
        : '按政策指定小时执行';

      results.push({
        id: `auto-sp-${normalizeProvinceName(province)}-${year}-${idx}`,
        province: t.province,
        title,
        startDate: dr.start,
        endDate: dr.end,
        year,
        rawNote: note,
        policyCode: t.policy_code,
        timeRules: effectiveTimeRules,
        overrideType,
        timeRangesDescription,
        seasonTag,
      });
    });
  });

  return results;
}
