import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PwaPriceOverview } from './PwaPriceOverview';
import { TariffData } from '../../types';

const tariff: TariffData = {
  id: 'overview-1',
  created_at: '2026-01-01T00:00:00.000Z',
  province: '江苏省',
  city: null,
  month: '2026-03',
  category: '大工业',
  voltage_level: '10kV',
  prices: { tip: 1, peak: 2, flat: 3, valley: 4, deep: 5 },
  time_rules: [{ start: '00:00', end: '24:00', type: 'flat' }],
  currency_unit: 'CNY/kWh',
  last_modified: '2026-01-01T00:00:00.000Z',
};

describe('PwaPriceOverview', () => {
  it('shows annual average info and placeholders for extension fields', () => {
    render(
      <PwaPriceOverview
        tariff={tariff}
        effectiveRules={[]}
        ruleSource="none"
        comprehensivePrice={null}
        monthFallbackReason="missing_current_month"
        currentSystemMonth="2026-02"
        annualConfig={{ mode: 'rolling12', anchorMonth: '2026-02', customMonths: [] }}
        annualMetrics={{
          average: null,
          configuredMonths: Array.from({ length: 12 }, (_, i) => `2025-${(i + 1).toString().padStart(2, '0')}`),
          validMonths: [],
          missingMonths: [],
          effectiveCount: 0,
        }}
      />, 
    );

    expect(screen.getByText(/已自动回退到最新月份 2026-03/)).toBeInTheDocument();
    expect(screen.getByText('当月综合电价')).toBeInTheDocument();
    expect(screen.getByText('年度平均综合电价')).toBeInTheDocument();
    expect(screen.getByText(/近12个月（锚点：2026-02）｜有效 0\/12/)).toBeInTheDocument();
    expect(screen.getByText('电度用电价格')).toBeInTheDocument();

    const agentCard = screen.getByText('代理购电价格').closest('div');
    expect(agentCard).not.toBeNull();
    expect(within(agentCard as HTMLElement).getByText('--')).toBeInTheDocument();

    expect(screen.getByText('暂无可绘制的分时规则。')).toBeInTheDocument();
    expect(screen.getByText('所选窗口无可用综合电价数据。')).toBeInTheDocument();
  });
});
