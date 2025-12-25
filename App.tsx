
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TimeConfigView } from './components/TimeConfig';
import { SmartUpload } from './components/SmartUpload';
import { ManualEntry } from './components/ManualEntry';
import { AnalysisView } from './components/Analysis';
import { SettingsView } from './components/Settings';
import { AppView, TariffData, TimeConfig } from './types';
import { DEFAULT_TIME_CONFIGS } from './constants.tsx';
import { getDatabase } from './services/db';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [tariffs, setTariffs] = useState<TariffData[]>([]);
  const [timeConfigs, setTimeConfigs] = useState<TimeConfig[]>(DEFAULT_TIME_CONFIGS);
  const [analysisTarget, setAnalysisTarget] = useState<{ province: string, category: string, voltage: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<'map' | 'list'>('map');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  // 初始化数据库并建立订阅
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDatabase();

        // 1. 数据迁移逻辑：如果 LocalStorage 有数据且 RxDB 是空的，则迁移
        const savedTariffs = localStorage.getItem('solar_tariffs_v2');
        const savedConfigs = localStorage.getItem('solar_time_configs_v2');

        const existingTariffCount = await db.tariffs.count().exec();
        if (existingTariffCount === 0 && savedTariffs) {
          const parsed = JSON.parse(savedTariffs) as TariffData[];
          await db.tariffs.bulkInsert(parsed);
        }

        const existingConfigCount = await db.time_configs.count().exec();
        if (existingConfigCount === 0 && savedConfigs) {
          const parsed = JSON.parse(savedConfigs) as TimeConfig[];
          await db.time_configs.bulkInsert(parsed);
        } else if (existingConfigCount === 0) {
          await db.time_configs.bulkInsert(DEFAULT_TIME_CONFIGS);
        }

        // 2. 建立响应式订阅
        const tariffSub = db.tariffs.find().$.subscribe(docs => {
          setTariffs(docs.map(doc => doc.toJSON()));
        });

        const configSub = db.time_configs.find().$.subscribe(docs => {
          if (docs.length > 0) setTimeConfigs(docs.map(doc => doc.toJSON()));
        });

        setInitialized(true);

        return () => {
          tariffSub.unsubscribe();
          configSub.unsubscribe();
        };
      } catch (err) {
        console.error('[App] Database initialization failed:', err);
        // 如果失败，至少设置 initialized 以显示主界面（或错误提示）
        setInitialized(true);
      }
    };

    initDB();
  }, []);

  const handleUpdateTariffs = async (newTariffs: TariffData[]) => {
    const db = await getDatabase();
    // 简单起见，这里采取全量替换或批量新增逻辑
    // 在实际复杂场景中，RxDB 建议逐条增量更新
    // 这里为了兼容现有 handleUpdateTariffs 的语义：
    const existingIds = new Set(newTariffs.map(t => t.id));
    // 找出不在新列表里的，删除它们
    const allDocs = await db.tariffs.find().exec();
    const toDelete = allDocs.filter(doc => !existingIds.has(doc.id));
    if (toDelete.length > 0) {
      await db.tariffs.bulkRemove(toDelete.map(d => d.id));
    }
    await db.tariffs.bulkUpsert(newTariffs);
  };

  const handleUpdateTimeConfigs = async (newConfigs: TimeConfig[]) => {
    try {
      const db = await getDatabase();
      console.log('[App] Upserting time configs:', newConfigs);
      await db.time_configs.bulkUpsert(newConfigs);
      console.log('[App] Upsert success');
    } catch (err) {
      console.error('[App] Upsert failed:', err);
    }
  };

  const openAnalysis = (tariff: TariffData) => {
    setAnalysisTarget({
      province: tariff.province,
      category: tariff.category,
      voltage: tariff.voltage_level
    });
    setView('analysis');
  };

  const handleBatchSave = (newTariffs: TariffData[]) => {
    // 批量保存逻辑已在 handleUpdateTariffs 中处理 RxDB upsert
    handleUpdateTariffs(newTariffs);
    setView('dashboard');
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse font-medium">初始化数据库中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar currentView={view} onNavigate={setView} />

      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && (
            <Dashboard
              tariffs={tariffs}
              onOpenAnalysis={openAnalysis}
              onNavigate={setView}
              viewMode={dashboardViewMode}
              onViewModeChange={setDashboardViewMode}
              selectedProvinces={selectedProvinces}
              onSelectedProvincesChange={setSelectedProvinces}
            />
          )}
          {view === 'config' && (
            <TimeConfigView
              configs={timeConfigs}
              onSave={handleUpdateTimeConfigs}
            />
          )}
          {view === 'upload' && (
            <SmartUpload
              timeConfigs={timeConfigs}
              tariffs={tariffs}
              onBatchSave={handleBatchSave}
              onNavigate={setView}
            />
          )}
          {view === 'manual' && (
            <ManualEntry
              timeConfigs={timeConfigs}
              tariffs={tariffs}
              onSave={handleUpdateTariffs}
              onNavigate={setView}
            />
          )}
          {view === 'analysis' && analysisTarget && (
            <AnalysisView
              tariffs={tariffs}
              target={analysisTarget}
              onBack={() => setView('dashboard')}
              onUpdateTariffs={handleUpdateTariffs}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              tariffs={tariffs}
              timeConfigs={timeConfigs}
              onImportTariffs={handleUpdateTariffs}
              onImportConfigs={handleUpdateTimeConfigs}
            />
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
