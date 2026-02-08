import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Copy, Trash2, Save } from 'lucide-react';
import type { LoadPersona } from '../../types';
import { deletePersona, savePersona } from '../../services/personaService';

interface PersonaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  personas: LoadPersona[];
  loading: boolean;
  selectedPersonaId: string;
  onSelectPersonaId: (id: string) => void;
}

function normalizeShares24(raw: number[]): number[] {
  if (raw.length !== 24) return new Array(24).fill(1 / 24);
  let sum = 0;
  for (const v of raw) {
    if (Number.isFinite(v) && v > 0) sum += v;
  }
  if (sum <= 0) return new Array(24).fill(1 / 24);
  return raw.map((v) => (Number.isFinite(v) && v > 0 ? v / sum : 0));
}

function parseSharesText(text: string): { ok: true; value: number[] } | { ok: false; error: string } {
  const tokens = String(text)
    .trim()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length !== 24) {
    return { ok: false, error: `需要 24 个数值，目前是 ${tokens.length} 个。` };
  }

  const values = tokens.map((t) => Number(t));
  if (values.some((v) => !Number.isFinite(v))) {
    return { ok: false, error: '包含非数字。请用逗号/空格/换行分隔 24 个数值。' };
  }

  if (values.some((v) => v < 0)) {
    return { ok: false, error: '包含负数。占比必须 >= 0。' };
  }

  return { ok: true, value: values };
}

function sharesToText(shares: number[]): string {
  return shares.map((v) => (Number.isFinite(v) ? v.toFixed(6) : '0')).join('\n');
}

export function PersonaManager(props: PersonaManagerProps) {
  const { isOpen, onClose, personas, loading, selectedPersonaId, onSelectPersonaId } = props;
  const [activeId, setActiveId] = useState<string>(selectedPersonaId);
  const activePersona = useMemo(() => personas.find((p) => p.id === activeId) ?? null, [personas, activeId]);

  const [name, setName] = useState('');
  const [weekdayText, setWeekdayText] = useState('');
  const [weekendEnabled, setWeekendEnabled] = useState(false);
  const [weekendText, setWeekendText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setActiveId(selectedPersonaId);
  }, [isOpen, selectedPersonaId]);

  useEffect(() => {
    if (!activePersona) return;
    setError(null);
    setName(activePersona.name);
    setWeekdayText(sharesToText(activePersona.weekday_shares));
    const hasWeekend = Array.isArray(activePersona.weekend_shares) && activePersona.weekend_shares.length === 24;
    setWeekendEnabled(hasWeekend);
    setWeekendText(hasWeekend ? sharesToText(activePersona.weekend_shares as number[]) : '');
  }, [activePersona]);

  if (!isOpen) return null;

  const createNewPersona = async (base?: LoadPersona) => {
    setError(null);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const weekday = base?.weekday_shares ?? new Array(24).fill(1 / 24);
    const weekend = base?.weekend_shares;
    const persona: LoadPersona = {
      id,
      slug: `custom_${id.slice(0, 8)}`,
      name: base ? `${base.name} 副本` : '自定义画像',
      weekday_shares: weekday,
      ...(weekend && weekend.length === 24 ? { weekend_shares: weekend } : {}),
      isDefault: false,
      updated_at: now,
      last_modified: now,
      _deleted: false,
    };
    try {
      await savePersona(persona);
      setActiveId(id);
      onSelectPersonaId(id);
    } catch (e) {
      console.error('[PersonaManager] create failed:', e);
      setError('创建画像失败，请重试。');
    }
  };

  const handleNormalize = (target: 'weekday' | 'weekend') => {
    setError(null);
    const text = target === 'weekday' ? weekdayText : weekendText;
    const parsed = parseSharesText(text);
    if (parsed.ok === false) {
      setError(`${target === 'weekday' ? '工作日' : '周末'}占比：${parsed.error}`);
      return;
    }
    const normalized = normalizeShares24(parsed.value);
    if (target === 'weekday') setWeekdayText(sharesToText(normalized));
    else setWeekendText(sharesToText(normalized));
  };

  const handleSave = async () => {
    if (!activePersona) return;
    setError(null);

    const parsedWeekday = parseSharesText(weekdayText);
    if (parsedWeekday.ok === false) {
      setError(`工作日占比：${parsedWeekday.error}`);
      return;
    }
    const weekdayShares = normalizeShares24(parsedWeekday.value);

    let weekendShares: number[] | undefined;
    if (weekendEnabled) {
      const parsedWeekend = parseSharesText(weekendText);
      if (parsedWeekend.ok === false) {
        setError(`周末占比：${parsedWeekend.error}`);
        return;
      }
      weekendShares = normalizeShares24(parsedWeekend.value);
    }

    const now = new Date().toISOString();
    const next: LoadPersona = {
      ...activePersona,
      name: name.trim() || activePersona.name,
      weekday_shares: weekdayShares,
      ...(weekendEnabled && weekendShares ? { weekend_shares: weekendShares } : {}),
      ...(weekendEnabled ? {} : { weekend_shares: undefined }),
      updated_at: now,
      last_modified: now,
    };

    setIsSaving(true);
    try {
      await savePersona(next);
    } catch (e) {
      console.error('[PersonaManager] save failed:', e);
      setError('保存失败，请重试。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activePersona) return;
    if (activePersona.isDefault) return;
    const ok = window.confirm(`确定删除画像“${activePersona.name}”吗？此操作不可撤销。`);
    if (!ok) return;
    try {
      await deletePersona(activePersona.id);
      const nextId = personas.find((p) => p.id !== activePersona.id)?.id ?? '';
      setActiveId(nextId);
      onSelectPersonaId(nextId);
    } catch (e) {
      console.error('[PersonaManager] delete failed:', e);
      setError('删除失败，请重试。');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-800">行业画像库</div>
            <div className="text-xs text-gray-500">24 点负荷占比（和为 1）</div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700">画像列表</div>
                <button
                  onClick={() => createNewPersona()}
                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 新建
                </button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="max-h-[60vh] overflow-auto">
                  {loading ? (
                    <div className="p-4 text-xs text-gray-400">加载中...</div>
                  ) : personas.length === 0 ? (
                    <div className="p-4 text-xs text-gray-400">暂无画像</div>
                  ) : (
                    <div className="divide-y">
                      {personas.map((p) => {
                        const isActive = p.id === activeId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveId(p.id);
                              onSelectPersonaId(p.id);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                                <div className="text-[11px] text-gray-400 font-mono truncate">{p.slug}</div>
                              </div>
                              {p.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">默认</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {!activePersona ? (
                <div className="text-sm text-gray-500">请选择一个画像进行编辑</div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">编辑：{activePersona.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{activePersona.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => createNewPersona(activePersona)}
                        className="px-3 py-2 text-xs rounded-md border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" /> 复制
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={activePersona.isDefault}
                        className={`px-3 py-2 text-xs rounded-md border flex items-center gap-1 ${activePersona.isDefault
                          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                          : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">名称</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Slug（只读）</label>
                      <input
                        value={activePersona.slug}
                        readOnly
                        className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600">工作日 24 点占比（24 行）</label>
                        <button
                          onClick={() => handleNormalize('weekday')}
                          className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-4"
                        >
                          归一化
                        </button>
                      </div>
                      <textarea
                        value={weekdayText}
                        onChange={(e) => setWeekdayText(e.target.value)}
                        rows={10}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs font-mono"
                        placeholder="每行一个数值，共 24 行（支持空格/逗号分隔）"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={weekendEnabled}
                            onChange={(e) => setWeekendEnabled(e.target.checked)}
                            className="rounded border-gray-300 w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                          />
                          启用周末覆盖
                        </label>
                        <button
                          onClick={() => handleNormalize('weekend')}
                          disabled={!weekendEnabled}
                          className={`text-xs underline underline-offset-4 ${weekendEnabled ? 'text-blue-600 hover:text-blue-700' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          归一化
                        </button>
                      </div>
                      <textarea
                        value={weekendText}
                        onChange={(e) => setWeekendText(e.target.value)}
                        rows={10}
                        disabled={!weekendEnabled}
                        className={`w-full rounded-md shadow-sm text-xs font-mono ${weekendEnabled
                          ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-200 bg-gray-50 text-gray-400'
                          }`}
                        placeholder="每行一个数值，共 24 行"
                      />
                      {!weekendEnabled && (
                        <div className="text-[11px] text-gray-400">未启用时：周末沿用工作日曲线</div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 ${isSaving
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      <Save className="w-4 h-4" /> 保存
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
