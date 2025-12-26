import { getDatabase } from './services/db';

async function query() {
    const db = await getDatabase();
    const tariffs = await db.tariffs.find({
        selector: {
            province: '浙江省',
            category: '大工业用电',
            voltage_level: '1-10(20)千伏',
            month: '2025-12'
        }
    }).exec();

    console.log(JSON.stringify(tariffs.map(t => t.toJSON()), null, 2));
    process.exit(0);
}

query();
