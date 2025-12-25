
import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { PeriodPrice } from '../types';
import { Card, Toast } from './UI';
import { getDatabase } from '../services/db';
import { DEFAULT_USER_ID } from '../constants';

interface PeriodPriceEntry {
  period_start: string;
  period_end: string;
  price: number;
}

export const PeriodPriceConfig: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [periods, setPeriods] = useState<PeriodPriceEntry[]>([]);
  const [newPeriod, setNewPeriod] = useState<PeriodPriceEntry>({
    period_start: '00:00',
    period_end: '08:00',
    price: 0
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load periods for selected date
  useEffect(() => {
    loadPeriods();
  }, [selectedDate]);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();
      const docs = await db.period_prices
        .find({
          selector: {
            date: selectedDate,
            user_id: DEFAULT_USER_ID
          },
          sort: [{ period_start: 'asc' }]
        })
        .exec();

      const loadedPeriods = docs.map(doc => ({
        period_start: doc.period_start,
        period_end: doc.period_end,
        price: doc.price
      }));

      setPeriods(loadedPeriods);
      console.log('[PeriodPriceConfig] Loaded periods:', loadedPeriods);
    } catch (err) {
      console.error('[PeriodPriceConfig] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateTimeOverlap = (newStart: string, newEnd: string, excludeIndex?: number): boolean => {
    // Convert time string to minutes for easier comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStartMin = timeToMinutes(newStart);
    let newEndMin = timeToMinutes(newEnd);
    
    // Handle end time at midnight (00:00 represents end of day)
    if (newEndMin === 0) {
      newEndMin = 24 * 60;
    }
    
    // Check if start is before end
    if (newStartMin >= newEndMin) {
      setValidationError('开始时间必须早于结束时间');
      return false;
    }

    // Check overlap with existing periods
    for (let i = 0; i < periods.length; i++) {
      if (excludeIndex !== undefined && i === excludeIndex) {
        continue; // Skip the period being edited
      }

      const existingStartMin = timeToMinutes(periods[i].period_start);
      let existingEndMin = timeToMinutes(periods[i].period_end);
      
      if (existingEndMin === 0) {
        existingEndMin = 24 * 60;
      }

      // Check for overlap
      const hasOverlap = (
        (newStartMin >= existingStartMin && newStartMin < existingEndMin) ||
        (newEndMin > existingStartMin && newEndMin <= existingEndMin) ||
        (newStartMin <= existingStartMin && newEndMin >= existingEndMin)
      );

      if (hasOverlap) {
        setValidationError(`时段与 ${periods[i].period_start} - ${periods[i].period_end} 存在重叠`);
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleAddPeriod = () => {
    if (!newPeriod.period_start || !newPeriod.period_end) {
      setValidationError('请选择时段');
      return;
    }

    if (!validateTimeOverlap(newPeriod.period_start, newPeriod.period_end)) {
      return;
    }

    const updatedPeriods = [...periods, newPeriod].sort((a, b) => 
      a.period_start.localeCompare(b.period_start)
    );
    
    setPeriods(updatedPeriods);
    setNewPeriod({ period_start: '00:00', period_end: '08:00', price: 0 });
    setValidationError('');
  };

  const handleDeletePeriod = (index: number) => {
    const updated = [...periods];
    updated.splice(index, 1);
    setPeriods(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const db = await getDatabase();

      // Delete existing periods for this date
      const existingDocs = await db.period_prices
        .find({
          selector: {
            date: selectedDate,
            user_id: DEFAULT_USER_ID
          }
        })
        .exec();

      if (existingDocs.length > 0) {
        await db.period_prices.bulkRemove(existingDocs.map(d => d.id));
      }

      // Insert new periods
      const newPeriodPrices: PeriodPrice[] = periods.map(p => ({
        id: crypto.randomUUID(),
        user_id: DEFAULT_USER_ID,
        date: selectedDate,
        period_start: p.period_start,
        period_end: p.period_end,
        price: p.price,
        created_at: new Date().toISOString()
      }));

      if (newPeriodPrices.length > 0) {
        await db.period_prices.bulkInsert(newPeriodPrices);
      }

      setToastMessage('保存成功！');
      setShowToast(true);
      console.log('[PeriodPriceConfig] Saved periods:', newPeriodPrices);
    } catch (err) {
      console.error('[PeriodPriceConfig] Save error:', err);
      setToastMessage('保存失败');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (index: number, value: string) => {
    const updated = [...periods];
    updated[index].price = parseFloat(value) || 0;
    setPeriods(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600" /> 时段电价配置
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            配置不同时段的电价，支持多时段设置
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} /> 保存配置
        </button>
      </div>

      <Card className="p-6">
        <div className="mb-6">
          <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
            <Calendar size={16} className="text-blue-500" /> 选择日期
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full max-w-xs p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 shadow-inner">
          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Plus size={16} className="text-blue-500" /> 添加时段
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full sm:flex-1">
              <label className="text-[10px] text-slate-400 mb-1 block">开始时间</label>
              <input
                type="time"
                value={newPeriod.period_start}
                onChange={e => setNewPeriod({ ...newPeriod, period_start: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="w-full sm:flex-1">
              <label className="text-[10px] text-slate-400 mb-1 block">结束时间</label>
              <input
                type="time"
                value={newPeriod.period_end}
                onChange={e => setNewPeriod({ ...newPeriod, period_end: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded bg-white"
              />
            </div>
            <div className="w-full sm:flex-1">
              <label className="text-[10px] text-slate-400 mb-1 block">电价 (元/kWh)</label>
              <input
                type="number"
                step="0.001"
                value={newPeriod.price}
                onChange={e => setNewPeriod({ ...newPeriod, price: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-slate-300 rounded bg-white"
                placeholder="0.000"
              />
            </div>
            <button
              onClick={handleAddPeriod}
              className="w-full sm:w-auto bg-slate-800 text-white p-2.5 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          {validationError && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <AlertCircle size={16} />
              {validationError}
            </div>
          )}
        </div>

        <div className="space-y-2 pb-6 overflow-y-auto max-h-[400px] custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-slate-400">加载中...</div>
          ) : periods.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center">
              <Clock size={40} className="mb-2 opacity-20" />
              暂无时段配置，请在上方添加
            </div>
          ) : (
            periods.map((period, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all animate-in slide-in-from-top-2"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-1.5 h-12 rounded-full bg-blue-500" />
                  <div className="font-mono font-bold text-base text-slate-700">
                    {period.period_start}
                    <span className="text-slate-300 mx-2">→</span>
                    {period.period_end}
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <input
                      type="number"
                      step="0.001"
                      value={period.price}
                      onChange={e => handlePriceChange(idx, e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded bg-white text-sm"
                      placeholder="电价"
                    />
                  </div>
                  <div className="text-sm text-slate-500">元/kWh</div>
                </div>
                <button
                  onClick={() => handleDeletePeriod(idx)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-4"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
};
