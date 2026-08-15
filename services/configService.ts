import { getDatabase } from './db';
import { TimeConfig, SavedTimeRange } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { syncOutboxService } from './sync/syncOutboxService';
import { getSyncManager } from './sync/syncManager';
import { getDocModifiedAt } from './sync/syncAdapters';

export const configService = {
    /**
     * 获取所有分时段配置
     */
    async getAllTimeConfigs(): Promise<TimeConfig[]> {
        const db = await getDatabase();
        const docs = await db.time_configs.find().exec();
        return docs.map(doc => doc.toJSON() as TimeConfig);
    },

    /**
     * 保存分时段配置
     */
    async saveTimeConfig(data: Omit<TimeConfig, 'id' | 'last_modified' | '_deleted'> & { id?: string }): Promise<TimeConfig> {
        const db = await getDatabase();
        const id = data.id || uuidv4();
        const now = new Date().toISOString();

        const configData: TimeConfig = {
            ...data,
            id,
            last_modified: now,
            _deleted: false
        } as TimeConfig;

        await db.time_configs.upsert(configData);
        await syncOutboxService.enqueueUpsert({
            collection: 'time_configs',
            docId: configData.id,
            modifiedAt: getDocModifiedAt('time_configs', configData as unknown as Record<string, unknown>),
            doc: configData as unknown as Record<string, unknown>,
        });
        getSyncManager().requestSyncSoon();
        return configData;
    },

    /**
     * 获取所有保存的时段名称
     */
    async getAllSavedRanges(): Promise<SavedTimeRange[]> {
        const db = await getDatabase();
        const docs = await db.saved_time_ranges.find().exec();
        return docs.map(doc => doc.toJSON() as SavedTimeRange);
    },

    /**
     * 保存自定义时段
     */
    async saveTimeRange(data: Omit<SavedTimeRange, 'id' | 'last_modified' | '_deleted'> & { id?: string }): Promise<SavedTimeRange> {
        const db = await getDatabase();
        const id = data.id || uuidv4();
        const now = new Date().toISOString();

        const rangeData: SavedTimeRange = {
            ...data,
            id,
            last_modified: now,
            _deleted: false
        } as SavedTimeRange;

        await db.saved_time_ranges.upsert(rangeData);
        await syncOutboxService.enqueueUpsert({
            collection: 'saved_time_ranges',
            docId: rangeData.id,
            modifiedAt: getDocModifiedAt('saved_time_ranges', rangeData as unknown as Record<string, unknown>),
            doc: rangeData as unknown as Record<string, unknown>,
        });
        getSyncManager().requestSyncSoon();
        return rangeData;
    },

    /**
     * 删除自定义时段（软删除）
     */
    async deleteTimeRange(id: string): Promise<void> {
        const db = await getDatabase();
        const doc = await db.saved_time_ranges.findOne(id).exec();
        if (doc) {
            await doc.patch({
                _deleted: true,
                last_modified: new Date().toISOString()
            });
            const patched = doc.toJSON() as SavedTimeRange;
            await syncOutboxService.enqueueUpsert({
                collection: 'saved_time_ranges',
                docId: patched.id,
                modifiedAt: getDocModifiedAt('saved_time_ranges', patched as unknown as Record<string, unknown>),
                doc: patched as unknown as Record<string, unknown>,
            });
            getSyncManager().requestSyncSoon();
        }
    }
};
