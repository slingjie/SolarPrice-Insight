
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TimeConfigView } from './components/TimeConfig';
import { ManualEntry } from './components/ManualEntry';
import { ComprehensivePriceCalculator } from './components/ComprehensivePriceCalculator';

import { SelfConsumption } from './components/SelfConsumption';
import { AnalysisView } from './components/Analysis';
import { PVGISModule } from './components/pvgis/PVGISModule';
import { AdminModule } from './components/admin/AdminModule';
import { SettingsView } from './components/Settings';
import { AppEntryMode, AppView, ComprehensiveResult, HourlyData, LoadPersona, PVGISParams, TariffData, TimeConfig } from './types';
import { DEFAULT_PERSONAS, DEFAULT_TIME_CONFIGS } from './constants.tsx';
import { DEFAULT_TARIFFS } from './constants_tariffs';
import { getDatabase } from './services/db';
import { initDefaultHolidays } from './services/holidayService';
import { calculateAveragePrice } from './services/priceCalculator';
import { buildEntryUrl, resolveRuntimeEntryMode, setStoredEntryPreference } from './utils/entryMode';
import {
  buildComprehensivePriceMap,
  pickLatestComprehensiveResultsByProvince,
  resolveEffectiveTimeRules,
} from './utils/pwaTariffResolver';
import { PriceInsightPwaShell } from './components/pwa/PriceInsightPwaShell';
import { SyncStatusBadge } from './components/SyncStatusBadge';
import { getSyncManager } from './services/sync/syncManager';
import { syncOutboxService } from './services/sync/syncOutboxService';
import { getDocModifiedAt } from './services/sync/syncAdapters';
import { SyncState } from './services/sync/types';

import { LandingPage } from './components/LandingPage';

const normalizeTimeConfigForYearModel = (config: Partial<TimeConfig>, fallbackYear: number): TimeConfig => {
  const yearCandidate = Number.parseInt(String(config.year ?? ''), 10);
  const year = Number.isFinite(yearCandidate) ? yearCandidate : fallbackYear;
  const configType = config.config_type === 'special_date' ? 'special_date' : 'monthly';

  return {
    id: config.id || crypto.randomUUID(),
    province: config.province || '全部',
    year,
    config_type: configType,
    month_pattern: typeof config.month_pattern === 'string' && config.month_pattern.trim().length > 0
      ? config.month_pattern
      : 'All',
    special_date: configType === 'special_date' && typeof config.special_date === 'string' ? config.special_date : undefined,
    special_date_end:
      configType === 'special_date' && typeof config.special_date_end === 'string'
        ? config.special_date_end
        : undefined,
    time_rules: Array.isArray(config.time_rules) ? config.time_rules : [],
    updated_at: config.updated_at || new Date().toISOString(),
    last_modified: config.last_modified || new Date().toISOString(),
    _deleted: config._deleted ?? false,
  };
};

const migrateLegacyTimeConfigs = (configs: Partial<TimeConfig>[]): TimeConfig[] => {
  const nowYear = new Date().getFullYear();
  return configs.map((cfg) => normalizeTimeConfigForYearModel(cfg, nowYear));
};

const App: React.FC = () => {
  const [entryMode, setEntryMode] = useState<AppEntryMode>(() => resolveRuntimeEntryMode());
  const [view, setView] = useState<AppView>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('view') === 'admin' ? 'admin' : 'home';
  });
  const [tariffs, setTariffs] = useState<TariffData[]>(DEFAULT_TARIFFS);
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
  const [comprehensiveResults, setComprehensiveResults] = useState<ComprehensiveResult[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    enabled: true,
    status: 'idle',
    pendingCount: 0,
    lastSuccessAt: null,
    lastError: null,
    authenticatedEmail: null,
  });

  useEffect(() => {
    const syncEntryMode = () => setEntryMode(resolveRuntimeEntryMode());
    window.addEventListener('popstate', syncEntryMode);
    return () => {
      window.removeEventListener('popstate', syncEntryMode);
    };
  }, []);

  useEffect(() => {
    const manager = getSyncManager();
    manager.start();
    const unsubscribe = manager.subscribe(setSyncState);
    return () => {
      unsubscribe();
      manager.stop();
    };
  }, []);

  const latestComprehensiveResultsByProvince = useMemo(
    () => pickLatestComprehensiveResultsByProvince(comprehensiveResults),
    [comprehensiveResults],
  );

  const comprehensivePriceMap = useMemo(
    () =>
      buildComprehensivePriceMap({
        tariffs,
        timeConfigs,
        resultsByProvince: latestComprehensiveResultsByProvince,
      }),
    [tariffs, timeConfigs, latestComprehensiveResultsByProvince],
  );

  // 单条 tariff 综合电价计算（供 Dashboard / PWA 调用，默认 08:00 - 16:00 光伏日间发电窗口）
  const calcCompPrice = useMemo(() => {
    return (t: TariffData, startTime: string = '08:00', endTime: string = '16:00'): number | null => {
      try {
        const { rules } = resolveEffectiveTimeRules(t, timeConfigs);
        if (rules.length === 0) return null;
        const normalized = { ...t, time_rules: rules };
        const results = calculateAveragePrice([normalized], [t.month], startTime, endTime);
        return results.length > 0 ? results[0].avgPrice : null;
      } catch { return null; }
    };
  }, [timeConfigs]);

  // 初始化数据库并建立订阅
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDatabase();

        // 1. 数据迁移逻辑：如果 LocalStorage 有数据且 RxDB 是空的，则迁移
        const savedTariffs = localStorage.getItem('solar_tariffs_v2');
        const savedConfigs = localStorage.getItem('solar_time_configs_v2');

        const existingTariffCount = await db.tariffs.count().exec();
        if (existingTariffCount === 0) {
          let loaded = false;
          if (savedTariffs) {
            try {
              const parsed = (JSON.parse(savedTariffs) as TariffData[]).map(t => ({
                ...t,
                last_modified: t.last_modified || new Date().toISOString()
              }));
              if (parsed.length > 0) {
                await db.tariffs.bulkInsert(parsed);
                loaded = true;
              }
            } catch (e) {
              console.warn('[App] Failed to parse saved tariffs:', e);
            }
          }
          if (!loaded) {
            console.log('[App] Seeding DEFAULT_TARIFFS into RxDB...');
            await db.tariffs.bulkInsert(DEFAULT_TARIFFS);
          }
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
            const docsToInsert = migrateLegacyTimeConfigs(parsed).map(c => ({
              ...c,
              last_modified: c.last_modified || new Date().toISOString(),
            }));
            await db.time_configs.bulkInsert(docsToInsert);
          } else {
            // 如果存储中没有数据或解析为空，加载默认配置
            await db.time_configs.bulkInsert(migrateLegacyTimeConfigs(DEFAULT_TIME_CONFIGS));
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

        const comprehensiveResultsSub = db.comprehensive_results.find().$.subscribe(docs => {
          setComprehensiveResults(docs.map(doc => doc.toJSON() as ComprehensiveResult));
        });

        setInitialized(true);

        return () => {
          tariffSub.unsubscribe();
          configSub.unsubscribe();
          personaSub.unsubscribe();
          comprehensiveResultsSub.unsubscribe();
        };
      } catch (err) {
        console.error('[App] Database initialization failed:', err);
        // 如果失败，至少设置 initialized 以显示主界面（或错误提示）
        setInitialized(true);
      }
    };

    initDB();
  }, []);

  const queueUpserts = async (
    collection: 'tariffs' | 'time_configs' | 'personas',
    docs: Array<Record<string, unknown>>,
  ) => {
    await Promise.all(docs.map(async (doc) => {
      const id = String(doc.id || '');
      if (!id) return;
      await syncOutboxService.enqueueUpsert({
        collection,
        docId: id,
        modifiedAt: getDocModifiedAt(collection, doc),
        doc,
      });
    }));
  };

  const queueDeletes = async (
    collection: 'tariffs' | 'time_configs' | 'personas',
    docIds: string[],
  ) => {
    if (docIds.length === 0) return;
    const modifiedAt = new Date().toISOString();
    await Promise.all(docIds.map(async (id) => {
      await syncOutboxService.enqueueDelete({
        collection,
        docId: id,
        modifiedAt,
      });
    }));
  };

  const handleUpdateTariffs = async (newTariffs: TariffData[]) => {
    try {
      const db = await getDatabase();
      // 全量替换：删除不在新列表里的记录，再 upsert 新列表
      const existingIds = new Set(newTariffs.map(t => t.id));
      const allDocs = await db.tariffs.find().exec();
      const toDelete = allDocs.filter(doc => !existingIds.has(doc.id));
      if (toDelete.length > 0) {
        await db.tariffs.bulkRemove(toDelete.map(d => d.id));
        await queueDeletes('tariffs', toDelete.map(d => d.id));
      }
      console.log('[App] Upserting tariffs:', newTariffs);
      const docsToUpsert = newTariffs.map(t => ({
        ...t,
        last_modified: t.last_modified || new Date().toISOString()
      }));
      await db.tariffs.bulkUpsert(docsToUpsert);
      await queueUpserts('tariffs', docsToUpsert as unknown as Array<Record<string, unknown>>);
      getSyncManager().requestSyncSoon();
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
      await queueUpserts('tariffs', docsToUpsert as unknown as Array<Record<string, unknown>>);
      getSyncManager().requestSyncSoon();
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
        await queueDeletes('time_configs', idsToDelete);
      }

      const docsToUpsert = newConfigs.map(c => ({
        ...c,
        last_modified: c.last_modified || new Date().toISOString()
      }));
      console.log('[App] Upserting time configs:', docsToUpsert);
      await db.time_configs.bulkUpsert(docsToUpsert);
      await queueUpserts('time_configs', docsToUpsert as unknown as Array<Record<string, unknown>>);
      getSyncManager().requestSyncSoon();

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
      await queueUpserts('time_configs', docsToUpsert as unknown as Array<Record<string, unknown>>);
      getSyncManager().requestSyncSoon();
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
        await queueDeletes('personas', idsToDelete);
      }

      const now = new Date().toISOString();
      await db.personas.bulkUpsert(nextPersonas.map(p => ({
        ...p,
        updated_at: p.updated_at || now,
        last_modified: p.last_modified || now,
        _deleted: p._deleted ?? false,
      })));
      await queueUpserts(
        'personas',
        nextPersonas.map(p => ({
          ...p,
          updated_at: p.updated_at || now,
          last_modified: p.last_modified || now,
          _deleted: p._deleted ?? false,
        })) as unknown as Array<Record<string, unknown>>,
      );
      getSyncManager().requestSyncSoon();
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

  const applyEntryMode = (mode: AppEntryMode) => {
    setStoredEntryPreference(mode);
    const nextHref = buildEntryUrl(window.location.href, mode);
    const nextUrl = new URL(nextHref);
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    setEntryMode(mode);
  };

  const handleExitToWeb = () => {
    applyEntryMode('web');
    setView('home');
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 animate-pulse font-medium">初始化数据库中...</div>
      </div>
    );
  }

  if (entryMode === 'pwa') {
    return (
      <>
        <PriceInsightPwaShell
          tariffs={tariffs}
          timeConfigs={timeConfigs}
          comprehensivePriceMap={comprehensivePriceMap}
          onExitToWeb={handleExitToWeb}
        />
        <SyncStatusBadge
          state={syncState}
          onSyncNow={() => {
            void getSyncManager().syncNow('manual');
          }}
        />
      </>
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
              calcCompPrice={calcCompPrice}
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
              readOnly
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
             <ComprehensivePriceCalculator tariffs={tariffs} timeConfigs={timeConfigs} onNavigate={setView} />
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
      <SyncStatusBadge
        state={syncState}
        onSyncNow={() => {
          void getSyncManager().syncNow('manual');
        }}
      />
    </div>
  );
};

export default App;
