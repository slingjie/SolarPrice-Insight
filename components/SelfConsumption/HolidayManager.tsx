import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { useHolidays } from '../../hooks/useDatabase';
import { saveHoliday, deleteHoliday } from '../../services/holidayService';
import { HolidayDefinition } from '../../types';

interface HolidayManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HolidayFormData {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
}

export function HolidayManager({ isOpen, onClose }: HolidayManagerProps) {
  const { holidays, loading } = useHolidays();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HolidayFormData>({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateDate = (date: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(date)) return false;
    
    const [month, day] = date.split('-').map(Number);
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day > daysInMonth[month - 1]) return false;

    return true;
  };

  const checkForWarnings = (start: string, end: string) => {
    if (start === '02-29' || end === '02-29') {
      return '包含闰日 02-29，该日期仅在闰年存在。';
    }
    return null;
  };

  const resetForm = () => {
    setFormData({ name: '', startDate: '', endDate: '' });
    setEditingId(null);
    setError(null);
    setWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setWarning(null);

    if (!formData.name.trim()) {
      setError('请输入节假日名称');
      return;
    }

    if (!validateDate(formData.startDate)) {
      setError('开始日期格式不正确 (MM-DD) 或日期无效');
      return;
    }

    if (!validateDate(formData.endDate)) {
      setError('结束日期格式不正确 (MM-DD) 或日期无效');
      return;
    }

    const warn = checkForWarnings(formData.startDate, formData.endDate);
    if (warn) {
      setWarning(warn);
    }

    try {
      const id = editingId || crypto.randomUUID();
      const holiday: HolidayDefinition = {
        id,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isDefault: false,
        updated_at: new Date().toISOString()
      };

      await saveHoliday(holiday);
      resetForm();
    } catch (err) {
      console.error('Failed to save holiday:', err);
      setError('保存失败，请重试');
    }
  };

  const handleEdit = (holiday: HolidayDefinition) => {
    setFormData({
      id: holiday.id,
      name: holiday.name,
      startDate: holiday.startDate,
      endDate: holiday.endDate
    });
    setEditingId(holiday.id);
    setError(null);
    setWarning(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHoliday(id);
      setDeleteConfirmation(null);
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Failed to delete holiday:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">节假日管理</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? '编辑节假日' : '添加新节假日'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例如: 春节"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">开始 (MM-DD)</label>
                      <input
                        type="text"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData({ ...formData, startDate: e.target.value });
                          if (e.target.value === '02-29') setWarning('注意: 02-29 是闰日');
                          else setWarning(null);
                        }}
                        placeholder="01-01"
                        maxLength={5}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">结束 (MM-DD)</label>
                      <input
                        type="text"
                        value={formData.endDate}
                        onChange={(e) => {
                          setFormData({ ...formData, endDate: e.target.value });
                          if (e.target.value === '02-29') setWarning('注意: 02-29 是闰日');
                          else setWarning(null);
                        }}
                        placeholder="01-03"
                        maxLength={5}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {warning && (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                      {warning}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        取消
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                    >
                      {editingId ? '保存修改' : '添加'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="text-xs text-gray-500 p-2">
                <p>提示：日期格式为 MM-DD (月-日)，例如 01-01 表示1月1日。</p>
                <p className="mt-1">年份将根据分析时段自动匹配。</p>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col h-full min-h-[400px]">
              <div className="flex-1 border rounded-lg overflow-hidden bg-white flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名称
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          日期范围
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                            加载中...
                          </td>
                        </tr>
                      ) : holidays.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                            暂无节假日数据，请添加
                          </td>
                        </tr>
                      ) : (
                        holidays.map((holiday) => (
                          <tr key={holiday.id} className="hover:bg-gray-50 group transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {holiday.name}
                              {holiday.isDefault && (
                                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">默认</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {holiday.startDate} ~ {holiday.endDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(holiday)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="编辑"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmation(holiday.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {deleteConfirmation && (
          <div className="absolute inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除?</h3>
              <p className="text-gray-500 text-sm mb-6">
                确定要删除这个节假日吗？此操作无法撤销。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
