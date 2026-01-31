/**
 * 导出逐时数据为 CSV 文件 - 极致稳健兼容版 (V2.3)
 * 
 * 浏览器调试确认：代码执行正常，但 a.click() 被浏览器静默拦截
 * 解决方案：
 * 1. 以剪贴板为主要数据传递方式
 * 2. 使用 alert() 确保通知可见
 * 3. 保留下载尝试作为备选
 */
export const exportHourlyDataToCSV = (data: any[], filename: string = 'solar_data.csv') => {
    console.group('%c [Export V2.3] 剪贴板优先 + 下载备选 ', 'background: #7c3aed; color: white; padding: 2px 4px; border-radius: 4px;');

    if (!data || data.length === 0) {
        alert('暂无数据可导出');
        console.groupEnd();
        return;
    }

    try {
        // 构建 CSV
        const headers = '时间,发电功率(W),辐照度(W/m2)\r\n';
        const rows = data.map(item => {
            const t = (item.time || '').replace('T', ' ').substring(0, 16);
            return `"${t}",${(item.pvPower || 0).toFixed(2)},${(item.poaIrradiance || 0).toFixed(2)}`;
        }).join('\r\n');

        const csvContent = '\uFEFF' + headers + rows;

        // === 主方案: 剪贴板 ===
        let clipboardSuccess = false;
        try {
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(csvContent);
                clipboardSuccess = true;
            } else {
                const ta = document.createElement('textarea');
                ta.value = csvContent;
                ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                clipboardSuccess = true;
            }
            console.log('剪贴板写入成功');
        } catch (e) {
            console.warn('剪贴板写入失败:', e);
        }

        // === 备选方案: 标准下载 ===
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);

        console.log('尝试触发下载:', filename);
        a.click();

        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);

        // === 用户通知 (使用 alert 确保可见) ===
        if (clipboardSuccess) {
            // 延迟显示，避免与下载冲突
            setTimeout(() => {
                alert('数据已复制到剪贴板！\n\n请打开 Excel，选中单元格后按 Cmd+V 粘贴即可。\n\n（如果文件已自动下载，可忽略此提示）');
            }, 100);
        }

    } catch (err) {
        console.error('导出失败:', err);
        alert('导出失败: ' + (err as Error).message);
    } finally {
        console.groupEnd();
    }
};

/**
 * 导出消纳分析逐时明细为 CSV（8760 行）
 * 
 * 按 timeKey 关联 alignedHourly 和 financialHourly 数组
 * CSV 表头：时间,月,日,时,日类型,时段,负荷(kWh),发电(kWh),自用(kWh),上网(kWh),购网(kWh),单价(元/kWh),购电费用(元),上网收益(元)
 */
import type { HourlyAlignedRow } from '../services/consumptionAlignedService';
import type { HourlyFinancialRow } from '../services/consumptionFinancials';

export const exportSelfConsumptionHourlyCSV = (
  alignedHourly: HourlyAlignedRow[],
  financialHourly: HourlyFinancialRow[],
  filename: string = 'consumption_hourly.csv'
) => {
  console.group('%c [Export SelfConsumption Hourly] 8760行明细导出 ', 'background: #7c3aed; color: white; padding: 2px 4px; border-radius: 4px;');

  if (!alignedHourly || alignedHourly.length === 0) {
    alert('暂无对齐数据可导出');
    console.groupEnd();
    return;
  }

  try {
    // 构建财务数据 Map (timeKey -> HourlyFinancialRow)
    const financialByKey = new Map<string, HourlyFinancialRow>();
    for (const fin of financialHourly) {
      financialByKey.set(fin.timeKey, fin);
    }

    // 构建 CSV
    const headers = '时间,月,日,时,日类型,时段,负荷(kWh),发电(kWh),自用(kWh),上网(kWh),购网(kWh),单价(元/kWh),购电费用(元),上网收益(元)\r\n';
    
    const rows = alignedHourly.map(aligned => {
      // 获取财务数据
      const financial = financialByKey.get(aligned.timeKey);
      
      // 日类型映射
      const dayTypeLabel = aligned.dayType === 'workday' ? '工作日' : '休息日';
      
      // 格式化时间 "MM-DD HH:00"
      const timeStr = `${String(aligned.month).padStart(2, '0')}-${String(aligned.day).padStart(2, '0')} ${String(aligned.hour).padStart(2, '0')}:00`;
      
      // 时段（直接输出 touType）
      const touType = aligned.touType;
      
      // 数值字段保留 2 位小数
      const loadKwh = aligned.loadKwh.toFixed(2);
      const pvKwh = aligned.pvKwh.toFixed(2);
      const selfKwh = aligned.selfKwh.toFixed(2);
      const gridExportKwh = aligned.gridExportKwh.toFixed(2);
      const gridImportKwh = aligned.gridImportKwh.toFixed(2);
      
      // 财务数据（如果存在）
      const unitPrice = financial ? financial.unitPrice.toFixed(2) : '0.00';
      const importCost = financial ? financial.importCost.toFixed(2) : '0.00';
      const exportRevenue = financial ? financial.exportRevenue.toFixed(2) : '0.00';
      
      return `${timeStr},${aligned.month},${aligned.day},${aligned.hour},${dayTypeLabel},${touType},${loadKwh},${pvKwh},${selfKwh},${gridExportKwh},${gridImportKwh},${unitPrice},${importCost},${exportRevenue}`;
    }).join('\r\n');

    const csvContent = '\uFEFF' + headers + rows;

    // === 主方案: 剪贴板 ===
    let clipboardSuccess = false;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(csvContent);
        clipboardSuccess = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = csvContent;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        clipboardSuccess = true;
      }
      console.log('剪贴板写入成功');
    } catch (e) {
      console.warn('剪贴板写入失败:', e);
    }

    // === 备选方案: 标准下载 ===
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);

    console.log('尝试触发下载:', filename);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    // === 用户通知 (使用 alert 确保可见) ===
    if (clipboardSuccess) {
      // 延迟显示，避免与下载冲突
      setTimeout(() => {
        alert('消纳分析数据已复制到剪贴板！\n\n请打开 Excel，选中单元格后按 Cmd+V 粘贴即可。\n\n（如果文件已自动下载，可忽略此提示）');
      }, 100);
    }

  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败: ' + (err as Error).message);
  } finally {
    console.groupEnd();
  }
};

/**
 * 导出消纳分析月度汇总为 CSV（12 行 + 表头）
 * 
 * CSV 表头：月份,发电量(kWh),负荷(kWh),自用电量(kWh),上网电量(kWh),购网电量(kWh),原始电费(元),光伏后电费(元),上网收益(元),净节省(元)
 * 
 * 按月份 1-12 遍历，关联 alignedMonthly 和 financialByMonth 数组/Map
 * 财务字段对应关系：
 *   - 原始电费 = baselineGridCost
 *   - 光伏后电费 = importCost
 *   - 上网收益 = exportRevenue
 *   - 净节省 = savingsVsNoPv
 */
import type { MonthlyAlignedAggregate } from '../services/consumptionAlignedService';
import type { FinancialTotals } from '../services/consumptionFinancials';

export const exportSelfConsumptionMonthlyCSV = (
  alignedMonthly: MonthlyAlignedAggregate[],
  financialByMonth: Record<number, FinancialTotals>,
  filename: string = 'consumption_monthly.csv'
) => {
  console.group('%c [Export SelfConsumption Monthly] 月度汇总导出 ', 'background: #7c3aed; color: white; padding: 2px 4px; border-radius: 4px;');

  if (!alignedMonthly || alignedMonthly.length === 0) {
    alert('暂无月度对齐数据可导出');
    console.groupEnd();
    return;
  }

  try {
    // 构建月度对齐数据 Map (month -> MonthlyAlignedAggregate)
    const alignedByMonth = new Map<number, MonthlyAlignedAggregate>();
    for (const aligned of alignedMonthly) {
      alignedByMonth.set(aligned.month, aligned);
    }

    // 构建 CSV
    const headers = '月份,发电量(kWh),负荷(kWh),自用电量(kWh),上网电量(kWh),购网电量(kWh),原始电费(元),光伏后电费(元),上网收益(元),净节省(元)\r\n';
    
    const rows = [];
    for (let month = 1; month <= 12; month++) {
      const aligned = alignedByMonth.get(month);
      const financial = financialByMonth[month];
      
      // 如果某月数据缺失，填充 0.00
      const pvGeneration = aligned ? aligned.pvGeneration.toFixed(2) : '0.00';
      const estimatedLoad = aligned ? aligned.estimatedLoad.toFixed(2) : '0.00';
      const selfConsumption = aligned ? aligned.selfConsumption.toFixed(2) : '0.00';
      const gridExport = aligned ? aligned.gridExport.toFixed(2) : '0.00';
      const gridImport = aligned ? aligned.gridImport.toFixed(2) : '0.00';
      
      // 财务数据（如果存在）
      const baselineGridCost = financial ? financial.baselineGridCost.toFixed(2) : '0.00';
      const importCost = financial ? financial.importCost.toFixed(2) : '0.00';
      const exportRevenue = financial ? financial.exportRevenue.toFixed(2) : '0.00';
      const savingsVsNoPv = financial ? financial.savingsVsNoPv.toFixed(2) : '0.00';
      
      rows.push(`${month},${pvGeneration},${estimatedLoad},${selfConsumption},${gridExport},${gridImport},${baselineGridCost},${importCost},${exportRevenue},${savingsVsNoPv}`);
    }

    const csvContent = '\uFEFF' + headers + rows.join('\r\n');

    // === 主方案: 剪贴板 ===
    let clipboardSuccess = false;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(csvContent);
        clipboardSuccess = true;
      } else {
        const ta = document.createElement('textarea');
        ta.value = csvContent;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        clipboardSuccess = true;
      }
      console.log('剪贴板写入成功');
    } catch (e) {
      console.warn('剪贴板写入失败:', e);
    }

    // === 备选方案: 标准下载 ===
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);

    console.log('尝试触发下载:', filename);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

    // === 用户通知 (使用 alert 确保可见) ===
    if (clipboardSuccess) {
      // 延迟显示，避免与下载冲突
      setTimeout(() => {
        alert('消纳分析月度数据已复制到剪贴板！\n\n请打开 Excel，选中单元格后按 Cmd+V 粘贴即可。\n\n（如果文件已自动下载，可忽略此提示）');
      }, 100);
    }

  } catch (err) {
    console.error('导出失败:', err);
    alert('导出失败: ' + (err as Error).message);
  } finally {
    console.groupEnd();
  }
};
