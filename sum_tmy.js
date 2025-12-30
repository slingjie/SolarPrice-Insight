
const fs = require('fs');
const tmy = JSON.parse(fs.readFileSync('tmy_response.json', 'utf8'));
const hourly = tmy.outputs.tmy_hourly;
let totalGh = 0;
hourly.forEach(h => {
    totalGh += h['G(h)'];
});
console.log(`Total G(h) (Wh/m2): ${totalGh}`);
console.log(`Total G(h) (kWh/m2): ${totalGh / 1000}`);
