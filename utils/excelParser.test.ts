import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseConsumptionFile } from './excelParser';
import { ExcelParseError } from '../types/analysis';

function createExcelFile(data: Record<string, unknown>[]): File {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const file = new File([blob], 'test.xlsx', { type: blob.type });
  if (!file.arrayBuffer) {
    (file as File & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(blob);
      });
  }
  return file;
}

function createEmptyExcelFile(): File {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const file = new File([blob], 'empty.xlsx', { type: blob.type });
  if (!file.arrayBuffer) {
    (file as File & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(blob);
      });
  }
  return file;
}

describe('parseConsumptionFile', () => {
  describe('valid file with standard headers', () => {
    it('parses standard Chinese headers (月份, 尖, 峰, 平, 谷, 深谷)', async () => {
      const data = [
        { 月份: 1, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 2, 尖: 110, 峰: 210, 平: 310, 谷: 410, 深谷: 55 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 200, flat: 300, valley: 400, deep: 50,
      });
      expect(result[1]).toEqual({
        month: 2, tip: 110, peak: 210, flat: 310, valley: 410, deep: 55,
      });
    });

    it('parses English headers (Month, tip, peak, flat, valley, deep)', async () => {
      const data = [
        { Month: 3, tip: 150, peak: 250, flat: 350, valley: 450, deep: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        month: 3, tip: 150, peak: 250, flat: 350, valley: 450, deep: 60,
      });
    });
  });

  describe('valid file with alternative headers (fuzzy match)', () => {
    it('parses alternative Chinese headers (尖峰, 高峰, 平段, 低谷)', async () => {
      const data = [
        { 月份: 4, 尖峰: 120, 高峰: 220, 平段: 320, 低谷: 420, 深谷: 70 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        month: 4, tip: 120, peak: 220, flat: 320, valley: 420, deep: 70,
      });
    });

    it('handles month format "1月", "2月", etc.', async () => {
      const data = [
        { 月份: '1月', 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: '12月', 尖: 180, 峰: 280, 平: 380, 谷: 480, 深谷: 90 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe(1);
      expect(result[1].month).toBe(12);
    });
  });

  describe('missing columns (should default to 0)', () => {
    it('defaults missing TOU columns to 0', async () => {
      const data = [
        { 月份: 5, 峰: 200 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        month: 5, tip: 0, peak: 200, flat: 0, valley: 0, deep: 0,
      });
    });

    it('handles empty cell values as 0', async () => {
      const data = [
        { 月份: 6, 尖: '', 峰: 200, 平: null, 谷: undefined, 深谷: 0 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        month: 6, tip: 0, peak: 200, flat: 0, valley: 0, deep: 0,
      });
    });
  });

  describe('number parsing', () => {
    it('parses numbers with comma separators (e.g., "1,000")', async () => {
      const data = [
        { 月份: 7, 尖: '1,234', 峰: '2,345.67', 平: 300, 谷: 400, 深谷: 50 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0].tip).toBe(1234);
      expect(result[0].peak).toBe(2345.67);
    });

    it('handles string numbers correctly', async () => {
      const data = [
        { 月份: '8', 尖: '100', 峰: '200.5', 平: '300', 谷: '400', 深谷: '50' },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe(8);
      expect(result[0].tip).toBe(100);
      expect(result[0].peak).toBe(200.5);
    });
  });

  describe('empty/invalid file (should throw error)', () => {
    it('throws error for empty file', async () => {
      const file = createEmptyExcelFile();

      await expect(parseConsumptionFile(file)).rejects.toThrow(ExcelParseError);
      await expect(parseConsumptionFile(file)).rejects.toThrow('no data rows');
    });

    it('throws error for file without month column', async () => {
      const data = [
        { 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
      ];
      const file = createExcelFile(data);

      await expect(parseConsumptionFile(file)).rejects.toThrow(ExcelParseError);
      await expect(parseConsumptionFile(file)).rejects.toThrow('Missing required');
    });

    it('throws error when all month values are invalid', async () => {
      const data = [
        { 月份: 'invalid', 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 13, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 0, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
      ];
      const file = createExcelFile(data);

      await expect(parseConsumptionFile(file)).rejects.toThrow(ExcelParseError);
      await expect(parseConsumptionFile(file)).rejects.toThrow('No valid data rows');
    });
  });

  describe('result ordering', () => {
    it('sorts results by month', async () => {
      const data = [
        { 月份: 12, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 1, 尖: 110, 峰: 210, 平: 310, 谷: 410, 深谷: 55 },
        { 月份: 6, 尖: 120, 峰: 220, 平: 320, 谷: 420, 深谷: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0].month).toBe(1);
      expect(result[1].month).toBe(6);
      expect(result[2].month).toBe(12);
    });
  });

  describe('edge cases', () => {
    it('skips rows with invalid month values but keeps valid ones', async () => {
      const data = [
        { 月份: 1, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 'invalid', 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 3, 尖: 120, 峰: 220, 平: 320, 谷: 420, 深谷: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe(1);
      expect(result[1].month).toBe(3);
    });
  });
});
