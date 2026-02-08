import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseConsumptionFile, parseSelfConsumptionLoadFile } from './excelParser';
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
      await expect(parseConsumptionFile(file)).rejects.toThrow('Unable to detect file format');
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

  describe('tou-row format (NEW)', () => {
    it('parses tou-row format with Chinese month names (tou, 1月, 2月, ...)', async () => {
      const data = [
        { tou: '尖', '1月': 100, '2月': 110, '3月': 120 },
        { tou: '峰', '1月': 200, '2月': 210, '3月': 220 },
        { tou: '平', '1月': 300, '2月': 310, '3月': 320 },
        { tou: '谷', '1月': 400, '2月': 410, '3月': 420 },
        { tou: '深', '1月': 50, '2月': 55, '3月': 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 200, flat: 300, valley: 400, deep: 50,
      });
      expect(result[1]).toEqual({
        month: 2, tip: 110, peak: 210, flat: 310, valley: 410, deep: 55,
      });
      expect(result[2]).toEqual({
        month: 3, tip: 120, peak: 220, flat: 320, valley: 420, deep: 60,
      });
    });

    it('parses tou-row format with English month names (tou, Jan, Feb, ...)', async () => {
      const data = [
        { tou: 'tip', Jan: 100, Feb: 110, Mar: 120 },
        { tou: 'peak', Jan: 200, Feb: 210, Mar: 220 },
        { tou: 'flat', Jan: 300, Feb: 310, Mar: 320 },
        { tou: 'valley', Jan: 400, Feb: 410, Mar: 420 },
        { tou: 'deep', Jan: 50, Feb: 55, Mar: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 200, flat: 300, valley: 400, deep: 50,
      });
      expect(result[1]).toEqual({
        month: 2, tip: 110, peak: 210, flat: 310, valley: 410, deep: 55,
      });
    });

    it('parses tou-row format with numeric month values (1, 2, 3, ...)', async () => {
      const data = [
        { tou: '尖', 1: 100, 2: 110, 3: 120 },
        { tou: '峰', 1: 200, 2: 210, 3: 220 },
        { tou: '平', 1: 300, 2: 310, 3: 320 },
        { tou: '谷', 1: 400, 2: 410, 3: 420 },
        { tou: '深', 1: 50, 2: 55, 3: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0].month).toBe(1);
      expect(result[0].tip).toBe(100);
      expect(result[1].month).toBe(2);
      expect(result[1].tip).toBe(110);
    });

    it('handles missing TOU fields (defaults to 0)', async () => {
      const data = [
        { tou: '尖', Jan: 100, Feb: 110 },
        { tou: '峰', Jan: 200, Feb: 210 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 200, flat: 0, valley: 0, deep: 0,
      });
    });

    it('handles tou-row format with alternative TOU labels (尖峰, 高峰, 平段, 低谷, 深谷)', async () => {
      const data = [
        { tou: '尖峰', Jan: 100, Feb: 110 },
        { tou: '高峰', Jan: 200, Feb: 210 },
        { tou: '平段', Jan: 300, Feb: 310 },
        { tou: '低谷', Jan: 400, Feb: 410 },
        { tou: '深谷', Jan: 50, Feb: 55 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 200, flat: 300, valley: 400, deep: 50,
      });
    });

    it('skips rows with invalid TOU labels in tou-row format', async () => {
      const data = [
        { tou: '尖', Jan: 100, Feb: 110 },
        { tou: 'invalid_tou', Jan: 200, Feb: 210 },
        { tou: '峰', Jan: 200, Feb: 210 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0].tip).toBe(100);
      expect(result[0].peak).toBe(200);
    });

    it('handles empty cells in tou-row format (defaults to 0)', async () => {
      const data = [
        { tou: '尖', Jan: 100, Feb: '', Mar: null },
        { tou: '峰', Jan: '', Feb: 210, Mar: undefined },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        month: 1, tip: 100, peak: 0, flat: 0, valley: 0, deep: 0,
      });
      expect(result[1]).toEqual({
        month: 2, tip: 0, peak: 210, flat: 0, valley: 0, deep: 0,
      });
      expect(result[2]).toEqual({
        month: 3, tip: 0, peak: 0, flat: 0, valley: 0, deep: 0,
      });
    });

    it('accumulates duplicate TOU rows in tou-row format', async () => {
      const data = [
        { tou: '尖', Jan: 100, Feb: 110 },
        { tou: '尖', Jan: 50, Feb: 60 },
        { tou: '峰', Jan: 200, Feb: 210 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(2);
      expect(result[0].tip).toBe(150);
    });

    it('tou-row and month-row formats with same data produce identical output', async () => {
      const monthRowData = [
        { 月份: 1, 尖: 100, 峰: 200, 平: 300, 谷: 400, 深谷: 50 },
        { 月份: 2, 尖: 110, 峰: 210, 平: 310, 谷: 410, 深谷: 55 },
      ];

      const touRowData = [
        { tou: '尖', '1月': 100, '2月': 110 },
        { tou: '峰', '1月': 200, '2月': 210 },
        { tou: '平', '1月': 300, '2月': 310 },
        { tou: '谷', '1月': 400, '2月': 410 },
        { tou: '深', '1月': 50, '2月': 55 },
      ];

      const monthRowFile = createExcelFile(monthRowData);
      const touRowFile = createExcelFile(touRowData);

      const monthRowResult = await parseConsumptionFile(monthRowFile);
      const touRowResult = await parseConsumptionFile(touRowFile);

      expect(monthRowResult).toEqual(touRowResult);
      expect(monthRowResult[0].tip).toBe(touRowResult[0].tip);
      expect(monthRowResult[0].peak).toBe(touRowResult[0].peak);
      expect(monthRowResult[1].deep).toBe(touRowResult[1].deep);
    });

    it('handles mixed English and Chinese month labels in tou-row', async () => {
      const data = [
        { tou: '尖', Jan: 100, '2月': 110, Mar: 120 },
        { tou: '峰', Jan: 200, '2月': 210, Mar: 220 },
        { tou: '平', Jan: 300, '2月': 310, Mar: 320 },
        { tou: '谷', Jan: 400, '2月': 410, Mar: 420 },
        { tou: '深', Jan: 50, '2月': 55, Mar: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0].month).toBe(1);
      expect(result[1].month).toBe(2);
      expect(result[2].month).toBe(3);
      expect(result[0].tip).toBe(100);
      expect(result[1].peak).toBe(210);
      expect(result[2].flat).toBe(320);
    });

    it('sorts tou-row output by month', async () => {
      const data = [
        { tou: '尖', Dec: 100, Jan: 110, Jun: 120 },
        { tou: '峰', Dec: 200, Jan: 210, Jun: 220 },
        { tou: '平', Dec: 300, Jan: 310, Jun: 320 },
        { tou: '谷', Dec: 400, Jan: 410, Jun: 420 },
        { tou: '深', Dec: 50, Jan: 55, Jun: 60 },
      ];
      const file = createExcelFile(data);
      const result = await parseConsumptionFile(file);

      expect(result).toHaveLength(3);
      expect(result[0].month).toBe(1);
      expect(result[1].month).toBe(6);
      expect(result[2].month).toBe(12);
    });
  });
});

describe('parseSelfConsumptionLoadFile', () => {
  it('falls back to monthly-total format (月份 + 总电量)', async () => {
    const data = [
      { 月份: 1, 总电量: 1000 },
      { 月份: 2, 总电量: 1100 },
    ];
    const file = createExcelFile(data);
    const result = await parseSelfConsumptionLoadFile(file);
    expect(result.format).toBe('monthly-total');
    if (result.format !== 'monthly-total') throw new Error('unexpected format');
    expect(result.monthly).toEqual([
      { month: 1, total: 1000 },
      { month: 2, total: 1100 },
    ]);
  });
});
