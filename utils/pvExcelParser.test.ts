import { describe, it, expect } from 'vitest';
import { parsePVExcelFile } from './pvExcelParser';
import * as XLSX from 'xlsx';

describe('pvExcelParser', () => {
  const createTestExcel = (data: unknown[][]): Buffer => {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PV');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  };

  it('should parse 24x12 PV Excel with English month names', async () => {
    const header = ['Time', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      const row: unknown[] = [`${h} - ${h + 1}`];
      for (let m = 1; m <= 12; m++) {
        row.push((h + 1) * m * 10); // dummy: (h+1)*m*10 Wh/kWp
      }
      data.push(row);
    }

    const file = createTestExcel(data);
    const result = await parsePVExcelFile(file);

    expect(result.size).toBe(8760); // 365 days * 24 hours
    expect(result.get('01-01 00:00')).toBe(10); // h=0, month=1 => 1*1*10
    expect(result.get('01-01 23:00')).toBe(240); // h=23, month=1 => 24*1*10
    expect(result.get('01-31 12:00')).toBe(130); // last day of Jan, h=12 => 13*1*10
    expect(result.get('02-01 00:00')).toBe(20); // Feb, h=0 => 1*2*10
  });

  it('should parse 24x12 PV Excel with Chinese month names', async () => {
    const header = ['时间', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      const row: unknown[] = [`${h}-${h + 1}`];
      for (let m = 1; m <= 12; m++) {
        row.push(100);
      }
      data.push(row);
    }

    const file = createTestExcel(data);
    const result = await parsePVExcelFile(file);

    expect(result.size).toBe(8760);
    expect(result.get('01-01 00:00')).toBe(100);
    expect(result.get('12-31 23:00')).toBe(100);
  });

  it('should parse 24x12 PV Excel with numeric month columns', async () => {
    const header: unknown[] = ['Hour', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      const row: unknown[] = [`${h} - ${h + 1}`];
      for (let m = 1; m <= 12; m++) {
        row.push(50);
      }
      data.push(row);
    }

    const file = createTestExcel(data);
    const result = await parsePVExcelFile(file);

    expect(result.size).toBe(8760);
    expect(result.get('06-15 12:00')).toBe(50);
  });

  it('should handle empty/invalid cells as 0', async () => {
    const header = ['Time', 'Jan', 'Feb'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      const row: unknown[] = [`${h}-${h + 1}`, h === 0 ? '' : (h === 1 ? 'invalid' : 100), h === 2 ? 'text' : 200];
      data.push(row);
    }

    const file = createTestExcel(data);
    const result = await parsePVExcelFile(file);

    expect(result.get('01-01 00:00')).toBe(0); // empty cell in Jan
    expect(result.get('01-01 01:00')).toBe(0); // invalid cell in Jan
    expect(result.get('01-01 02:00')).toBe(100); // valid number
    expect(result.get('01-01 00:00')).toBe(0); // Feb column validation not needed here
  });

  it('should reject if not 24 hour rows', async () => {
    const header = ['Time', 'Jan'];
    const data: unknown[][] = [header, ['0-1', 100], ['1-2', 100]]; // only 2 rows

    const file = createTestExcel(data);
    await expect(parsePVExcelFile(file)).rejects.toThrow('Expected 24 hour rows, got 2');
  });

  it('should reject invalid hour label', async () => {
    const header = ['Time', 'Jan'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      const label = h === 5 ? 'invalid' : `${h}-${h + 1}`;
      data.push([label, 100]);
    }

    const file = createTestExcel(data);
    await expect(parsePVExcelFile(file)).rejects.toThrow('Invalid hour label at row 7');
  });

  it('should reject if no month columns detected', async () => {
    const header = ['Time', 'Unknown1', 'Unknown2'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      data.push([`${h}-${h + 1}`, 100, 200]);
    }

    const file = createTestExcel(data);
    await expect(parsePVExcelFile(file)).rejects.toThrow('No valid month columns detected');
  });

  it('should expand monthly profile to all days in month (baseYear=2021)', async () => {
    const header = ['Time', 'Jan', 'Feb'];
    const data: unknown[][] = [header];
    for (let h = 0; h < 24; h++) {
      data.push([`${h}-${h + 1}`, 100 + h, 200 + h]);
    }

    const file = createTestExcel(data);
    const result = await parsePVExcelFile(file);

    // January has 31 days
    expect(result.get('01-01 05:00')).toBe(105);
    expect(result.get('01-15 05:00')).toBe(105); // same value across all Jan days
    expect(result.get('01-31 05:00')).toBe(105);

    // February has 28 days (2021 non-leap)
    expect(result.get('02-01 05:00')).toBe(205);
    expect(result.get('02-28 05:00')).toBe(205);
    expect(result.has('02-29 00:00')).toBe(false); // no Feb 29 in 2021
  });
});
