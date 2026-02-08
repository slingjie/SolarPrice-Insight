import * as XLSX from 'xlsx';
import type { TariffData, TimeConfig, ComprehensiveResult, LoadPersona, TimeRule, TimeType } from '../types';
import { canUseSaveFilePicker } from './fileDialog';
import { resolveTimeConfigForMonth } from './timeConfigResolver';

export type ExportFormat = 'xlsx' | 'csv';
export type DataCategory = 'tariffs' | 'configs' | 'results' | 'personas';

const TIME_TYPE_COLUMNS = ['尖峰时段', '高峰时段', '平段时段', '低谷时段', '深谷时段'] as const;
const TIME_TYPE_MAP: Record<string, typeof TIME_TYPE_COLUMNS[number]> = {
  tip: '尖峰时段', peak: '高峰时段', flat: '平段时段', valley: '低谷时段', deep: '深谷时段',
};

const TYPE_TO_LABEL: Record<TimeType, string> = {
  tip: '尖', peak: '峰', flat: '平', valley: '谷', deep: '深',
};

const HOUR_HEADERS = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}`);

const timeRulesToColumns = (rules: TimeRule[], prefix = ''): Record<string, string> => {
  const grouped: Record<string, string[]> = {};
  for (const col of TIME_TYPE_COLUMNS) grouped[prefix + col] = [];

  for (const r of rules ?? []) {
    const col = prefix + (TIME_TYPE_MAP[r.type] ?? '');
    if (col && grouped[col]) grouped[col].push(`${r.start}-${r.end}`);
  }

  const result: Record<string, string> = {};
  for (const [key, ranges] of Object.entries(grouped)) {
    result[key] = ranges.join(', ');
  }
  return result;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
};

const tariffToRow = (t: TariffData) => ({
  ID: t.id,
  省份: t.province,
  城市: t.city ?? '',
  月份: t.month,
  用电类别: t.category,
  电压等级: t.voltage_level,
  '尖峰价(元/kWh)': t.prices.tip,
  '高峰价(元/kWh)': t.prices.peak,
  '平段价(元/kWh)': t.prices.flat,
  '低谷价(元/kWh)': t.prices.valley,
  '深谷价(元/kWh)': t.prices.deep ?? '',
  货币单位: t.currency_unit,
  创建时间: t.created_at,
  最后修改: t.last_modified,
});

const configToRow = (c: TimeConfig) => ({
  ID: c.id,
  省份: c.province,
  月份模式: c.month_pattern,
  ...timeRulesToColumns(c.time_rules),
  ...timeRulesToColumns(c.weekend_time_rules ?? [], '周末'),
  更新时间: c.updated_at,
  最后修改: c.last_modified,
});

const resultToRow = (r: ComprehensiveResult) => ({
  ID: r.id,
  省份: r.province,
  用电类别: r.category,
  电压等级: r.voltage_level,
  '均价(元/kWh)': r.avg_price,
  覆盖月份: r.months.join(','),
  开始时间: r.start_time,
  结束时间: r.end_time,
  最后修改: r.last_modified,
});

const personaToRow = (p: LoadPersona) => ({
  ID: p.id,
  标识: p.slug,
  名称: p.name,
  是否默认: p.isDefault ? '是' : '否',
  工作日24点占比: p.weekday_shares.map(s => s.toFixed(4)).join(','),
  周末24点占比: p.weekend_shares ? p.weekend_shares.map(s => s.toFixed(4)).join(',') : '',
  更新时间: p.updated_at,
  最后修改: p.last_modified,
});

/**
 * 将 TimeConfig[] 构建为多 sheet 的 12×24 矩阵 workbook。
 * 每个省份一个 sheet，行=月份(1-12)，列=小时(0-1 ~ 23-24)，
 * 单元格值为单字标签（尖/峰/平/谷/深）。
 */
const buildConfigMatrixWorkbook = (configs: TimeConfig[]): XLSX.WorkBook => {
  const provinces = [...new Set(configs.filter(c => !c._deleted).map(c => c.province))];
  const wb = XLSX.utils.book_new();

  for (const province of provinces) {
    const rows: Record<string, string | number>[] = [];
    for (let month = 1; month <= 12; month++) {
      const resolved = resolveTimeConfigForMonth(configs, province, month);
      const row: Record<string, string | number> = { year: new Date().getFullYear(), Month: month };
      for (let h = 0; h < 24; h++) {
        const type = resolved?.touGrid[h] ?? 'flat';
        row[HOUR_HEADERS[h]] = TYPE_TO_LABEL[type] ?? '平';
      }
      rows.push(row);
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 }, { wch: 6 },
      ...HOUR_HEADERS.map(() => ({ wch: 4 })),
    ];
    XLSX.utils.book_append_sheet(wb, ws, province);
  }

  if (wb.SheetNames.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['暂无时段配置数据']]);
    XLSX.utils.book_append_sheet(wb, ws, '空');
  }

  return wb;
};

export const exportData = async (
  category: DataCategory,
  data: TariffData[] | TimeConfig[] | ComprehensiveResult[] | LoadPersona[],
  format: ExportFormat,
  filenamePrefix: string,
): Promise<void> => {
  if (!data || data.length === 0) {
    alert('暂无数据可导出');
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const ext = format === 'xlsx' ? '.xlsx' : '.csv';
  const suggestedName = `${filenamePrefix}_${dateStr}${ext}`;

  // Chrome 要求 showSaveFilePicker 在用户激活 token 过期前调用，
  // 所以必须在数据序列化之前先获取 file handle。
  let fileHandle: FileSystemFileHandle | null = null;
  if (canUseSaveFilePicker()) {
    try {
      const mimeType = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';
      const description = format === 'xlsx' ? 'Excel 文件' : 'CSV 文件';

      fileHandle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [{ description, accept: { [mimeType]: [ext] } }],
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      fileHandle = null;
    }
  }

  // configs + xlsx 使用 12×24 矩阵格式（每省一个 sheet）
  if (category === 'configs' && format === 'xlsx') {
    const wb = buildConfigMatrixWorkbook(data as TimeConfig[]);
    const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    const blob = new Blob([xlsxData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    downloadBlob(blob, suggestedName);
    return;
  }

  let rows: Record<string, unknown>[];
  switch (category) {
    case 'tariffs':
      rows = (data as TariffData[]).map(tariffToRow);
      break;
    case 'configs':
      rows = (data as TimeConfig[]).map(configToRow);
      break;
    case 'results':
      rows = (data as ComprehensiveResult[]).map(resultToRow);
      break;
    case 'personas':
      rows = (data as LoadPersona[]).map(personaToRow);
      break;
  }

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '数据');

    const headers = Object.keys(rows[0] ?? {});
    ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length * 2, 12) }));

    const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    const blob = new Blob([xlsxData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    downloadBlob(blob, suggestedName);
  } else {
    const ws = XLSX.utils.json_to_sheet(rows);
    // BOM 前缀确保 Excel 正确识别 UTF-8 编码
    const csvStr = '\uFEFF' + XLSX.utils.sheet_to_csv(ws);

    if (fileHandle) {
      const writable = await fileHandle.createWritable();
      await writable.write(csvStr);
      await writable.close();
      return;
    }

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, suggestedName);
  }
};
