import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { parseSpreadsheetFile } from './dataImport';
import type { TariffData, TimeConfig, LoadPersona } from '../types';

function polyfillArrayBuffer(file: File, blob: Blob): File {
  if (!file.arrayBuffer) {
    (file as File & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
      new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as ArrayBuffer);
        reader.readAsArrayBuffer(blob);
      });
  }
  return file;
}

function createFileFromDisk(relativePath: string, filename: string): File {
  const fullPath = resolve(process.cwd(), relativePath);
  const buffer = readFileSync(fullPath);
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const file = new File([blob], filename, { type: blob.type });
  return polyfillArrayBuffer(file, blob);
}

function createXlsxFileFromRows(rows: Record<string, unknown>[], filename = 'test.xlsx'): File {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, '数据');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const file = new File([blob], filename, { type: blob.type });
  return polyfillArrayBuffer(file, blob);
}

describe('parseSpreadsheetFile - tariff import regression', () => {
  it('parses provided tariff file into valid tariff rows', async () => {
    const file = createFileFromDisk(
      'docs/test/电价.xlsx',
      '电价.xlsx',
    );

    const parsed = (await parseSpreadsheetFile(file, 'tariffs')) as TariffData[];

    expect(parsed.length).toBeGreaterThan(0);

    for (const row of parsed) {
      expect(row.id).toBeTruthy();
      expect(row.province).toBeTruthy();
      expect(row.month).toBeTruthy();
      expect(row.category).toBeTruthy();
      expect(row.voltage_level).toBeTruthy();
      expect(typeof row.prices.tip).toBe('number');
      expect(typeof row.prices.peak).toBe('number');
      expect(typeof row.prices.flat).toBe('number');
      expect(typeof row.prices.valley).toBe('number');
      expect(Array.isArray(row.time_rules)).toBe(true);
      expect(Number.isNaN(Date.parse(row.created_at))).toBe(false);
      expect(Number.isNaN(Date.parse(row.last_modified))).toBe(false);
    }
  });
});

describe('parseSpreadsheetFile - empty row filtering', () => {
  it('skips tariff rows where 省份 is empty', async () => {
    const rows = [
      { '省份': '安徽省', '城市': '', '月份': '1', '用电类别': '一般工商业', '电压等级': '1-10kV', '平段价(元/kWh)': 0.5 },
      { '省份': '', '城市': '', '月份': '', '用电类别': '', '电压等级': '', '平段价(元/kWh)': '' },
      { '省份': '浙江省', '城市': '', '月份': '2', '用电类别': '大工业', '电压等级': '35kV', '平段价(元/kWh)': 0.6 },
    ];
    const file = createXlsxFileFromRows(rows);
    const parsed = (await parseSpreadsheetFile(file, 'tariffs')) as TariffData[];

    expect(parsed).toHaveLength(2);
    expect(parsed[0].province).toBe('安徽省');
    expect(parsed[1].province).toBe('浙江省');
  });

  it('skips config rows where 省份 is empty', async () => {
    const rows = [
      { '省份': '江苏省', '月份模式': 'All' },
      { '省份': '', '月份模式': '' },
      { '省份': '  ', '月份模式': '1,2,3' },
    ];
    const file = createXlsxFileFromRows(rows);
    const parsed = (await parseSpreadsheetFile(file, 'configs')) as TimeConfig[];

    expect(parsed).toHaveLength(1);
    expect(parsed[0].province).toBe('江苏省');
  });

  it('skips persona rows where 名称 is empty', async () => {
    const rows = [
      { '标识': 'industrial', '名称': '工业用户', '是否默认': '否', '工作日24点占比': '1,2,3', '周末24点占比': '' },
      { '标识': '', '名称': '', '是否默认': '', '工作日24点占比': '', '周末24点占比': '' },
    ];
    const file = createXlsxFileFromRows(rows);
    const parsed = (await parseSpreadsheetFile(file, 'personas')) as LoadPersona[];

    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('工业用户');
  });

  it('returns empty array when all rows are empty (after header)', async () => {
    const rows = [
      { '省份': '', '月份': '', '用电类别': '' },
      { '省份': '  ', '月份': '  ', '用电类别': '' },
    ];
    const file = createXlsxFileFromRows(rows);
    const parsed = await parseSpreadsheetFile(file, 'tariffs');

    expect(parsed).toHaveLength(0);
  });
});
