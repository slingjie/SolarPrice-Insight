/**
 * 操作日志服务
 * 用于记录和查询数据库操作日志
 */

import { getDatabase } from './db';
import { OperationLog, LogCollection, LogAction } from '../types';

/**
 * 记录一条操作日志
 */
export const recordLog = async (
    targetCollection: LogCollection,
    action: LogAction,
    count: number,
    details?: string
): Promise<void> => {
    try {
        const db = await getDatabase();
        const log: OperationLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            target_collection: targetCollection,
            action,
            count,
            details
        };
        await db.operation_logs.insert(log);
    } catch (err) {
        console.error('[LogService] Failed to record log:', err);
    }
};

/**
 * 获取操作日志列表
 */
export const getLogs = async (
    limit: number = 100,
    collectionFilter?: LogCollection,
    actionFilter?: LogAction
): Promise<OperationLog[]> => {
    try {
        const db = await getDatabase();
        let query = db.operation_logs.find();

        if (collectionFilter) {
            query = query.where('target_collection').eq(collectionFilter);
        }
        if (actionFilter) {
            query = query.where('action').eq(actionFilter);
        }

        const docs = await query.exec();

        // Sort by timestamp descending and limit
        return docs
            .map(d => d.toJSON() as OperationLog)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    } catch (err) {
        console.error('[LogService] Failed to get logs:', err);
        return [];
    }
};

/**
 * 清空所有日志（用于测试或重置）
 */
export const clearLogs = async (): Promise<void> => {
    try {
        const db = await getDatabase();
        const docs = await db.operation_logs.find().exec();
        await db.operation_logs.bulkRemove(docs.map(d => d.id));
    } catch (err) {
        console.error('[LogService] Failed to clear logs:', err);
    }
};
