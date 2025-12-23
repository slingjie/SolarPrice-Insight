
import React, { useState, useMemo, useEffect } from 'react';
import { Library, Plus, Save, Trash2, Clock, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { TimeConfig, TimeRule, TimeType } from '../types';
import { PROVINCES, getTypeColor, getTypeLabel } from '../constants.tsx';
import { Card, Badge, Toast } from './UI';

interface TimeConfigProps {
  configs: TimeConfig[];
  onSave: (configs: TimeConfig[]) => void;
}

export const TimeConfigView: React.FC<TimeConfigProps> = ({ configs, onSave }) => {
  const [editingConfig, setEditingConfig] = useState<Partial<TimeConfig>>({
    province: '',
    month_pattern: 'All',
    time_rules: []
  });
  const [newRule, setNewRule] = useState<TimeRule>({ start: '00:00', end: '08:00', type: 'valley' });
  const [showToast, setShowToast] = useState(false);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);

  const groupedConfigs = useMemo(() => {
    const groups: Record<string, TimeConfig[]> = {};
    configs.forEach(c => {
      if (!groups[c.province]) groups[c.province] = [];
      groups[c.province].push(c);
    });
    return groups;
  }, [configs]);

  const handleAddRule = () => {
    if (!newRule.start || !newRule.end) return;
    const updated = [...(editingConfig.time_rules || []), newRule].sort((a, b) => a.start.localeCompare(b.start));
    setEditingConfig(prev => ({ ...prev, time_rules: updated }));
  };

  const handleSaveConfig = () => {
    if (!editingConfig.province || (editingConfig.time_rules?.length || 0) === 0) return;

    // 生成一个干净的配置对象
    const configId = editingConfig.id || crypto.randomUUID();
    const newConfig: TimeConfig = {
      id: configId,
      province: editingConfig.province!.trim(),
      month_pattern: editingConfig.month_pattern || 'All',
      time_rules: editingConfig.time_rules!,
      updated_at: new Date().toISOString()
    };

    // 立即过滤掉可能存在的同名旧配置（如果用户是想全量覆盖或新增）
    // 注意：这里我们遵循 App.tsx 的逻辑，将整个列表传递过去进行 bulkUpsert
    const updatedList = editingConfig.id
      ? configs.map(c => c.id === configId ? newConfig : c)
      : [...configs, newConfig];

    onSave(updatedList);

    // 显示自定义 Toast 提示
    setShowToast(true);

    // 自动展开当前省份并选中（如果之前是新建）
    setExpandedProvince(newConfig.province);
    setEditingConfig(newConfig);
  };

  const handleDeleteConfig = (id: string) => {
    if (window.confirm("确定删除该配置？此操作无法撤销。")) {
      onSave(configs.filter(c => c.id !== id));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] gap-6 animate-in slide-in-from-right-4 duration-500">
      {/* Left: List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-hidden">
        <h2 className="text-xl font-bold flex items-center gap-2"><Library className="text-blue-600" /> 时段配置库</h2>
        <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
          <button
            onClick={() => {
              setEditingConfig({ province: '', month_pattern: 'All', time_rules: [] });
              // 自动折叠所有
              setExpandedProvince(null);
            }}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} /> 新建配置
          </button>

          {Object.keys(groupedConfigs).length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">暂无配置，请新建</div>
          )}

          {Object.entries(groupedConfigs).map(([province, items]) => (
            <div key={province} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedProvince(expandedProvince === province ? null : province)}
                className={`w-full p-4 flex items-center justify-between transition-colors ${expandedProvince === province ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              >
                <div className="font-bold text-slate-800">{province}</div>
                {expandedProvince === province ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>

              {expandedProvince === province && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {items.map(config => (
                    <div
                      key={config.id}
                      onClick={() => setEditingConfig(config)}
                      className={`p-3 pl-6 border-l-4 cursor-pointer transition-all hover:bg-white flex justify-between items-center group relative ${editingConfig.id === config.id ? 'border-l-blue-600 bg-blue-50' : 'border-l-transparent'}`}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700">
                            {config.month_pattern === 'All' ? '全年' : `${config.month_pattern}月`}
                          </span>
                          <div className="flex gap-0.5">
                            {config.time_rules.slice(0, 3).map((r, i) => (
                              <div key={i} className="w-2 h-2 rounded-full" style={{ background: getTypeColor(r.type) }} />
                            ))}
                            {config.time_rules.length > 3 && <div className="w-2 h-2 rounded-full bg-slate-300" />}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteConfig(config.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && <div className="p-3 text-center text-xs text-slate-400">无配置</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-hidden">
        <Card className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="font-bold text-lg text-slate-800">
              {editingConfig.id ? '编辑配置' : '创建新时段规则'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveConfig}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-all"
              >
                <Save size={18} /> 保存到库
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">省份</label>
              <input
                list="provinces-list"
                value={editingConfig.province || ''}
                onChange={e => setEditingConfig({ ...editingConfig, province: e.target.value })}
                placeholder="选择或输入省份"
                className="w-full p-2 border rounded-lg bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="provinces-list">
                {PROVINCES.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">适用月份 (Pattern)</label>
              <input
                type="text"
                value={editingConfig.month_pattern}
                onChange={e => setEditingConfig({ ...editingConfig, month_pattern: e.target.value })}
                placeholder="例如: 1,2,12 或 All"
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 shadow-inner">
              <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock size={16} className="text-blue-500" /> 添加时段</div>
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full sm:flex-1">
                  <label className="text-[10px] text-slate-400 mb-1 block">开始</label>
                  <input type="time" value={newRule.start} onChange={e => setNewRule({ ...newRule, start: e.target.value })} className="w-full p-2 border rounded bg-white" />
                </div>
                <div className="w-full sm:flex-1">
                  <label className="text-[10px] text-slate-400 mb-1 block">结束</label>
                  <input type="time" value={newRule.end} onChange={e => setNewRule({ ...newRule, end: e.target.value })} className="w-full p-2 border rounded bg-white" />
                </div>
                <div className="w-full sm:flex-[2]">
                  <label className="text-[10px] text-slate-400 mb-1 block">类型</label>
                  <div className="flex gap-1 flex-wrap">
                    {['tip', 'peak', 'flat', 'valley', 'deep'].map(t => (
                      <button
                        key={t}
                        onClick={() => setNewRule({ ...newRule, type: t as TimeType })}
                        style={{
                          background: newRule.type === t ? getTypeColor(t) : '#fff',
                          color: newRule.type === t ? '#fff' : '#64748b',
                          borderColor: getTypeColor(t)
                        }}
                        className={`flex-1 min-w-[50px] py-2 rounded border text-[10px] transition-all ${newRule.type === t ? 'font-bold shadow-sm scale-105' : 'hover:bg-slate-50'}`}
                      >
                        {getTypeLabel(t)}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAddRule} className="w-full sm:w-auto bg-slate-800 text-white p-2.5 rounded-lg hover:bg-slate-700 transition-colors"><Plus size={20} /></button>
              </div>
            </div>

            <div className="space-y-2 pb-6">
              {editingConfig.time_rules?.map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-all animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-8 rounded-full" style={{ background: getTypeColor(rule.type) }} />
                    <div className="font-mono font-bold text-base text-slate-700">{rule.start} <span className="text-slate-300 mx-2">→</span> {rule.end}</div>
                    <Badge type={rule.type} />
                  </div>
                  <button
                    onClick={() => {
                      const updated = [...editingConfig.time_rules!];
                      updated.splice(idx, 1);
                      setEditingConfig({ ...editingConfig, time_rules: updated });
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(editingConfig.time_rules?.length || 0) === 0 && (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                  <Clock size={40} className="mb-2 opacity-20" />
                  暂无分时规则，请在上方添加
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      {showToast && <Toast message="保存到库成功！" onClose={() => setShowToast(false)} />}
    </div>
  );
};
