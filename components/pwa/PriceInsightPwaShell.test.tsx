import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PriceInsightPwaShell } from './PriceInsightPwaShell';
import { TariffData, TimeConfig } from '../../types';

const mockTariffs: TariffData[] = [
  {
    id: 't-1',
    created_at: '2026-02-01T00:00:00.000Z',
    province: '江苏省',
    city: null,
    month: '2026-02',
    category: '大工业',
    voltage_level: '10kV',
    prices: {
      tip: 0.91,
      peak: 0.78,
      flat: 0.56,
      valley: 0.31,
      deep: 0.22,
    },
    time_rules: [{ start: '00:00', end: '24:00', type: 'flat' }],
    currency_unit: 'CNY/kWh',
    last_modified: '2026-02-01T00:00:00.000Z',
  },
];

const mockTimeConfigs: TimeConfig[] = [
  {
    id: 'cfg-1',
    province: '江苏省',
    year: 2026,
    config_type: 'monthly',
    month_pattern: 'All',
    time_rules: [{ start: '00:00', end: '24:00', type: 'valley' }],
    updated_at: '2026-01-01T00:00:00.000Z',
    last_modified: '2026-01-01T00:00:00.000Z',
  },
];

describe('PriceInsightPwaShell', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders annual average config and switches main tabs', () => {
    const onExitToWeb = vi.fn();

    render(
      <PriceInsightPwaShell
        tariffs={mockTariffs}
        timeConfigs={mockTimeConfigs}
        comprehensivePriceMap={{ 't-1': 0.5432 }}
        onExitToWeb={onExitToWeb}
      />, 
    );

    expect(screen.getByText('工商业电价速查')).toBeInTheDocument();
    expect(screen.getByText('查询条件')).toBeInTheDocument();
    expect(screen.getByText('年度平均综合电价')).toBeInTheDocument();

    const latestTab = screen.getByRole('button', { name: '最新电价' });
    expect(latestTab.className).toContain('text-blue-600');

    fireEvent.click(screen.getByRole('button', { name: '年度平均配置' }));
    expect(screen.getByText('计算口径：按月等权平均（缺失月不补算）。')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '历史趋势' }));
    expect(screen.getByText(/江苏省 · 大工业 · 10kV/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '年度平均线' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '列表' }));
    expect(screen.getByRole('columnheader', { name: '综合电价' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /切回 Web/i }));
    expect(onExitToWeb).toHaveBeenCalledTimes(1);
  });
});
