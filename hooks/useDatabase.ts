import { useState, useEffect } from 'react';
import { getDatabase } from '../services/db';
import { TariffData, TimeConfig, SavedTimeRange } from '../types';

/**
 * 监听所有电价数据的 Hook
 */
export function useTariffs() {
    const [tariffs, setTariffs] = useState<TariffData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            const db = await getDatabase();
            const query = db.tariffs.find({
                selector: {
                    _deleted: { $ne: true }
                },
                sort: [{ _modified: 'desc' }]
            });

            subscription = query.$.subscribe(docs => {
                setTariffs(docs.map(doc => doc.toJSON() as TariffData));
                setLoading(false);
            });
        };

        init();
        return () => subscription?.unsubscribe();
    }, []);

    return { tariffs, loading };
}

/**
 * 监听保存的时段名称的 Hook
 */
export function useSavedTimeRanges() {
    const [ranges, setRanges] = useState<SavedTimeRange[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            const db = await getDatabase();
            const query = db.saved_time_ranges.find({
                selector: {
                    _deleted: { $ne: true }
                }
            });

            subscription = query.$.subscribe(docs => {
                setRanges(docs.map(doc => doc.toJSON() as SavedTimeRange));
                setLoading(false);
            });
        };

        init();
        return () => subscription?.unsubscribe();
    }, []);

    return { ranges, loading };
}

/**
 * 监听分时段配置的 Hook
 */
export function useTimeConfigs() {
    const [configs, setConfigs] = useState<TimeConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: any;

        const init = async () => {
            const db = await getDatabase();
            const query = db.time_configs.find({
                selector: {
                    _deleted: { $ne: true }
                }
            });

            subscription = query.$.subscribe(docs => {
                setConfigs(docs.map(doc => doc.toJSON() as TimeConfig));
                setLoading(false);
            });
        };

        init();
        return () => subscription?.unsubscribe();
    }, []);

    return { configs, loading };
}
