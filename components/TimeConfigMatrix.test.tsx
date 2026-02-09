import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { TimeConfigMatrix } from './TimeConfigMatrix';

const renderMatrix = (onSave = vi.fn()) => {
    render(<TimeConfigMatrix configs={[]} selectedProvince="江苏省" selectedYear={2026} onSave={onSave} />);
    return onSave;
};

const getCellTitle = (month: number, hour: number, label: string) =>
    `${month}月 ${hour}:00 - ${hour + 1}:00: ${label}`;

describe('TimeConfigMatrix brush behaviors', () => {
    it('paints a single cell to the active type on click', () => {
        renderMatrix();

        const peakButton = screen.getByRole('button', { name: '高峰' });
        fireEvent.click(peakButton);

        const targetCell = screen.getByTitle(getCellTitle(1, 0, '低谷'));
        fireEvent.mouseDown(targetCell);

        expect(screen.getByTitle(getCellTitle(1, 0, '高峰'))).toBeInTheDocument();
    });

    it('paints adjacent cells while dragging across the grid', () => {
        renderMatrix();

        const tipButton = screen.getByRole('button', { name: '尖峰' });
        fireEvent.click(tipButton);

        const firstHourCell = screen.getByTitle(getCellTitle(1, 0, '低谷'));
        const secondHourCell = screen.getByTitle(getCellTitle(1, 1, '低谷'));

        fireEvent.mouseDown(firstHourCell);
        fireEvent.mouseEnter(secondHourCell);

        expect(screen.getByTitle(getCellTitle(1, 0, '尖峰'))).toBeInTheDocument();
        expect(screen.getByTitle(getCellTitle(1, 1, '尖峰'))).toBeInTheDocument();
    });

    it('calls onSave with the selected province and generated configs', () => {
        const mockOnSave = vi.fn();
        renderMatrix(mockOnSave);

        const flatButton = screen.getByRole('button', { name: '平段' });
        fireEvent.click(flatButton);

        const targetCell = screen.getByTitle(getCellTitle(1, 0, '低谷'));
        fireEvent.mouseDown(targetCell);

        const saveButton = screen.getByRole('button', { name: '保存配置' });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
        const [provinceArg, configsArg] = mockOnSave.mock.calls[0];
        expect(provinceArg).toBe('江苏省');
        expect(Array.isArray(configsArg)).toBe(true);
        expect((configsArg as any[]).every(cfg => cfg.province === '江苏省')).toBe(true);
        expect((configsArg as any[]).every(cfg => cfg.year === 2026)).toBe(true);
        expect((configsArg as any[]).every(cfg => cfg.config_type === 'monthly')).toBe(true);
    });
});
