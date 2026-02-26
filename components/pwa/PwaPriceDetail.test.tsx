import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PwaPriceDetail, sortTooltipPayloadByValue } from './PwaPriceDetail';
import { TariffData } from '../../types';

const historyWithDeep: TariffData[] = [
  {
    id: 'detail-1',
    created_at: '2026-01-01T00:00:00.000Z',
    province: '江苏省',
    city: null,
    month: '2026-03',
    category: '大工业',
    voltage_level: '10kV',
    prices: { tip: 1, peak: 2, flat: 3, valley: 4, deep: 5 },
    time_rules: [],
    currency_unit: 'CNY/kWh',
    last_modified: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'detail-2',
    created_at: '2026-01-01T00:00:00.000Z',
    province: '江苏省',
    city: null,
    month: '2026-02',
    category: '大工业',
    voltage_level: '10kV',
    prices: { tip: 1.1, peak: 2.1, flat: 3.1, valley: 4.1 },
    time_rules: [],
    currency_unit: 'CNY/kWh',
    last_modified: '2026-02-01T00:00:00.000Z',
  },
];

describe('PwaPriceDetail', () => {
  it('switches between curve and table, and conditionally shows deep column', () => {
    render(
      <PwaPriceDetail
        history={historyWithDeep}
        province="江苏省"
        category="大工业"
        voltageLevel="10kV"
        comprehensivePriceMap={{ 'detail-1': 0.8888, 'detail-2': null }}
        annualAverage={0.7777}
      />, 
    );

    expect(screen.getByText('历史趋势')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '年度平均线' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '列表' }));
    expect(screen.getByRole('columnheader', { name: '深谷' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '综合电价' })).toBeInTheDocument();
    expect(screen.getByText('0.888800')).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    expect(screen.getByText('2026-03')).toBeInTheDocument();
  });

  it('hides deep column when no deep values exist', () => {
    const noDeep = historyWithDeep.map((item) => ({
      ...item,
      prices: { ...item.prices, deep: undefined },
    }));

    render(
      <PwaPriceDetail
        history={noDeep}
        province="江苏省"
        category="大工业"
        voltageLevel="10kV"
        comprehensivePriceMap={{ 'detail-1': 0.7777, 'detail-2': 0.6666 }}
        annualAverage={null}
      />, 
    );

    expect(screen.queryByRole('button', { name: '年度平均线' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '列表' }));
    expect(screen.queryByRole('columnheader', { name: '深谷' })).toBeNull();
  });

  it('renders zero tou price as placeholder in table view', () => {
    const withZeroTou: TariffData[] = [
      {
        ...historyWithDeep[0],
        prices: {
          ...historyWithDeep[0].prices,
          tip: 0,
          peak: 1.05,
          flat: 0.65,
          valley: 0.32,
          deep: undefined,
        },
      },
    ];

    render(
      <PwaPriceDetail
        history={withZeroTou}
        province="江苏省"
        category="大工业"
        voltageLevel="10kV"
        comprehensivePriceMap={{ 'detail-1': 0.7777 }}
        annualAverage={0.7777}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '列表' }));
    expect(screen.queryByText('0.000000')).toBeNull();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('sorts tooltip entries by value descending with null at bottom', () => {
    const sorted = sortTooltipPayloadByValue([
      { name: '平段', value: 0.65 },
      { name: '尖峰', value: 1.2 },
      { name: '低谷', value: null },
      { name: '高峰', value: 1.03 },
    ]);

    expect(sorted.map((item) => item.name)).toEqual(['尖峰', '高峰', '平段', '低谷']);
  });
});
