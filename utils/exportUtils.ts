/**
 * 导出逐时数据为 CSV 文件 - 极致稳健兼容版 (V2.2)
 * 
 * 深度分析后的修复:
 * 1. 移除 target="_blank"：该属性与 download 属性冲突，导致浏览器优先尝试"打开"而非"下载"
 * 2. 简化下载逻辑：使用最原始的 a.click() 触发，不添加任何可能干扰的属性
 * 3. 保留剪贴板保底：即使下载失败，数据也会自动存入剪贴板
 */
export const exportHourlyDataToCSV = (data: any[], filename: string = 'solar_data.csv') => {
    console.group('%c [Export V2.2] 简化版下载 + 剪贴板保底 ', 'background: #059669; color: white; padding: 2px 4px; border-radius: 4px;');

    // Toast 通知
    const notify = (msg: string, isError = false) => {
        const toast = document.createElement('div');
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            padding: '12px 24px', background: isError ? '#ef4444' : '#10b981',
            color: 'white', borderRadius: '12px', zIndex: '10000',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: '600'
        });
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
    };

    if (!data || data.length === 0) {
        notify('暂无数据', true);
        console.groupEnd();
        return;
    }

    try {
        // 构建 CSV
        const headers = '时间,发电功率(W),辐照度(W/m2)\r\n';
        const rows = data.map(item => {
            const t = (item.time || '').replace('T', ' ').substring(0, 16);
            return `"${t}",${(item.pvPower || 0).toFixed(2)},${(item.poaIrradiance || 0).toFixed(2)}`;
        }).join('\r\n');

        const csvContent = '\uFEFF' + headers + rows;

        // === 防线 1: 剪贴板 (同步执行，保底) ===
        try {
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(csvContent);
                console.log('剪贴板写入成功');
            } else {
                const ta = document.createElement('textarea');
                ta.value = csvContent;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                console.log('剪贴板写入成功 (fallback)');
            }
        } catch (e) {
            console.warn('剪贴板写入失败:', e);
        }

        // === 防线 2: 标准下载 (不使用 target="_blank") ===
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        // 注意：不设置 target="_blank"，避免与 download 属性冲突

        // 将链接添加到 DOM（某些浏览器需要）
        a.style.display = 'none';
        document.body.appendChild(a);

        console.log('触发下载:', filename);
        a.click();

        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);

        // 显示提示
        notify('数据已准备！如未自动下载，请在 Excel 中按 Cmd+V 粘贴。');

    } catch (err) {
        console.error('导出失败:', err);
        notify('导出失败，请尝试在 Excel 中粘贴', true);
    } finally {
        console.groupEnd();
    }
};
