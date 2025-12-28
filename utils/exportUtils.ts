/**
 * 导出逐时数据为 CSV 文件 - 极致稳健兼容版 (V2.3)
 * 
 * 浏览器调试确认：代码执行正常，但 a.click() 被浏览器静默拦截
 * 解决方案：
 * 1. 以剪贴板为主要数据传递方式
 * 2. 使用 alert() 确保通知可见
 * 3. 保留下载尝试作为备选
 */
export const exportHourlyDataToCSV = (data: any[], filename: string = 'solar_data.csv') => {
    console.group('%c [Export V2.3] 剪贴板优先 + 下载备选 ', 'background: #7c3aed; color: white; padding: 2px 4px; border-radius: 4px;');

    if (!data || data.length === 0) {
        alert('暂无数据可导出');
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

        // === 主方案: 剪贴板 ===
        let clipboardSuccess = false;
        try {
            if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(csvContent);
                clipboardSuccess = true;
            } else {
                const ta = document.createElement('textarea');
                ta.value = csvContent;
                ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                clipboardSuccess = true;
            }
            console.log('剪贴板写入成功');
        } catch (e) {
            console.warn('剪贴板写入失败:', e);
        }

        // === 备选方案: 标准下载 ===
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);

        console.log('尝试触发下载:', filename);
        a.click();

        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1000);

        // === 用户通知 (使用 alert 确保可见) ===
        if (clipboardSuccess) {
            // 延迟显示，避免与下载冲突
            setTimeout(() => {
                alert('数据已复制到剪贴板！\n\n请打开 Excel，选中单元格后按 Cmd+V 粘贴即可。\n\n（如果文件已自动下载，可忽略此提示）');
            }, 100);
        }

    } catch (err) {
        console.error('导出失败:', err);
        alert('导出失败: ' + (err as Error).message);
    } finally {
        console.groupEnd();
    }
};
