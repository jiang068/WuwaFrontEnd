/**
 * 模块四：UI 消息提示与弹窗渲染
 */
function showToast(message, type = "info") {
    // 1. 清理旧消息
    const existingMsg = document.querySelector(".message");
    if (existingMsg) existingMsg.remove();

    // 2. 颜色配置表 (从 :root 获取主题色)
    const rootStyles = getComputedStyle(document.documentElement);
    const colorMap = {
        success: rootStyles.getPropertyValue('--theme-dark').trim() || '#4CAF50',
        error: '#f44336', // 错误颜色通常保持红色以示警示
        warning: rootStyles.getPropertyValue('--theme-gold').trim() || '#ff9800',
        info: rootStyles.getPropertyValue('--theme-light').trim() || '#2196F3'
    };

    // 3. 创建容器
    const toast = document.createElement('div');
    toast.className = "message message-" + type;
    toast.textContent = message;

    // 4. inline style
    Object.assign(toast.style, {
        'position': 'fixed',
        'top': '20px',
        'right': "20px",
        'padding': "12px 20px",
        'borderRadius': '8px',
        'color': "white",
        'fontWeight': '500',
        'zIndex': "10000",
        'opacity': '0',
        'transform': "translateX(100%)",
        'transition': "all 0.3s ease",
        'maxWidth': "300px",
        'wordWrap': "break-word",
        'backgroundColor': colorMap[type] || "#2196F3",
        'boxShadow': "0 4px 12px rgba(0,0,0,0.15)"
    });

    // 5. 插入并触发动画
    document.body.appendChild(toast);
    
    // 延迟触发进入动画
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = "translateX(0)";
    }, 100);

    // 6. 自动消失逻辑
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = "translateX(100%)";
        setTimeout(() => toast.remove(), 300); // 消失后的清理
    }, 3000);
}

// 复制逻辑
async function handleCopyRecord() {
    if (!currentGameRecord) {
        return showToast("暂无记录可复制", "warning");
    }
    const jsonStr = JSON.stringify(currentGameRecord, null, 2);
    
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(jsonStr);
            showToast("记录已复制到剪贴板", "success");
            return;
        }
        throw new Error("Clipboard API unavailable");
    } catch (e) {
        // 降级处理：手动弹出文本框
        const textArea = document.createElement("textarea");
        textArea.value = jsonStr;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast("自动复制失败，请尝试手动复制", "warning");
        console.log(jsonStr); // 备用
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("copyBtn")?.addEventListener("click", handleCopyRecord);
});