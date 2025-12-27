import { getDatabase } from './db';
import { TariffData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const priceService = {
    /**
     * 获取所有电价数据
     */
    async getAll(): Promise<TariffData[]> {
        const db = await getDatabase();
        const docs = await db.tariffs.find().exec();
        return docs.map(doc => doc.toJSON() as TariffData);
    },

    /**
     * 保存单条电价数据
     */
    async save(data: Omit<TariffData, 'id' | 'last_modified' | '_deleted'> & { id?: string }): Promise<TariffData> {
        const db = await getDatabase();
        const id = data.id || uuidv4();
        const now = new Date().toISOString();

        const tariffData: TariffData = {
            ...data,
            id,
            last_modified: now,
            _deleted: false
        } as TariffData;

        await db.tariffs.upsert(tariffData);
        return tariffData;
    },

    /**
     * 批量保存电价数据
     */
    async saveAll(items: (Omit<TariffData, 'id' | 'last_modified' | '_deleted'> & { id?: string })[]): Promise<TariffData[]> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const preparedItems = items.map(item => ({
            ...item,
            id: item.id || uuidv4(),
            last_modified: now,
            _deleted: false
        })) as TariffData[];

        await db.tariffs.bulkUpsert(preparedItems);
        return preparedItems;
    },

    /**
     * 软删除电价数据（适配 Supabase）
     */
    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        const doc = await db.tariffs.findOne(id).exec();
        if (doc) {
            await doc.patch({
                _deleted: true,
                last_modified: new Date().toISOString()
            });
            // 在本地可以选择真正删除，或者保留软删除
            // 为了完全契合方案中的“本地持久化”以及后续同步，这里采用软删除标记
            // 如果希望本地 UI 不显示，则查询时需过滤 _deleted: false
        }
    },

    /**
     * 硬删除数据
     */
    async hardDelete(id: string): Promise<void> {
        const db = await getDatabase();
        const doc = await db.tariffs.findOne(id).exec();
        if (doc) {
            await doc.remove();
        }
    },

    /**
     * 数据清洗：查找重复数据
     */
    async findDuplicates(type: 'exact' | 'price' = 'exact'): Promise<Record<string, TariffData[]>> {
        const items = await this.getAll();
        const validItems = items.filter(item => !item._deleted);

        const groups: Record<string, TariffData[]> = {};

        validItems.forEach(item => {
            const key = type === 'exact'
                ? `${item.province}-${item.month}-${item.category}-${item.voltage_level}-${JSON.stringify(item.prices)}`
                : `${item.province}-${item.month}-${JSON.stringify(item.prices)}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });

        // 过滤掉只有一条的组
        return Object.fromEntries(
            Object.entries(groups).filter(([_, values]) => values.length > 1)
        );
    }
};
