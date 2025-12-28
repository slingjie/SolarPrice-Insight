
const https = require('https');

const CITIES = [
    { name: 'Hangzhou (杭州)', lat: 30.27, lon: 120.15 },
    { name: 'Shanghai (上海)', lat: 31.23, lon: 121.47 },
    { name: 'Nanjing (南京)', lat: 32.06, lon: 118.79 }
];

const BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_2/PVcalc';

function fetchCityData(city) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams({
            lat: city.lat,
            lon: city.lon,
            peakpower: '1',
            loss: '14',
            outputformat: 'json',
            optimalinclination: '1'
        });

        const url = `${BASE_URL}?${params.toString()}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Status ${res.statusCode}: ${data}`));
                        return;
                    }
                    const json = JSON.parse(data);
                    resolve({ city, data: json });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function runTest() {
    console.log('开始测试 PVGIS 数据 (Start Testing PVGIS Data)...\n');
    console.log('参数 (Params): PeakPower=1kWp, Loss=14%, Optimal Inclination\n');

    for (const city of CITIES) {
        try {
            console.log(`正在获取 ${city.name} 的数据...`);
            const { data } = await fetchCityData(city);

            const totals = data.outputs.totals.fixed;
            const annualRad = totals['H(i)_y']; // Annual Interaction (Irradiance)
            const annualEnergy = totals['E_y']; // Annual Energy
            const angle = data.inputs.mounting_system.fixed.slope.value;

            console.log(`✅ ${city.name} 获取成功:`);
            console.log(`   - 最佳倾角 (Optimal Angle): ${angle}°`);
            console.log(`   - 年辐照度 (Annual Irradiance): ${annualRad} kWh/m²`);
            console.log(`   - 年发电量 (Annual Energy): ${annualEnergy} kWh`);
            console.log(`   - 满发小时数 (Full Load Hours): ${annualEnergy.toFixed(2)} h`); // Since peakpower=1
            console.log('-----------------------------------');
        } catch (err) {
            console.error(`❌ ${city.name} 获取失败:`, err.message);
        }
    }
}

runTest();
