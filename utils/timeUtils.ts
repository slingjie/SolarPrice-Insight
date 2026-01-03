import { TimeRule, TimeType } from '../types';

// 定义 24 小时的默认类型
const DEFAULT_TYPE: TimeType = 'valley'; // 默认为低谷或平段，视业务而定，这里暂定 valley

/**
 * 将时间段规则转换为 24 小时的类型数组
 * 注意：目前仅支持整点粒度，分钟将被忽略（向下取整）
 */
export const rulesToGrid = (rules: TimeRule[]): TimeType[] => {
    const grid: TimeType[] = Array(24).fill(null); // 初始化为空，表示未配置

    // 如果没有规则，返回全空数组（或者根据业务需求返回默认值）
    if (!rules || rules.length === 0) return Array(24).fill(DEFAULT_TYPE);

    rules.forEach(rule => {
        const startHour = parseInt(rule.start.split(':')[0], 10);
        // 处理结束时间：如果是 00:00 且在 start 之后，通常表示次日 24:00
        let endHour = parseInt(rule.end.split(':')[0], 10);
        if (endHour === 0 && rule.end !== '00:00') endHour = 24; // 比如 23:59 -> 24? 或者规则就是 00:00 结束
        if (endHour === 0 && startHour > 0) endHour = 24; // 跨度到 24 点

        // 填充网格
        for (let i = startHour; i < endHour; i++) {
            if (i >= 0 && i < 24) {
                grid[i] = rule.type;
            }
        }
    });

    // 填充未定义的空隙为默认值，或者保持 null 由 UI 处理
    // 这里为了稳健，将 null 填补为 DEFAULT_TYPE，防止 UI 崩溃
    for (let i = 0; i < 24; i++) {
        if (grid[i] === null) grid[i] = DEFAULT_TYPE;
    }

    return grid;
};

/**
 * 将 24 小时类型数组转换为最简时间段规则
 * 合并连续的相同类型
 */
export const gridToRules = (grid: TimeType[]): TimeRule[] => {
    const rules: TimeRule[] = [];
    if (grid.length === 0) return rules;

    let currentType = grid[0];
    let startHour = 0;

    for (let i = 1; i <= 24; i++) {
        // i = 24 时为了触发最后一段的结算
        const type = i < 24 ? grid[i] : null;

        if (type !== currentType) {
            // 结束当前段
            rules.push({
                start: `${startHour.toString().padStart(2, '0')}:00`,
                end: `${i.toString().padStart(2, '0')}:00`, // 24:00 会显示为 24:00 还是 00:00? 通常 UI 显示 00:00 (次日)
                type: currentType as TimeType
            });

            // 开始新段
            currentType = type as TimeType;
            startHour = i;
        }
    }

    // 修正 24:00 为 00:00 吗？标准 TimeRule 通常用 00:00 表示次日结束吗？
    // 查看原代码 TimeConfig.tsx，并没有特殊处理。通常 input type="time" 不支持 24:00。
    // 按照惯例，最后一段如果是 24:00 结束，在 input type=time 中通常显示 00:00。
    // 这里保持 "XX:00" 格式。后续 UI 层可能需要处理 24:00 -> 00:00 的显示。
    // 修正：TimeRule 的定义遵循 input type="time"，所以 "24:00" 应该是 "00:00" 吗？
    // 如果数据库里存的是 "24:00"，input type="time" 会无法识别。
    // 所以需要将结束时间 "24:00" 转为 "00:00" 吗？
    // 让我们查看原有的 TimeRule 数据。通常是 start "00:00", end "08:00"。
    // 最后一段如果是 22:00 到 24:00，应该是 start "22:00", end "00:00"。
    // 所以如果是 i=24，转换为字符串 "00:00"。

    return rules.map(r => ({
        ...r,
        end: r.end === '24:00' ? '00:00' : r.end
    }));
};
