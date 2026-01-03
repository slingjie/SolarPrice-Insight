import React, { useState, useEffect } from 'react';
import { AdminLayout, AdminView } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { TariffsManager } from './TariffsManager';
import { TimeConfigsManager } from './TimeConfigsManager';
import { ResultsManager } from './ResultsManager';
import { DataImportExport } from './DataImportExport';
import { BackupRestore } from './BackupRestore';
import { OperationLog } from './OperationLog';
import { TariffData, TimeConfig, ComprehensiveResult } from '../../types';
import { getDatabase } from '../../services/db';

interface AdminModuleProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    onUpdateTariffs: (tariffs: TariffData[]) => void;
    onUpdateTimeConfigs: (configs: TimeConfig[]) => void;
    onBack: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
    tariffs,
    timeConfigs,
    onUpdateTariffs,
    onUpdateTimeConfigs,
    onBack
}) => {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    const [comprehensiveResults, setComprehensiveResults] = useState<ComprehensiveResult[]>([]);

    // 加载综合电价结果
    useEffect(() => {
        const loadResults = async () => {
            try {
                const db = await getDatabase();
                const docs = await db.comprehensive_results.find().exec();
                setComprehensiveResults(docs.map(d => d.toJSON() as ComprehensiveResult));
            } catch (err) {
                console.error('[Admin] Failed to load comprehensive results:', err);
            }
        };
        loadResults();

        // 订阅变化
        let subscription: any;
        getDatabase().then(db => {
            subscription = db.comprehensive_results.find().$.subscribe(docs => {
                setComprehensiveResults(docs.map(d => d.toJSON() as ComprehensiveResult));
            });
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    const handleUpdateResults = async (results: ComprehensiveResult[]) => {
        try {
            const db = await getDatabase();
            const existingDocs = await db.comprehensive_results.find().exec();
            const existingIds = new Set(existingDocs.map(d => d.id));
            const newIds = new Set(results.map(r => r.id));

            // 删除不存在的
            const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
            if (idsToDelete.length > 0) {
                await db.comprehensive_results.bulkRemove(idsToDelete);
            }

            // 更新/新增
            await db.comprehensive_results.bulkUpsert(results.map(r => ({
                ...r,
                last_modified: r.last_modified || new Date().toISOString()
            })));
        } catch (err) {
            console.error('[Admin] Failed to update results:', err);
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return (
                    <AdminDashboard
                        tariffs={tariffs}
                        timeConfigs={timeConfigs}
                        comprehensiveResults={comprehensiveResults}
                        onNavigate={setCurrentView}
                    />
                );
            case 'tariffs':
                return (
                    <TariffsManager
                        tariffs={tariffs}
                        onUpdateTariffs={onUpdateTariffs}
                    />
                );
            case 'configs':
                return (
                    <TimeConfigsManager
                        configs={timeConfigs}
                        onUpdateConfigs={onUpdateTimeConfigs}
                    />
                );
            case 'results':
                return (
                    <ResultsManager
                        results={comprehensiveResults}
                        onUpdateResults={handleUpdateResults}
                    />
                );
            case 'import-export':
                return (
                    <DataImportExport
                        tariffs={tariffs}
                        timeConfigs={timeConfigs}
                        comprehensiveResults={comprehensiveResults}
                        onImportTariffs={onUpdateTariffs}
                        onImportConfigs={onUpdateTimeConfigs}
                        onImportResults={handleUpdateResults}
                    />
                );
            case 'backup':
                return (
                    <BackupRestore
                        tariffs={tariffs}
                        timeConfigs={timeConfigs}
                        comprehensiveResults={comprehensiveResults}
                        onRestoreTariffs={onUpdateTariffs}
                        onRestoreConfigs={onUpdateTimeConfigs}
                        onRestoreResults={handleUpdateResults}
                    />
                );
            case 'logs':
                return <OperationLog />;
            default:
                return null;
        }
    };

    return (
        <AdminLayout
            currentView={currentView}
            onNavigate={setCurrentView}
            onBack={onBack}
        >
            {renderContent()}
        </AdminLayout>
    );
};
