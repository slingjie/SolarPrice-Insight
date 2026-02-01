import React, { useMemo, useState } from 'react';

import { TariffData } from '../types';

interface PriceDatabaseProps {
  tariffs: TariffData[];
  onUpdateTariffs: (tariffs: TariffData[]) => void;
  onBack: () => void;
}

type GroupMode = 'all' | 'exact' | 'price';

function formatPrice(value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '0.0000';
  return value.toFixed(4);
}

function priceKey(t: TariffData): string {
  const { prices } = t;
  return [
    `tip:${prices.tip}`,
    `peak:${prices.peak}`,
    `flat:${prices.flat}`,
    `valley:${prices.valley}`,
    `deep:${prices.deep ?? ''}`,
  ].join('|');
}

function exactKey(t: TariffData): string {
  return [t.province, t.month, t.category, t.voltage_level, priceKey(t)].join('|');
}

export function PriceDatabase({ tariffs, onUpdateTariffs, onBack }: PriceDatabaseProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<GroupMode>('all');
  const [pendingDelete, setPendingDelete] = useState<TariffData | null>(null);

  const visibleTariffs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tariffs;
    return tariffs.filter((t) => {
      const hay = [t.province, t.city ?? '', t.category, t.voltage_level, t.month]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, tariffs]);

  const grouped = useMemo(() => {
    if (mode === 'all') return null;

    const map = new Map<string, TariffData[]>();
    for (const t of visibleTariffs) {
      const key = mode === 'exact' ? exactKey(t) : priceKey(t);
      const list = map.get(key);
      if (list) list.push(t);
      else map.set(key, [t]);
    }

    const groups = Array.from(map.entries())
      .map(([key, items]) => ({ key, items }))
      .filter((g) => g.items.length > 1);

    // Keep output deterministic for tests.
    groups.sort((a, b) => a.key.localeCompare(b.key));
    return groups;
  }, [mode, visibleTariffs]);

  function requestDelete(t: TariffData) {
    setPendingDelete(t);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    onUpdateTariffs(tariffs.filter((t) => t.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function cancelDelete() {
    setPendingDelete(null);
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={onBack}>
          返回
        </button>

        <input
          placeholder="搜索省份、分类..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={mode} onChange={(e) => setMode(e.target.value as GroupMode)}>
          <option value="all">全部</option>
          <option value="exact">完全重复</option>
          <option value="price">价格重复</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>省份</th>
            <th>月份</th>
            <th>用电分类</th>
            <th>电压等级</th>
            <th>尖峰电价</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mode === 'all' &&
            visibleTariffs.map((t) => (
              <tr key={t.id}>
                <td>{t.province}</td>
                <td>{t.month}</td>
                <td>{t.category}</td>
                <td>{t.voltage_level}</td>
                <td>{formatPrice(t.prices.tip)}</td>
                <td>
                  <button type="button" title="删除" onClick={() => requestDelete(t)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}

          {mode !== 'all' &&
            (grouped ?? []).map((g) => {
              const title =
                mode === 'exact'
                  ? `${g.items[0].province} - ${g.items[0].month} - ${g.items[0].category} - ${g.items[0].voltage_level}`
                  : `尖峰:${formatPrice(g.items[0].prices.tip)} / 高峰:${formatPrice(g.items[0].prices.peak)} / 平段:${formatPrice(g.items[0].prices.flat)} / 低谷:${formatPrice(g.items[0].prices.valley)}${
                      g.items[0].prices.deep !== undefined ? ` / 深谷:${formatPrice(g.items[0].prices.deep)}` : ''
                    }`;

              return (
                <React.Fragment key={g.key}>
                  <tr>
                    <td colSpan={6}>{title}</td>
                  </tr>
                  {g.items.map((t) => (
                    <tr key={t.id}>
                      <td>{t.province}</td>
                      <td>{t.month}</td>
                      <td>{t.category}</td>
                      <td>{t.voltage_level}</td>
                      <td>{formatPrice(t.prices.tip)}</td>
                      <td>
                        <button type="button" title="删除" onClick={() => requestDelete(t)}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>

      {pendingDelete && (
        <div role="dialog" aria-modal="true">
          <h2>删除确认</h2>
          <p>确定要删除这条记录吗？此操作无法撤销。</p>
          <div>
            <button type="button" onClick={confirmDelete}>
              确认删除
            </button>
            <button type="button" onClick={cancelDelete}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceDatabase;
