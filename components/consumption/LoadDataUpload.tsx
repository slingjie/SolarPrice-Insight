import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Check, X } from 'lucide-react';
import { parseExcelFile } from '../../services/loadDataService';
import { ParsedLoadData, MonthlyLoadData, HourlyLoadData } from '../../types';

interface LoadDataUploadProps {
  onDataParsed: (data: ParsedLoadData) => void;
  onError?: (error: string) => void;
}

type UploadStatus = 'idle' | 'parsing' | 'success' | 'error';

const LoadDataUpload: React.FC<LoadDataUploadProps> = ({ onDataParsed, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [previewData, setPreviewData] = useState<ParsedLoadData | null>(null);

  const processFile = useCallback(async (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      const msg = '请上传 Excel 文件 (.xlsx 或 .xls)';
      setStatus('error');
      setErrorMsg(msg);
      onError?.(msg);
      return;
    }

    setStatus('parsing');
    setFileName(file.name);
    setErrorMsg('');

    try {
      const result = await parseExcelFile(file);
      setPreviewData(result);
      setStatus('success');
      onDataParsed(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '解析文件时发生错误';
      setStatus('error');
      setErrorMsg(msg);
      onError?.(msg);
      setPreviewData(null);
    }
  }, [onDataParsed, onError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    e.target.value = '';
  }, [processFile]);

  const handleClear = useCallback(() => {
    setStatus('idle');
    setFileName('');
    setErrorMsg('');
    setPreviewData(null);
  }, []);

  const renderPreviewTable = () => {
    if (!previewData) return null;

    if (previewData.format === 'monthly' && previewData.monthly) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">月份</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">用电量 (kWh)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {previewData.monthly.slice(0, 10).map((row: MonthlyLoadData) => (
                <tr key={row.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.month}月</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.consumption.toLocaleString()}</td>
                </tr>
              ))}
              {previewData.monthly.length > 10 && (
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-center text-xs text-slate-400">
                    ... 共 {previewData.monthly.length} 条记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    } else if (previewData.format === 'hourly' && previewData.hourly) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">时间</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">负荷 (kW)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {previewData.hourly.slice(0, 10).map((row: HourlyLoadData, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{row.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{row.load.toLocaleString()}</td>
                </tr>
              ))}
              {previewData.hourly.length > 10 && (
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-center text-xs text-slate-400">
                    ... 共 {previewData.hourly.length} 条记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          上传用电数据
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          支持 Excel 文件 (.xlsx, .xls)。系统将自动识别月度数据或 8760 逐时数据。
        </p>
      </div>

      <div className="p-6">
        {status === 'idle' || status === 'error' ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
              transition-colors duration-200
              ${isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
              ${status === 'error' ? 'border-red-300 bg-red-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
            
            <div className="flex flex-col items-center justify-center gap-3">
              <div className={`p-3 rounded-full ${status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {status === 'error' ? <AlertCircle className="w-8 h-8" /> : <FileSpreadsheet className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-base font-medium text-slate-900">
                  点击或拖拽文件到此处
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  支持 .xlsx 或 .xls 格式
                </p>
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-600 mt-2 font-medium bg-white px-3 py-1 rounded-full border border-red-200">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {(status === 'parsing' || status === 'success') && (
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  {status === 'success' ? <Check className="w-6 h-6" /> : <Upload className="w-6 h-6 animate-bounce" />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{fileName}</h4>
                  <p className="text-sm text-slate-500">
                    {status === 'parsing' ? '正在解析数据...' : '解析成功'}
                  </p>
                </div>
              </div>
              
              {status === 'success' && (
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                  title="清除数据"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {status === 'success' && previewData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-500 block mb-1">数据格式</span>
                    <span className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      {previewData.format === 'monthly' ? '月度汇总数据' : '8760 逐时数据'}
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-500 block mb-1">年度总用电量</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {previewData.totalAnnual.toLocaleString()} <span className="text-sm font-normal text-slate-500">kWh</span>
                    </span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    数据预览 (前10条)
                  </div>
                  {renderPreviewTable()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadDataUpload;
