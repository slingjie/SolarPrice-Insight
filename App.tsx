
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

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [tariffs, setTariffs] = useState<TariffData[]>([]);
  const [timeConfigs, setTimeConfigs] = useState<TimeConfig[]>(DEFAULT_TIME_CONFIGS);
  const [analysisTarget, setAnalysisTarget] = useState<{province: string, category: string, voltage: string} | null>(null);

  // Persistence
  useEffect(() => {
    const savedTariffs = localStorage.getItem('solar_tariffs_v2');
    if (savedTariffs) setTariffs(JSON.parse(savedTariffs));
    
    const savedConfigs = localStorage.getItem('solar_time_configs_v2');
    if (savedConfigs) setTimeConfigs(JSON.parse(savedConfigs));
  }, []);

  const handleUpdateTariffs = (newTariffs: TariffData[]) => {
    setTariffs(newTariffs);
    localStorage.setItem('solar_tariffs_v2', JSON.stringify(newTariffs));
  };

  const handleUpdateTimeConfigs = (newConfigs: TimeConfig[]) => {
    setTimeConfigs(newConfigs);
    localStorage.setItem('solar_time_configs_v2', JSON.stringify(newConfigs));
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
    handleUpdateTariffs(newTariffs);
    setView('dashboard');
  };

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
