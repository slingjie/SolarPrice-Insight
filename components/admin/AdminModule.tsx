import React, { useState, useEffect } from 'react';
import { AdminLayout, AdminView } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { TariffsManager } from './TariffsManager';
import { TimeConfigsManager } from './TimeConfigsManager';
import { ResultsManager } from './ResultsManager';
import { DataImportExport } from './DataImportExport';
import { BackupRestore } from './BackupRestore';
import { OperationLog } from './OperationLog';
import { TariffData, TimeConfig, ComprehensiveResult, LoadPersona } from '../../types';
import { getDatabase } from '../../services/db';
import { syncOutboxService } from '../../services/sync/syncOutboxService';
import { getSyncManager } from '../../services/sync/syncManager';
import { getDocModifiedAt } from '../../services/sync/syncAdapters';

interface AdminModuleProps {
    tariffs: TariffData[];
    timeConfigs: TimeConfig[];
    onUpdateTariffs: (tariffs: TariffData[]) => void;
    onUpdateTimeConfigs: (configs: TimeConfig[]) => void;
    onMergeTariffs: (tariffs: TariffData[]) => void;
    onMergeTimeConfigs: (configs: TimeConfig[]) => void;
    onBack: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
    tariffs,
    timeConfigs,
    onUpdateTariffs,
    onUpdateTimeConfigs,
    onMergeTariffs,
    onMergeTimeConfigs,
    onBack
}) => {
    const [currentView, setCurrentView] = useState<AdminView>('dashboard');
    const [comprehensiveResults, setComprehensiveResults] = useState<ComprehensiveResult[]>([]);
    const [personas, setPersonas] = useState<LoadPersona[]>([]);

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

    // 加载行业画像
    useEffect(() => {
        const loadPersonas = async () => {
            try {
                const db = await getDatabase();
                const docs = await db.personas.find().exec();
                setPersonas(docs.map(d => d.toJSON() as LoadPersona));
            } catch (err) {
                console.error('[Admin] Failed to load personas:', err);
            }
        };
        loadPersonas();

        let subscription: any;
        getDatabase().then(db => {
            subscription = db.personas.find().$.subscribe(docs => {
                setPersonas(docs.map(d => d.toJSON() as LoadPersona));
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
                const now = new Date().toISOString();
                await Promise.all(idsToDelete.map(async (id) => {
                    await syncOutboxService.enqueueDelete({
                        collection: 'comprehensive_results',
                        docId: id,
                        modifiedAt: now,
                    });
                }));
            }

            // 更新/新增
            const upserts = results.map(r => ({
                ...r,
                last_modified: r.last_modified || new Date().toISOString()
            }));
            await db.comprehensive_results.bulkUpsert(upserts);
            await Promise.all(upserts.map(async (result) => {
                await syncOutboxService.enqueueUpsert({
                    collection: 'comprehensive_results',
                    docId: result.id,
                    modifiedAt: getDocModifiedAt('comprehensive_results', result as unknown as Record<string, unknown>),
                    doc: result as unknown as Record<string, unknown>,
                });
            }));
            getSyncManager().requestSyncSoon();
        } catch (err) {
            console.error('[Admin] Failed to update results:', err);
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
                const now = new Date().toISOString();
                await Promise.all(idsToDelete.map(async (id) => {
                    await syncOutboxService.enqueueDelete({
                        collection: 'personas',
                        docId: id,
                        modifiedAt: now,
                    });
                }));
            }

            const now = new Date().toISOString();
            const upserts = nextPersonas.map(p => ({
                ...p,
                updated_at: p.updated_at || now,
                last_modified: p.last_modified || now,
                _deleted: p._deleted ?? false,
            }));
            await db.personas.bulkUpsert(upserts);
            await Promise.all(upserts.map(async (persona) => {
                await syncOutboxService.enqueueUpsert({
                    collection: 'personas',
                    docId: persona.id,
                    modifiedAt: getDocModifiedAt('personas', persona as unknown as Record<string, unknown>),
                    doc: persona as unknown as Record<string, unknown>,
                });
            }));
            getSyncManager().requestSyncSoon();
        } catch (err) {
            console.error('[Admin] Failed to update personas:', err);
            throw err;
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
                        tariffs={tariffs}
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
                        personas={personas}
                        onImportTariffs={onMergeTariffs}
                        onImportConfigs={onMergeTimeConfigs}
                        onImportResults={handleUpdateResults}
                        onImportPersonas={handleUpdatePersonas}
                    />
                );
            case 'backup':
                return (
                    <BackupRestore
                        tariffs={tariffs}
                        timeConfigs={timeConfigs}
                        personas={personas}
                        comprehensiveResults={comprehensiveResults}
                        onRestoreTariffs={onUpdateTariffs}
                        onRestoreConfigs={onUpdateTimeConfigs}
                        onRestorePersonas={handleUpdatePersonas}
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
