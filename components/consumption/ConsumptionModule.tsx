import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Calculator, Upload, Settings, BarChart3, AlertCircle } from 'lucide-react';
import LoadDataUpload from './LoadDataUpload';
import { LoadProfileConfigComponent } from './LoadProfileConfig';
import ConsumptionAnalysis from './ConsumptionAnalysis';
import {
  ParsedLoadData,
  LoadProfileConfig,
  DEFAULT_LOAD_PROFILE_CONFIG,
  ConsumptionSummary,
  HourlyData,
  HourlyLoadData,
} from '../../types';
import { generateHourlyLoadFromMonthly } from '../../services/loadDataService';
import { calculateConsumption } from '../../services/consumptionCalcService';

interface ConsumptionModuleProps {
  pvHourlyData?: HourlyData[];
  onBack?: () => void;
}

type Step = 'upload' | 'config' | 'analysis';

export const ConsumptionModule: React.FC<ConsumptionModuleProps> = ({
  pvHourlyData,
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [loadData, setLoadData] = useState<ParsedLoadData | null>(null);
  const [profileConfig, setProfileConfig] = useState<LoadProfileConfig>(DEFAULT_LOAD_PROFILE_CONFIG);
  const [analysisResult, setAnalysisResult] = useState<ConsumptionSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const averageDailyConsumption = useMemo(() => {
    if (!loadData) return 100;
    return loadData.totalAnnual / 365;
  }, [loadData]);

  const handleDataParsed = useCallback((data: ParsedLoadData) => {
    setLoadData(data);
    setError(null);
    if (data.format === 'hourly') {
      setCurrentStep('analysis');
    } else {
      setCurrentStep('config');
    }
  }, []);

  const handleRunAnalysis = useCallback(() => {
    if (!loadData) {
      setError('请先上传用电数据');
      return;
    }

    if (!pvHourlyData || pvHourlyData.length === 0) {
      setError('请先在"发电量计算"页面获取光伏发电数据');
      return;
    }

    try {
      let hourlyLoadData: HourlyLoadData[];

      if (loadData.format === 'monthly' && loadData.monthly) {
        hourlyLoadData = generateHourlyLoadFromMonthly(loadData.monthly, profileConfig);
      } else if (loadData.hourly) {
        hourlyLoadData = loadData.hourly;
      } else {
        throw new Error('无效的用电数据格式');
      }

      const result = calculateConsumption(pvHourlyData, hourlyLoadData);
      setAnalysisResult(result);
      setCurrentStep('analysis');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算失败');
    }
  }, [loadData, pvHourlyData, profileConfig]);

  const handleReset = useCallback(() => {
    setLoadData(null);
    setAnalysisResult(null);
    setCurrentStep('upload');
    setError(null);
  }, []);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[
        { step: 'upload' as Step, label: '上传数据', icon: Upload },
        { step: 'config' as Step, label: '曲线配置', icon: Settings },
        { step: 'analysis' as Step, label: '分析结果', icon: BarChart3 },
      ].map(({ step, label, icon: Icon }, index) => (
        <React.Fragment key={step}>
          {index > 0 && (
            <div className={`w-12 h-0.5 ${
              (currentStep === 'config' && index <= 1) ||
              (currentStep === 'analysis' && index <= 2)
                ? 'bg-blue-500'
                : 'bg-slate-200'
            }`} />
          )}
          <button
            onClick={() => {
              if (step === 'upload') setCurrentStep('upload');
              else if (step === 'config' && loadData?.format === 'monthly') setCurrentStep('config');
              else if (step === 'analysis' && analysisResult) setCurrentStep('analysis');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentStep === step
                ? 'bg-blue-500 text-white shadow-md'
                : (step === 'config' && loadData?.format !== 'monthly')
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            disabled={step === 'config' && loadData?.format !== 'monthly'}
          >
            <Icon size={16} />
            {label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Calculator className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">消纳分析</h1>
                <p className="text-xs text-slate-500">自发自用 · 余电上网</p>
              </div>
            </div>
          </div>

          {loadData && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              重新上传
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {renderStepIndicator()}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              {!pvHourlyData && (
                <p className="text-xs text-red-600 mt-1">
                  提示：请先前往"发电量计算"页面，输入位置信息并计算发电量后，再返回此页面进行消纳分析。
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 'upload' && (
          <LoadDataUpload
            onDataParsed={handleDataParsed}
            onError={(err) => setError(err)}
          />
        )}

        {currentStep === 'config' && loadData?.format === 'monthly' && (
          <div className="space-y-6">
            <LoadProfileConfigComponent
              config={profileConfig}
              onChange={setProfileConfig}
              averageDailyConsumption={averageDailyConsumption}
            />

            <div className="flex justify-center">
              <button
                onClick={handleRunAnalysis}
                disabled={!pvHourlyData}
                className={`px-8 py-3 rounded-xl font-medium text-white shadow-lg transition-all ${
                  pvHourlyData
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calculator size={18} />
                  运行消纳分析
                </span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'analysis' && analysisResult && (
          <ConsumptionAnalysis summary={analysisResult} />
        )}

        {currentStep === 'analysis' && !analysisResult && loadData?.format === 'hourly' && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">已检测到逐时用电数据，点击开始分析</p>
            <button
              onClick={handleRunAnalysis}
              disabled={!pvHourlyData}
              className={`px-8 py-3 rounded-xl font-medium text-white shadow-lg transition-all ${
                pvHourlyData
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator size={18} />
                运行消纳分析
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumptionModule;
