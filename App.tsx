
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TimeConfigView } from './components/TimeConfig';
import { SmartUpload } from './components/SmartUpload';
import { ManualEntry } from './components/ManualEntry';
import { ComprehensivePriceCalculator } from './components/ComprehensivePriceCalculator';

import { SelfConsumption } from './components/SelfConsumption';
import { AnalysisView } from './components/Analysis';
import { PVGISModule } from './components/pvgis/PVGISModule';
import { AdminModule } from './components/admin/AdminModule';
import { SettingsView } from './components/Settings';
import { AppView, HourlyData, LoadPersona, PVGISParams, TariffData, TimeConfig } from './types';
import { DEFAULT_PERSONAS, DEFAULT_TIME_CONFIGS } from './constants.tsx';
import { getDatabase } from './services/db';
import { initDefaultHolidays } from './services/holidayService';

import { LandingPage } from './components/LandingPage';

const App: React.FC = () => {
  // Check URL parameters for initial view
  const searchParams = new URLSearchParams(window.location.search);
  const initialView = searchParams.get('view') === 'admin' ? 'admin' : 'home';

  const [view, setView] = useState<AppView>(initialView as AppView);
  const [tariffs, setTariffs] = useState<TariffData[]>([]);
  const [timeConfigs, setTimeConfigs] = useState<TimeConfig[]>(DEFAULT_TIME_CONFIGS);
  const [analysisTarget, setAnalysisTarget] = useState<{ province: string, category: string, voltage: string } | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [dashboardViewMode, setDashboardViewMode] = useState<'map' | 'list'>('map');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  const [selfConsumptionSeed, setSelfConsumptionSeed] = useState<{
    pvParams: PVGISParams;
    hourly: HourlyData[];
  } | null>(null);

  const [personas, setPersonas] = useState<LoadPersona[]>([]);

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
          const parsed = (JSON.parse(savedTariffs) as TariffData[]).map(t => ({
            ...t,
            last_modified: t.last_modified || new Date().toISOString()
          }));
          await db.tariffs.bulkInsert(parsed);
        }

        const existingConfigCount = await db.time_configs.count().exec();
        if (existingConfigCount === 0) {
          const savedConfigs = localStorage.getItem('solar_time_configs_v2');
          let parsed: TimeConfig[] = [];

          if (savedConfigs) {
            try {
              parsed = JSON.parse(savedConfigs);
            } catch (e) {
              console.error('Failed to parse saved configs', e);
            }
          }

          if (parsed && parsed.length > 0) {
            const docsToInsert = parsed.map(c => ({
              ...c,
              last_modified: c.last_modified || new Date().toISOString()
            }));
            await db.time_configs.bulkInsert(docsToInsert);
          } else {
            // 如果存储中没有数据或解析为空，加载默认配置
            await db.time_configs.bulkInsert(DEFAULT_TIME_CONFIGS);
          }
        }

        // 初始化默认节假日
        const existingHolidayCount = await db.holidays.count().exec();
        if (existingHolidayCount === 0) {
          console.log('[App] Initializing default holidays');
          await initDefaultHolidays();
        }

        const existingPersonaCount = await db.personas.count().exec();
        if (existingPersonaCount === 0) {
          console.log('[App] Initializing default load personas');
          await db.personas.bulkInsert(DEFAULT_PERSONAS);
        }

        // 2. 建立响应式订阅
        const tariffSub = db.tariffs.find().$.subscribe(docs => {
          setTariffs(docs.map(doc => doc.toJSON()));
        });

        const configSub = db.time_configs.find().$.subscribe(docs => {
          setTimeConfigs(docs.map(doc => doc.toJSON()));
        });

        const personaSub = db.personas.find().$.subscribe(docs => {
          setPersonas(docs.map(doc => doc.toJSON()));
        });

        setInitialized(true);

        return () => {
          tariffSub.unsubscribe();
          configSub.unsubscribe();
          personaSub.unsubscribe();
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
    try {
      const db = await getDatabase();
      // 全量替换：删除不在新列表里的记录，再 upsert 新列表
      const existingIds = new Set(newTariffs.map(t => t.id));
      const allDocs = await db.tariffs.find().exec();
      const toDelete = allDocs.filter(doc => !existingIds.has(doc.id));
      if (toDelete.length > 0) {
        await db.tariffs.bulkRemove(toDelete.map(d => d.id));
      }
      console.log('[App] Upserting tariffs:', newTariffs);
      const docsToUpsert = newTariffs.map(t => ({
        ...t,
        last_modified: t.last_modified || new Date().toISOString()
      }));
      await db.tariffs.bulkUpsert(docsToUpsert);
      console.log('[App] Tariffs upsert success');
    } catch (err) {
      console.error('[App] Tariffs update failed:', err);
      throw err;
    }
  };

  // 合并导入：只 upsert，不删除现有记录（用于文件导入场景）
  const handleMergeTariffs = async (importedTariffs: TariffData[]) => {
    try {
      const db = await getDatabase();
      console.log('[App] Merging tariffs (upsert only):', importedTariffs.length, 'items');
      const docsToUpsert = importedTariffs.map(t => ({
        ...t,
        last_modified: t.last_modified || new Date().toISOString()
      }));
      await db.tariffs.bulkUpsert(docsToUpsert);
      console.log('[App] Tariffs merge success');
    } catch (err) {
      console.error('[App] Tariffs merge failed:', err);
      throw err;
    }
  };

  const handleUpdateTimeConfigs = async (newConfigs: TimeConfig[]) => {
    try {
      const db = await getDatabase();
      // 全量替换：删除不在新列表里的记录，再 upsert 新列表
      const existingDocs = await db.time_configs.find().exec();
      const existingIds = new Set(existingDocs.map(d => d.id));
      const newIds = new Set(newConfigs.map(c => c.id));

      const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
      if (idsToDelete.length > 0) {
        console.log('[App] Removing time configs:', idsToDelete);
        await db.time_configs.bulkRemove(idsToDelete);
      }

      const docsToUpsert = newConfigs.map(c => ({
        ...c,
        last_modified: c.last_modified || new Date().toISOString()
      }));
      console.log('[App] Upserting time configs:', docsToUpsert);
      await db.time_configs.bulkUpsert(docsToUpsert);

      console.log('[App] Update success');
    } catch (err) {
      console.error('[App] Update failed:', err);
      throw err;
    }
  };

  // 合并导入：只 upsert，不删除现有记录（用于文件导入场景）
  const handleMergeTimeConfigs = async (importedConfigs: TimeConfig[]) => {
    try {
      const db = await getDatabase();
      console.log('[App] Merging time configs (upsert only):', importedConfigs.length, 'items');
      const docsToUpsert = importedConfigs.map(c => ({
        ...c,
        last_modified: c.last_modified || new Date().toISOString()
      }));
      await db.time_configs.bulkUpsert(docsToUpsert);
      console.log('[App] Time configs merge success');
    } catch (err) {
      console.error('[App] Time configs merge failed:', err);
      throw err;
    }
  };

  const handleUpdatePersonas = async (nextPersonas: LoadPersona[]) => {
    try {
      const db = await getDatabase();
      const existingDocs = await db.personas.find().exec();
      const existingIds = new Set(existingDocs.map(d => d.id));
      const newIds = new Set(nextPersonas.map(p => p.id));

      const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
      if (idsToDelete.length > 0) {
        await db.personas.bulkRemove(idsToDelete);
      }

      const now = new Date().toISOString();
      await db.personas.bulkUpsert(nextPersonas.map(p => ({
        ...p,
        updated_at: p.updated_at || now,
        last_modified: p.last_modified || now,
        _deleted: p._deleted ?? false,
      })));
    } catch (err) {
      console.error('[App] Personas update failed:', err);
      throw err;
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

  if (view === 'home') {
    return <LandingPage onNavigate={setView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {view !== 'pvgis' && view !== 'admin' && view !== 'self-consumption' && (
        <Sidebar currentView={view} onNavigate={setView} />
      )}

      <main className={`flex-1 ${view !== 'pvgis' && view !== 'admin' && view !== 'self-consumption' ? 'ml-20 lg:ml-64' : ''} p-4 lg:p-8 overflow-y-auto min-h-screen`}>
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
          {view === 'admin' && (
            <AdminModule
              tariffs={tariffs}
              timeConfigs={timeConfigs}
              onUpdateTariffs={handleUpdateTariffs}
              onUpdateTimeConfigs={handleUpdateTimeConfigs}
              onMergeTariffs={handleMergeTariffs}
              onMergeTimeConfigs={handleMergeTimeConfigs}
              onBack={() => {
                if (window.opener) {
                  window.close();
                } else {
                  setView('home');
                }
              }}
            />
          )}
           {view === 'calculator' && (
             <ComprehensivePriceCalculator tariffs={tariffs} onNavigate={setView} />
           )}
          {view === 'pvgis' && (
            <PVGISModule
              onBack={() => setView('home')}
              onOpenSelfConsumption={(seed) => {
                setSelfConsumptionSeed(seed);
                setView('self-consumption');
              }}
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
            {view === 'self-consumption' && (
              <div className="-m-4 lg:-m-8">
                <SelfConsumption 
                  timeConfigs={timeConfigs} 
                  tariffs={tariffs}
                  initialPvParams={selfConsumptionSeed?.pvParams}
                  initialPvHourlyData={selfConsumptionSeed?.hourly}
                  onBack={() => setView('home')} 
                />
              </div>
            )}
          {view === 'settings' && (
            <SettingsView
              tariffs={tariffs}
              timeConfigs={timeConfigs}
              personas={personas}
              onImportTariffs={handleUpdateTariffs}
              onImportConfigs={handleUpdateTimeConfigs}
              onImportPersonas={handleUpdatePersonas}
              onNavigate={setView}
            />
          )}
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
