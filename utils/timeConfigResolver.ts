import { TimeConfig, TimeRule, TimeType } from '../types';
import { rulesToGrid } from './timeUtils';
import { provinceMatches } from './provinceNormalize';

/**
 * Parses month_pattern string into a Set of month numbers (1-12)
 * 
 * Rules:
 * - "All" (case-insensitive: all/ALL/All) -> [1,2,...,12]
 * - Otherwise: comma-separated numbers "1,2,3" -> [1,2,3]
 * - Invalid tokens (NaN, <1, >12) are silently ignored
 * - Whitespace is trimmed from each token
 * 
 * @param pattern - Month pattern string
 * @returns Set of valid month numbers (1-12)
 */
export function parseMonthPattern(pattern: string): Set<number> {
  if (!pattern || pattern.trim() === '') {
    return new Set();
  }

  // Check for "All" (case-insensitive)
  if (pattern.trim().toLowerCase() === 'all') {
    return new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  }

  // Parse comma-separated numbers
  const months = new Set<number>();
  const tokens = pattern.split(',');

  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed === '') continue;

    const month = parseInt(trimmed, 10);
    
    // Validate: must be a number and in range [1, 12]
    if (!isNaN(month) && month >= 1 && month <= 12) {
      months.add(month);
    }
  }

  return months;
}

/**
 * Resolves which TimeConfig applies for a given province and month
 * 
 * Priority tiers (highest to lowest):
 * 1. province === provinceName && month in month_pattern
 * 2. province === provinceName && month_pattern === "All"
 * 3. province === "全部" && month in month_pattern
 * 4. province === "全部" && month_pattern === "All"
 * 
 * Conflict resolution (same tier):
 * - Primary: newest last_modified (Date comparison)
 * - Fallback: smallest id (lexicographic)
 * 
 * @param timeConfigs - Array of TimeConfig objects
 * @param provinceName - Target province name (exact match required)
 * @param month - Target month (1-12)
 * @returns Object with timeRules and touGrid (24-hour grid), or null if no match
 */
export function resolveTimeConfigForMonth(
  timeConfigs: TimeConfig[],
  provinceName: string,
  month: number
): { timeRules: TimeRule[]; touGrid: TimeType[] } | null {
  if (!timeConfigs || timeConfigs.length === 0) {
    return null;
  }

  // Filter out deleted configs
  const activeConfigs = timeConfigs.filter(tc => !tc._deleted);

  if (activeConfigs.length === 0) {
    return null;
  }

  // Categorize configs into priority tiers
  const tier1: TimeConfig[] = [];
  const tier2: TimeConfig[] = [];
  const tier3: TimeConfig[] = [];
  const tier4: TimeConfig[] = [];

  for (const config of activeConfigs) {
    const monthSet = parseMonthPattern(config.month_pattern);
    const isAllPattern = config.month_pattern.trim().toLowerCase() === 'all';

    const isWildcard = config.province.trim() === '全部';
    const isProvinceMatch = !isWildcard && provinceMatches(config.province, provinceName);

    if (isProvinceMatch) {
      if (monthSet.has(month)) {
        // Tier 1: exact province + month match
        tier1.push(config);
      } else if (isAllPattern) {
        // Tier 2: exact province + All pattern
        tier2.push(config);
      }
    } else if (isWildcard) {
      if (monthSet.has(month)) {
        // Tier 3: 全部 + month match
        tier3.push(config);
      } else if (isAllPattern) {
        // Tier 4: 全部 + All pattern
        tier4.push(config);
      }
    }
  }

  // Select from highest priority tier available
  let candidates: TimeConfig[] = [];
  if (tier1.length > 0) {
    candidates = tier1;
  } else if (tier2.length > 0) {
    candidates = tier2;
  } else if (tier3.length > 0) {
    candidates = tier3;
  } else if (tier4.length > 0) {
    candidates = tier4;
  } else {
    return null;
  }

  // Resolve conflicts within selected tier
  const selected = resolveConflict(candidates);

  if (!selected) {
    return null;
  }

  // Generate TOU grid from time_rules
  const touGrid = rulesToGrid(selected.time_rules);

  return {
    timeRules: selected.time_rules,
    touGrid
  };
}

/**
 * Resolves conflict among multiple candidates at same priority level
 * 
 * Rules:
 * 1. Sort by last_modified descending (newest first)
 * 2. If tied, sort by id ascending (lexicographically smallest first)
 * 3. Return first (highest priority) candidate
 * 
 * @param candidates - Array of TimeConfig candidates at same tier
 * @returns Selected TimeConfig, or null if empty
 */
function resolveConflict(candidates: TimeConfig[]): TimeConfig | null {
  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  // Sort by: last_modified DESC (newer first), then id ASC (lexicographically smallest)
  candidates.sort((a, b) => {
    // Parse dates for comparison
    const dateA = new Date(a.last_modified).getTime();
    const dateB = new Date(b.last_modified).getTime();

    // Primary sort: newest last_modified first (descending)
    if (dateA !== dateB) {
      return dateB - dateA;
    }

    // Fallback sort: lexicographically smallest id first (ascending)
    return a.id.localeCompare(b.id);
  });

  return candidates[0];
}
