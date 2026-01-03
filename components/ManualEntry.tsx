
import React, { useState, useMemo, useRef } from 'react';
import { Save, Info, Database, MapPin, Calendar, Layers, Zap, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { read, utils, write } from 'xlsx';
import { TimeConfig, TariffData, PriceSchema, TimeRule, TimeType } from '../types';
import { PROVINCES } from '../constants.tsx';
import { Card } from './UI';

interface ManualEntryProps {
  timeConfigs: TimeConfig[];
  tariffs: TariffData[];
  onSave: (newTariffs: TariffData[]) => void;
  onNavigate: (view: any) => void;
}

export const ManualEntry: React.FC<ManualEntryProps> = ({ timeConfigs, tariffs, onSave, onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    province: PROVINCES[0],
    month: new Date().toISOString().slice(0, 7),
    category: '大工业用电',
    voltage: '1-10kV',
    configId: '',
    prices: {
      tip: 0,
      peak: 0,
      flat: 0,
      valley: 0,
    } as PriceSchema
  });

  const filteredConfigs = useMemo(() => {
    // 仅显示当前选中省份的配置和通用配置（"全部"）
    // 避免显示其他省份的干扰数据
    return timeConfigs.filter(c =>
      c.province === formData.province || c.province === '全部'
    ).sort((a, b) => {
      // 排序优先级：当前省份 > 全部 > 其他(虽然这里被过滤了但保持逻辑完整)
      if (a.province === formData.province && b.province !== formData.province) return -1;
      if (b.province === formData.province && a.province !== formData.province) return 1;
      return 0; // 同类之间保持原序或可加次级排序
    });
  }, [timeConfigs, formData.province]);

  // 自动关联逻辑：当选择省份改变时，尝试找到一个最佳匹配并自动选中
  React.useEffect(() => {
    // 优先匹配当前省份
    let bestMatch = timeConfigs.find(c => c.province === formData.province);
    // 其次匹配通用配置
    if (!bestMatch) {
      bestMatch = timeConfigs.find(c => c.province === '全部');
    }

    if (bestMatch && formData.configId !== bestMatch.id) {
      setFormData(prev => ({ ...prev, configId: bestMatch.id }));
    }
  }, [formData.province, timeConfigs]);

  const handlePriceChange = (type: keyof PriceSchema, val: string) => {
    const numVal = parseFloat(val) || 0;
    setFormData(prev => ({
      ...prev,
      prices: { ...prev.prices, [type]: numVal }
    }));
  };

  const handleSave = () => {
    const config = timeConfigs.find(c => c.id === formData.configId);
    if (!config) {
      alert("请选择关联的时段配置库");
      return;
    }

    const newTariff: TariffData = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      province: formData.province,
      city: null,
      month: formData.month,
      category: formData.category,
      voltage_level: formData.voltage,
      prices: formData.prices,
      time_rules: config.time_rules,
      currency_unit: 'CNY/kWh',
      source_config_id: config.id,
      last_modified: new Date().toISOString()
    };

    onSave([...tariffs, newTariff]);
    onNavigate('dashboard');
  };

  const handleExportTemplate = () => {
    const headers = [
      "省份 (Province)",
      "月份 (Month, YYYY-MM)",
      "用电分类 (Category)",
      "电压等级 (Voltage)",
      "尖峰电价 (Tip Price)",
      "高峰电价 (Peak Price)",
      "平段电价 (Flat Price)",
      "低谷电价 (Valley Price)",
      "深谷电价 (Deep Price)",
      "时段规则 (Time Rules: 00:00-08:00:valley;08:00-12:00:peak...)"
    ];

    const sampleData = [
      [
        "江苏省",
        "2024-01",
        "大工业用电",
        "1-10kV",
        1.15,
        1.05,
        0.65,
        0.32,
        0,
        "00:00-08:00:valley;08:00-12:00:peak;12:00-14:00:flat;14:00-17:00:tip;17:00-21:00:peak;21:00-24:00:valley"
      ]
    ];

    const ws = utils.aoa_to_sheet([headers, ...sampleData]);
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 80 }
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Template");
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });

    // Download logic
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tariff_import_template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = read(arrayBuffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data: any[][] = utils.sheet_to_json(ws, { header: 1 });

      if (data.length < 2) {
        alert("文件内容为空或格式不正确");
        return;
      }

      const newTariffs: TariffData[] = [];
      const errors: string[] = [];

      // Skip header row (index 0)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        // Map columns based on template order
        // 0: Province, 1: Month, 2: Category, 3: Voltage, 4: Tip, 5: Peak, 6: Flat, 7: Valley, 8: Deep, 9: TimeRules
        const [p, m, cat, vol, tip, peak, flat, valley, deep, rulesStr] = row;

        if (!p || !m) {
          errors.push(`第 ${i + 1} 行：省份或月份缺失`);
          continue;
        }

        // Parse prices
        const prices: PriceSchema = {
          tip: parseFloat(tip) || 0,
          peak: parseFloat(peak) || 0,
          flat: parseFloat(flat) || 0,
          valley: parseFloat(valley) || 0,
          deep: parseFloat(deep) || 0,
        };

        // Parse time rules
        const time_rules: TimeRule[] = [];
        if (typeof rulesStr === 'string' && rulesStr.trim()) {
          try {
            const segments = rulesStr.split(';');
            for (const seg of segments) {
              if (!seg.trim()) continue;
              // expected format: "START-END:TYPE"
              // split by last occurrence of delimiter if possible, but simplest is split by ':' if time doesn't contain ':'... wait time is HH:MM
              // improved regex or lastIndexOf
              // standard format: "00:00-08:00:valley"
              const lastColonIndex = seg.lastIndexOf(':');
              if (lastColonIndex === -1) throw new Error("Format error");

              const timeRange = seg.substring(0, lastColonIndex);
              const type = seg.substring(lastColonIndex + 1).trim() as TimeType;

              const [start, end] = timeRange.split('-');
              if (!start || !end || !['tip', 'peak', 'flat', 'valley', 'deep'].includes(type)) {
                throw new Error("Invalid format");
              }
              time_rules.push({ start: start.trim(), end: end.trim(), type });
            }
          } catch {
            errors.push(`第 ${i + 1} 行：时段规则格式错误`);
            continue;
          }
        } else {
          errors.push(`第 ${i + 1} 行：时段规则缺失`);
          continue;
        }

        newTariffs.push({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          province: p,
          city: null,
          month: m,
          category: cat || '未分类',
          voltage_level: vol || '未知',
          prices,
          time_rules,
          currency_unit: 'CNY/kWh',
          last_modified: new Date().toISOString()
          // source_config_id is skipped for imported data as it has its own rules
        });
      }

      if (errors.length > 0) {
        alert(`导入完成，但发现以下错误（已跳过）：\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? '\n...' : ''}`);
      } else {
        alert(`成功导入 ${newTariffs.length} 条数据！`);
      }

      if (newTariffs.length > 0) {
        onSave([...tariffs, ...newTariffs]);
        onNavigate('dashboard');
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      alert("文件解析失败，请检查文件格式");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-6 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          <h2 className="text-2xl font-bold text-slate-900">手动配置电价</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <button
            onClick={handleExportTemplate}
            className="bg-white border text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
            <Download size={16} /> 下载模板
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
            <Upload size={16} /> 批量导入
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm"
          >
            <Save size={16} /> 保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Basic Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Info size={18} className="text-blue-500" /> 基本信息
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                <MapPin size={12} /> 省份
              </label>
              <input
                list="province-options"
                type="text"
                placeholder="选择或输入省份"
                value={formData.province}
                onChange={e => setFormData({ ...formData, province: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <datalist id="province-options">
                {PROVINCES.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
                <Calendar size={12} /> 执行月份
              </label>
              <input
                type="month"
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block flex items-center gap-1">
              <Layers size={12} /> 用电分类
            </label>
            <input
              type="text"
              placeholder="例如：大工业用电、一般工商业"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">电压等级</label>
            <input
              type="text"
              placeholder="例如：1-10kV、35kV"
              value={formData.voltage}
              onChange={e => setFormData({ ...formData, voltage: e.target.value })}
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Section 2: Time Rule Mapping */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <Database size={18} className="text-blue-500" /> 关联时段配置
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed mb-4">
            手动录入需要关联一个已有的“时段配置库”。我们将根据该库定义的尖峰、高峰、平段、低谷时段来生成分时曲线。
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">选择配置库</label>
            <select
              className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.configId}
              onChange={e => setFormData({ ...formData, configId: e.target.value })}
            >
              <option value="">-- 请选择配置库 --</option>
              {filteredConfigs.map(c => {
                const isMatch = c.province === formData.province;
                return (
                  <option key={c.id} value={c.id} className={isMatch ? 'font-bold bg-blue-50' : ''}>
                    {c.province} - {c.month_pattern === 'All' ? '全年' : c.month_pattern + '月'}
                    {isMatch ? ' (推荐)' : ''}
                  </option>
                );
              })}
            </select>
            {filteredConfigs.length === 0 && (
              <p className="text-[10px] text-red-500 mt-2">该省份暂无配置，请前往“配置库管理”创建。</p>
            )}
            {/* 移除不必要的提示，因为现在只显示匹配的 */}
            {false && (
              <p className="text-[10px] text-red-500 mt-2">
                该省份暂无专属配置库，建议选择“全部”或前往“配置库管理”创建。
              </p>
            )}
          </div>
        </Card>

        {/* Section 3: Price Matrix */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Zap size={18} className="text-blue-500" /> 电价配置 (元/kWh)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider">尖峰电价</label>
              <input
                type="number"
                step="0.0001"
                value={formData.prices.tip || ''}
                onChange={e => handlePriceChange('tip', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-red-500 bg-red-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">高峰电价</label>
              <input
                type="number"
                step="0.0001"
                value={formData.prices.peak || ''}
                onChange={e => handlePriceChange('peak', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-orange-500 bg-orange-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-green-600 uppercase tracking-wider">平段电价</label>
              <input
                type="number"
                step="0.0001"
                value={formData.prices.flat || ''}
                onChange={e => handlePriceChange('flat', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-green-500 bg-green-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">低谷电价</label>
              <input
                type="number"
                step="0.0001"
                value={formData.prices.valley || ''}
                onChange={e => handlePriceChange('valley', e.target.value)}
                className="w-full p-3 border-b-2 border-transparent focus:border-blue-500 bg-blue-50/30 text-lg font-mono font-bold outline-none rounded-t-lg transition-all"
                placeholder="0.0000"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
