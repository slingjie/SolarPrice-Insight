import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PriceDatabase } from './PriceDatabase';
import { TariffData } from '../types';
import { describe, it, expect, vi } from 'vitest';

const mockTariffs: TariffData[] = [
    {
        id: '1',
        created_at: '2024-01-01',
        province: 'Jiangsu',
        city: null,
        month: '2024-01',
        category: 'Large Industry',
        voltage_level: '1-10kV',
        prices: { tip: 1.5, peak: 1.2, flat: 0.8, valley: 0.4 },
        time_rules: [],
        currency_unit: 'CNY'
    },
    {
        id: '2',
        created_at: '2024-01-01',
        province: 'Zhejiang',
        city: null,
        month: '2024-01',
        category: 'General Industry',
        voltage_level: '35kV',
        prices: { tip: 1.6, peak: 1.3, flat: 0.9, valley: 0.5 },
        time_rules: [],
        currency_unit: 'CNY'
    }
];

describe('PriceDatabase Component', () => {
    it('renders table headers correctly', () => {
        render(<PriceDatabase tariffs={[]} onUpdateTariffs={() => { }} onBack={() => { }} />);
        expect(screen.getByText('省份')).toBeInTheDocument();
        expect(screen.getByText('月份')).toBeInTheDocument();
        expect(screen.getByText('用电分类')).toBeInTheDocument();
        expect(screen.getByText('电压等级')).toBeInTheDocument();
        expect(screen.getByText('尖峰电价')).toBeInTheDocument();
    });

    it('renders data rows correctly', () => {
        render(<PriceDatabase tariffs={mockTariffs} onUpdateTariffs={() => { }} onBack={() => { }} />);
        expect(screen.getByText('Jiangsu')).toBeInTheDocument();
        expect(screen.getByText('Zhejiang')).toBeInTheDocument();
        expect(screen.getByText('Large Industry')).toBeInTheDocument();
        // Check price formatting
        expect(screen.getByText('1.5000')).toBeInTheDocument();
    });

    it('filters data when searching', () => {
        render(<PriceDatabase tariffs={mockTariffs} onUpdateTariffs={() => { }} onBack={() => { }} />);
        const searchInput = screen.getByPlaceholderText('搜索省份、分类...');
        fireEvent.change(searchInput, { target: { value: 'Zhejiang' } });

        expect(screen.queryByText('Jiangsu')).not.toBeInTheDocument();
        expect(screen.getByText('Zhejiang')).toBeInTheDocument();
    });

    it('calls onUpdateTariffs when deleting a row (via modal)', () => {
        const mockUpdate = vi.fn();

        render(<PriceDatabase tariffs={mockTariffs} onUpdateTariffs={mockUpdate} onBack={() => { }} />);

        // Find delete buttons. The first one corresponds to the first row (Jiangsu)
        const deleteButtons = screen.getAllByTitle('删除');
        fireEvent.click(deleteButtons[0]);

        // Expect confirmation modal to appear
        expect(screen.getByText('确认删除')).toBeInTheDocument();
        expect(screen.getByText('确定要删除这条记录吗？此操作无法撤销。')).toBeInTheDocument();

        // Click the confirm button in the modal
        const confirmButton = screen.getByText('确认删除', { selector: 'button' }); // specifically select the button, not header
        fireEvent.click(confirmButton);

        expect(mockUpdate).toHaveBeenCalled();
        // Should return array without the first item
        expect(mockUpdate).toHaveBeenCalledWith([mockTariffs[1]]);
    });

    it('filters exact duplicates and shows grouped view', () => {
        const exactDuplicates = [
            ...mockTariffs,
            { ...mockTariffs[0], id: '3' } // Exact duplicate of first item
        ];

        render(<PriceDatabase tariffs={exactDuplicates} onUpdateTariffs={() => { }} onBack={() => { }} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'exact' } });

        // Should show group header for the duplicate group
        // Group title format: "Jiangsu - 2024-01 - Large Industry - 1-10kV"
        expect(screen.getByText(/Jiangsu - 2024-01 - Large Industry - 1-10kV/)).toBeInTheDocument();

        // Only duplicates (Jiangsu x 2) should be visible in the table rows
        expect(screen.getAllByText('Jiangsu')).toHaveLength(2); // 2 in rows (header is not exact match)
        expect(screen.queryByText('Zhejiang')).not.toBeInTheDocument();
    });

    it('filters price duplicates and shows grouped view', () => {
        const priceDuplicates = [
            ...mockTariffs,
            // Different metadata but same prices as first item
            {
                ...mockTariffs[0],
                id: '3',
                province: 'Anhui',
                prices: { ...mockTariffs[0].prices }
            }
        ];

        render(<PriceDatabase tariffs={priceDuplicates} onUpdateTariffs={() => { }} onBack={() => { }} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'price' } });

        // Group title format: "尖峰:1.5000 / ..."
        expect(screen.getByText(/尖峰:1.5000/)).toBeInTheDocument();

        // Jiangsu and Anhui have same prices, so both should show
        expect(screen.getByText('Jiangsu')).toBeInTheDocument();
        expect(screen.getByText('Anhui')).toBeInTheDocument();
        // Zhejiang has different prices
        expect(screen.queryByText('Zhejiang')).not.toBeInTheDocument();
    });
});
