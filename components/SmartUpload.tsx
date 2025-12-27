
import React, { useState, useRef } from 'react';
import { Zap, FileText, CheckCircle2, Settings, Save, ArrowLeft, Loader2, Sparkles, Files, ChevronRight, Check, Trash2, PlusCircle } from 'lucide-react';
import { recognizeTariffImages, ImageSource } from '../services/geminiService';
import { OCRResultItem, TimeConfig, TariffData } from '../types';
import { Card, Badge, LoadingSpinner } from './UI';

interface SmartUploadProps {
  timeConfigs: TimeConfig[];
  tariffs: TariffData[];
  onBatchSave: (newTariffs: TariffData[]) => void;
  onNavigate: (view: any) => void;
}

// 定义每一页的识别批次
interface RecognitionBatch {
  imageIndex: number;
  results: OCRResultItem[];
}

export const SmartUpload: React.FC<SmartUploadProps> = ({ timeConfigs, tariffs, onBatchSave, onNavigate }) => {
  // 步骤：'upload' -> 'analyzing' -> 'review'
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review'>('upload');

  // 识别出的所有批次（每张图片一个批次）
  const [batches, setBatches] = useState<RecognitionBatch[]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // 用于收集所有确认后的电价数据
  const [confirmedTariffs, setConfirmedTariffs] = useState<TariffData[]>([]);

  // 当前复核页的状态
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');
  const [targetMonth, setTargetMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedOcrIds, setSelectedOcrIds] = useState<Set<string>>(new Set());

  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = (file: File): Promise<ImageSource> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setStep('analyzing');
    setError(null);
    setProcessingStatus({ current: 0, total: files.length });

    try {
      const allBatches: RecognitionBatch[] = [];

      // 逐张处理，以确保我们可以分开进行多次确认
      for (let i = 0; i < files.length; i++) {
        setProcessingStatus({ current: i + 1, total: files.length });
        const src = await readFileAsBase64(files[i]);

        // 调用 AI 识别单张图片
        const results = await recognizeTariffImages([src]);
        allBatches.push({
          imageIndex: i,
          results
        });
      }

      setBatches(allBatches);
      setCurrentBatchIndex(0);

      // 初始化第一批次的选中状态
      if (allBatches.length > 0) {
        setSelectedOcrIds(new Set(allBatches[0].results.map(r => r.id)));
      }

      setStep('review');
    } catch (err: any) {
      setError(err.message || '识别失败，请检查 API Key');
      setStep('upload');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedOcrIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedOcrIds(newSet);
  };

  const updateOcrItem = (id: string, field: string, value: any) => {
    const newBatches = [...batches];
    const batch = newBatches[currentBatchIndex];
    const itemIndex = batch.results.findIndex(r => r.id === id);
    if (itemIndex === -1) return;

    if (field.includes('.')) {
      const [p1, p2] = field.split('.');
      batch.results[itemIndex] = {
        ...batch.results[itemIndex],
        [p1]: {
          ...(batch.results[itemIndex] as any)[p1],
          [p2]: parseFloat(value) || 0
        }
      };
    } else {
      batch.results[itemIndex] = {
        ...batch.results[itemIndex],
        [field]: value
      };
    }
    setBatches(newBatches);
  };

  const deleteOcrItem = (id: string) => {
    const newBatches = [...batches];
    const batch = newBatches[currentBatchIndex];
    batch.results = batch.results.filter(r => r.id !== id);
    setBatches(newBatches);

    const newSet = new Set(selectedOcrIds);
    newSet.delete(id);
    setSelectedOcrIds(newSet);
  };

  const addOcrItem = () => {
    const newId = crypto.randomUUID();
    const newItem: OCRResultItem = {
      id: newId,
      category: '新增类型',
      voltage: '10kV',
      prices: { tip: 0, peak: 0, flat: 0, valley: 0, deep: 0 }
    };

    const newBatches = [...batches];
    newBatches[currentBatchIndex].results.push(newItem);
    setBatches(newBatches);

    const newSet = new Set(selectedOcrIds);
    newSet.add(newId);
    setSelectedOcrIds(newSet);
  };

  const handleNextBatch = () => {
    if (!selectedConfigId || selectedOcrIds.size === 0) return;

    const config = timeConfigs.find(c => c.id === selectedConfigId);
    if (!config) return;

    // 将当前批次选中的内容转化为 TariffData 并存入临时数组
    const currentResults = batches[currentBatchIndex].results;
    const newEntries: TariffData[] = currentResults
      .filter(item => selectedOcrIds.has(item.id))
      .map(item => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        province: config.province,
        city: null,
        month: targetMonth,
        category: item.category,
        voltage_level: item.voltage,
        prices: item.prices,
        time_rules: config.time_rules,
        currency_unit: 'CNY/kWh',
        source_config_id: config.id,
        last_modified: new Date().toISOString()
      }));

    const updatedConfirmed = [...confirmedTariffs, ...newEntries];

    if (currentBatchIndex < batches.length - 1) {
      // 还有下一张图片，移动到下一批次
      setConfirmedTariffs(updatedConfirmed);
      const nextIndex = currentBatchIndex + 1;
      setCurrentBatchIndex(nextIndex);
      setSelectedOcrIds(new Set(batches[nextIndex].results.map(r => r.id)));
      // 重置部分状态以便用户重新选择（或者保留之前的配置，这里建议保留省份和月份以加速录入）
    } else {
      // 全部处理完毕，提交保存
      onBatchSave([...updatedConfirmed, ...tariffs]);
    }
  };

  const currentBatch = batches[currentBatchIndex];

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col animate-in slide-in-from-bottom-6 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-yellow-500 fill-current" size={24} /> 智能 AI 识别录入
        </h2>
        {step === 'review' && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">确认进度</span>
            <div className="flex gap-1">
              {batches.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full ${idx <= currentBatchIndex ? 'bg-blue-600' : 'bg-blue-200'}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-blue-800 ml-1">{currentBatchIndex + 1} / {batches.length}</span>
          </div>
        )}
      </div>

      {step === 'upload' && (
        <Card className="flex-1 border-dashed border-2 border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group min-h-[400px]">
          {error && <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
          <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform shadow-inner">
              <Files size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">上传电价表图片</h3>
            <p className="text-slate-500 mb-8 max-w-sm text-center">您可以一次上传多张图片，识别完成后，我们将引导您逐页进行复核确认，确保数据准确入库。</p>
            <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-blue-200">
              开始上传 (支持多张图片)
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
        </Card>
      )}

      {step === 'analyzing' && (
        <Card className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner />
          <h3 className="text-xl font-bold text-slate-800 mt-6">AI 正在深度解析...</h3>
          <p className="text-slate-500 mt-2 font-medium">正在处理第 {processingStatus.current} / {processingStatus.total} 张图片</p>
          <div className="w-64 bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500"
              style={{ width: `${(processingStatus.current / processingStatus.total) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {step === 'review' && currentBatch && (
        <div className="flex flex-col lg:flex-row gap-6 h-full pb-10 animate-in fade-in slide-in-from-right-4">
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <Card className="p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings size={18} className="text-blue-600" /> 第一步：关联配置
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">选择该页所属时段配置</label>
                  <select
                    className="w-full p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedConfigId}
                    onChange={(e) => setSelectedConfigId(e.target.value)}
                  >
                    <option value="">-- 请选择配置库 --</option>
                    {timeConfigs.map(c => (
                      <option key={c.id} value={c.id}>{c.province} - {c.month_pattern === 'All' ? '全年' : c.month_pattern + '月'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">价格执行月份</label>
                  <input
                    type="month"
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3 items-start shadow-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-blue-600" />
              <div>
                <p className="font-bold mb-1">当前页面已选 {selectedOcrIds.size} 条电价</p>
                <p className="opacity-80 text-xs">请核对右侧价格明细。点击下方按钮后，我们将进入下一张图片的确认。</p>
              </div>
            </div>

            <div className="flex-1 min-h-[20px]"></div>

            <button
              onClick={handleNextBatch}
              disabled={!selectedConfigId || selectedOcrIds.size === 0}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
                  ${(!selectedConfigId || selectedOcrIds.size === 0) ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 shadow-blue-100'}
                `}
            >
              {currentBatchIndex < batches.length - 1 ? (
                <>确认并处理下一张 <ChevronRight size={20} /></>
              ) : (
                <>完成所有识别并入库 <Check size={20} /></>
              )}
            </button>
          </div>

          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" /> 第二步：勾选该页识别结果
              </h3>
              <div className="text-xs text-slate-500">
                第 <span className="font-bold text-slate-900">{currentBatchIndex + 1}</span> 张，共识别出 <span className="font-bold text-slate-900">{currentBatch.results.length}</span> 项
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
              {currentBatch.results.map(item => {
                const isSelected = selectedOcrIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between group
                        ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-blue-300'}
                      `}
                  >
                    <div className="flex items-center gap-4 mb-3 lg:mb-0">
                      <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500 text-white shadow-sm' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <Check size={16} />}
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                        <input
                          className="font-bold text-slate-800 text-base bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 w-full"
                          value={item.category}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateOcrItem(item.id, 'category', e.target.value)}
                        />
                        <input
                          className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border-none focus:ring-1 focus:ring-blue-400 w-full"
                          value={item.voltage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateOcrItem(item.id, 'voltage', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] text-right">
                      {[
                        { label: '尖峰', key: 'prices.tip', color: 'text-red-500', val: item.prices.tip },
                        { label: '高峰', key: 'prices.peak', color: 'text-orange-500', val: item.prices.peak },
                        { label: '平段', key: 'prices.flat', color: 'text-green-600', val: item.prices.flat },
                        { label: '低谷', key: 'prices.valley', color: 'text-blue-500', val: item.prices.valley },
                        { label: '深谷', key: 'prices.deep', color: 'text-indigo-500', val: item.prices.deep || 0 },
                      ].map((p) => (
                        <div key={p.key}>
                          <div className="text-slate-400 mb-0.5">{p.label}</div>
                          <input
                            type="number"
                            step="0.0001"
                            value={p.val}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateOcrItem(item.id, p.key, e.target.value)}
                            className={`font-bold ${p.color} text-sm bg-transparent border-none focus:ring-1 focus:ring-blue-400 w-16 text-right rounded p-0`}
                          />
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOcrItem(item.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all self-center ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addOcrItem}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <PlusCircle size={20} /> 手动添加识别项
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
