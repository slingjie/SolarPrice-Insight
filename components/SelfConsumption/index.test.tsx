import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { SelfConsumption } from './index';

vi.mock('../../hooks/useDatabase', () => {
  return {
    useHolidays: () => ({ holidays: [], loading: false }),
    usePersonas: () => ({ personas: [], loading: false }),
  };
});

describe('SelfConsumption layout', () => {
  it('renders guidance empty state when no results', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    expect(screen.getByTestId('sc-empty-state')).toBeInTheDocument();
    expect(screen.queryByText('负荷数据预览')).not.toBeInTheDocument();
  });

  it('accordion supports multi-open behavior', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    // By default all sections are expanded.
    expect(screen.getByText('所在省份')).toBeInTheDocument();
    expect(screen.getByText('工作作息配置')).toBeInTheDocument();

    // Collapse one section and ensure another remains visible.
    fireEvent.click(screen.getByRole('button', { name: '项目基础信息' }));
    expect(screen.queryByText('所在省份')).not.toBeInTheDocument();
    expect(screen.getByText('工作作息配置')).toBeInTheDocument();
  });

  it('supports expand all / collapse all controls', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    fireEvent.click(screen.getByText('收起全部'));
    expect(screen.queryByText('所在省份')).not.toBeInTheDocument();
    expect(screen.queryByText('工作作息配置')).not.toBeInTheDocument();
    expect(screen.queryByText('用电分类')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('展开全部'));
    expect(screen.getByText('所在省份')).toBeInTheDocument();
    expect(screen.getByText('工作作息配置')).toBeInTheDocument();
    expect(screen.getByText('用电分类')).toBeInTheDocument();
  });

  it('shows summary tags when sections are collapsed', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    const provinceSelect = screen.getByDisplayValue('请选择省份');
    fireEvent.change(provinceSelect, { target: { value: '江苏省' } });

    fireEvent.click(screen.getByRole('button', { name: '项目基础信息' }));
    
    expect(screen.getByText('江苏省')).toBeInTheDocument();
  });

  it('updates guidance checklist when inputs are provided', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    const step1Label = screen.getByText('基础信息');
    const step1Container = step1Label.parentElement?.parentElement;
    expect(step1Container).toHaveClass('bg-gray-50');

    const provinceSelect = screen.getByDisplayValue('请选择省份');
    fireEvent.change(provinceSelect, { target: { value: '江苏省' } });

    expect(step1Container).toHaveClass('bg-blue-50');
    expect(screen.getByText('已选: 江苏省')).toBeInTheDocument();
  });

  it('toggles load data preview in empty state', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);
    expect(screen.getByText('开始您的光伏消纳分析')).toBeInTheDocument();
    expect(screen.queryByTestId('sc-load-preview-toggle')).not.toBeInTheDocument();
  });

  it('opens HolidayManager from the load section', () => {
    render(<SelfConsumption timeConfigs={[]} tariffs={[]} />);

    fireEvent.click(screen.getByText('编辑节假日库'));
    expect(screen.getByText('节假日管理')).toBeInTheDocument();
  });
});
