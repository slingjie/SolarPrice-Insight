const XLSX = require('xlsx');

// 测试电价导入逻辑
const wbTariff = XLSX.readFile('docs/test/solar_tariffs_2026-02-07--.xlsx');
const wsTariff = wbTariff.Sheets[wbTariff.SheetNames[0]];
const tariffRows = XLSX.utils.sheet_to_json(wsTariff);

console.log('=== 电价数据分析 ===');
console.log('解析出的行数:', tariffRows.length);
console.log('第一行字段:', Object.keys(tariffRows[0]));
console.log('');

// 检查是否有时段列
const TIME_COLUMNS = ['尖峰时段', '高峰时段', '平段时段', '低谷时段', '深谷时段'];
console.log('检查时段列是否存在:');
TIME_COLUMNS.forEach(col => {
    const exists = col in tariffRows[0];
    console.log('  ' + col + ':', exists ? '存在' : '不存在');
});

console.log('\n=== 时段配置数据分析 ===');
const wbConfig = XLSX.readFile('docs/test/solar_time_configs_2026-02-079.xlsx');
console.log('Sheet names:', wbConfig.SheetNames);

const wsConfig = wbConfig.Sheets[wbConfig.SheetNames[0]];
const configRows = XLSX.utils.sheet_to_json(wsConfig);
console.log('第一个 sheet 的行数:', configRows.length);
console.log('第一行字段:', Object.keys(configRows[0]));

// 检查是否是矩阵格式
const HOUR_HEADERS = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}`);
const isMatrix = HOUR_HEADERS.slice(0, 3).every(h => h in configRows[0]);
console.log('是矩阵格式:', isMatrix);

// 模拟矩阵解析
if (isMatrix) {
    console.log('\n模拟矩阵解析:');
    const LABEL_TO_TYPE = {
        '尖': 'tip', '峰': 'peak', '平': 'flat', '谷': 'valley', '深': 'deep',
    };

    const gridToRules = (grid) => {
        const rules = [];
        let currentType = grid[0];
        let startHour = 0;

        for (let hour = 1; hour <= 24; hour++) {
            const nextType = hour < 24 ? grid[hour] : null;
            if (nextType !== currentType) {
                rules.push({
                    start: `${startHour}:00`,
                    end: `${hour}:00`,
                    type: currentType,
                });
                if (nextType !== null) {
                    currentType = nextType;
                    startHour = hour;
                }
            }
        }
        return rules;
    };

    for (const sheetName of wbConfig.SheetNames) {
        const sheet = wbConfig.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const gridsPerMonth = new Map();

        for (const row of rows) {
            const month = Number(row['Month']);
            if (!month || month < 1 || month > 12) continue;

            const grid = [];
            for (let h = 0; h < 24; h++) {
                const label = String(row[HOUR_HEADERS[h]] || '平').trim();
                grid.push(LABEL_TO_TYPE[label] || 'flat');
            }
            gridsPerMonth.set(month, grid);
        }

        if (gridsPerMonth.size > 0) {
            console.log('  Sheet "' + sheetName + '":', gridsPerMonth.size, '个月份数据');
        }
    }
}
