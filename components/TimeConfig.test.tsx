import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { TimeConfig, TimeType } from '../types';

vi.mock('./TimeConfigMatrix', () => ({
  TimeConfigMatrix: ({
    selectedProvince,
  }: {
    configs: TimeConfig[];
    selectedProvince: string;
    onSave: (province: string, newConfigs: TimeConfig[]) => void;
  }) => <div data-testid="mock-matrix">Matrix for {selectedProvince}</div>,
}));

import { TimeConfigView, MiniGrid } from './TimeConfig';

const baseRule: TimeConfig['time_rules'] = [
  { start: '00:00', end: '24:00', type: 'valley' },
];

const seededConfigs: TimeConfig[] = [
  {
    id: 'tc-js-01',
    province: '江苏省',
    year: 2026,
    config_type: 'monthly',
    month_pattern: 'All',
    time_rules: baseRule,
    updated_at: '2025-01-01T00:00:00Z',
    last_modified: '2025-01-01T00:00:00Z',
  },
  {
    id: 'tc-zj-01',
    province: '浙江省',
    year: 2026,
    config_type: 'monthly',
    month_pattern: 'All',
    time_rules: baseRule,
    updated_at: '2025-01-01T00:00:00Z',
    last_modified: '2025-01-01T00:00:00Z',
  },
];

const renderWithConfigs = (initialConfigs: TimeConfig[]) => {
  const Wrapper: React.FC = () => {
    const [configs, setConfigs] = useState(initialConfigs);
    return <TimeConfigView configs={configs} onSave={setConfigs} />;
  };

  return render(<Wrapper />);
};

describe('TimeConfig interactions', () => {
  it('adds a custom province via the search add flow and opens the editor', () => {
    render(<TimeConfigView configs={[]} onSave={() => {}} />);

    const searchInput = screen.getByPlaceholderText('搜索省份...');
    fireEvent.change(searchInput, { target: { value: '测试省' } });

    const addButton = screen.getByRole('button', { name: /新增 "测试省"/ });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    expect(screen.getByTestId('mock-matrix')).toHaveTextContent('Matrix for 测试省');
  });

  it('does not surface the add button when the search term matches an existing province', () => {
    render(<TimeConfigView configs={seededConfigs} onSave={() => {}} />);

    const searchInput = screen.getByPlaceholderText('搜索省份...');
    fireEvent.change(searchInput, { target: { value: '江苏省' } });

    expect(screen.queryByRole('button', { name: /新增 "江苏省"/ })).not.toBeInTheDocument();
  });

  it('clearing a selected province reverts the right panel to the empty state prompt', () => {
    renderWithConfigs(seededConfigs);

    fireEvent.click(screen.getByRole('button', { name: /^江苏省$/ }));

    const deleteButtons = screen.getAllByTitle('清空配置');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/确定要清空 江苏省/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '清空' }));

    expect(screen.getByText('请在左侧选择省份进行配置')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-matrix')).not.toBeInTheDocument();
  });

  it('deleting another province keeps the current editor open', () => {
    renderWithConfigs(seededConfigs);

    fireEvent.click(screen.getByRole('button', { name: /^江苏省$/ }));

    const deleteButtons = screen.getAllByTitle('清空配置');
    fireEvent.click(deleteButtons[1]);

    fireEvent.click(screen.getByRole('button', { name: '清空' }));

    expect(screen.getByTestId('mock-matrix')).toHaveTextContent('Matrix for 江苏省');
  });

  it('creates a special-date range rule for the selected province', () => {
    renderWithConfigs(seededConfigs);

    fireEvent.click(screen.getByRole('button', { name: /^江苏省$/ }));

    fireEvent.change(screen.getByLabelText('特殊日期开始'), { target: { value: '2026-02-10' } });
    fireEvent.change(screen.getByLabelText('特殊日期结束'), { target: { value: '2026-02-12' } });

    fireEvent.click(screen.getByRole('button', { name: '新增特殊日期区间' }));
    fireEvent.click(screen.getByRole('button', { name: '保存特殊日期区间规则' }));

    expect(screen.getByText('2026-02-10 至 2026-02-12')).toBeInTheDocument();
  });

  it('restores range end date when config stores inline special_date range', () => {
    const configsWithInlineRange: TimeConfig[] = [
      ...seededConfigs,
      {
        id: 'tc-js-special-inline',
        province: '江苏省',
        year: 2026,
        config_type: 'special_date',
        month_pattern: 'Special',
        special_date: '2026-03-01~2026-03-03',
        time_rules: baseRule,
        updated_at: '2025-01-01T00:00:00Z',
        last_modified: '2025-01-01T00:00:00Z',
      },
    ];

    renderWithConfigs(configsWithInlineRange);

    fireEvent.click(screen.getByRole('button', { name: /^江苏省$/ }));
    const rangeText = screen.getByText('2026-03-01 至 2026-03-03');
    const rangeRow = rangeText.parentElement;
    expect(rangeRow).toBeTruthy();

    fireEvent.click(within(rangeRow as HTMLElement).getByRole('button', { name: '编辑' }));

    expect(screen.getByLabelText('编辑特殊日期开始')).toHaveValue('2026-03-01');
    expect(screen.getByLabelText('编辑特殊日期结束')).toHaveValue('2026-03-03');
  });
});
