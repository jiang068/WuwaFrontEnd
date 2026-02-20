/**
 * record_auth.js
 * 处理本地存储、账号列表渲染及刷新逻辑
 */
let accountsMap = {};
let currentActiveId = null;
let currentGameRecord = null;

// 当从 SDK 换取到 sdkToken 后，统一在此处理并换取工具业务层 token


// 从本地恢复数据
function loadAccounts() {
    const saved = localStorage.getItem("wutheringWavesAccounts");
    if (saved) {
        accountsMap = JSON.parse(saved);
        currentActiveId = localStorage.getItem("wutheringWavesCurrentAccount");
    }
}

// 保存到本地
function saveAccountsToStorage() {
    localStorage.setItem("wutheringWavesAccounts", JSON.stringify(accountsMap));
    if (currentActiveId) {
        localStorage.setItem("wutheringWavesCurrentAccount", currentActiveId);
    }
}

// 核心：刷新/获取记录逻辑
function handleRefreshRecord() {
    if (!currentActiveId || !accountsMap[currentActiveId]) {
        return showToast("请先选择一个账号", "warning");
    }
    const account = accountsMap[currentActiveId];
    if (!account.sdkLoginInfo) {
        showToast("账号登录信息已过期，请重新登录", "error");
        deleteAccount(currentActiveId, true);
        return;
    }
    
    // 显示加载中
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('recordData').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';

    // 重新执行获取流程 (调用 network.js 中的逻辑)
    handleAccountSuccess(
        account.sdkLoginInfo.token, 
        account.cuid, 
        account.username, 
        account.phone
    );
}

// 渲染账号列表 (供 HTML 调用)
function renderAccountList() {
    loadAccounts();
    const list = document.getElementById("accountList");
    if (!list) return;
    list.innerHTML = '';
    
    if (Object.keys(accountsMap).length > 0) {
        Object.values(accountsMap).forEach(acc => {
            const item = document.createElement('div');
            item.className = "account-item " + (acc.id === currentActiveId ? "active" : "");
            const displayPhone = acc.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            
            item.innerHTML = `
                <div class="account-info">
                    <div>
                        <div class="account-phone">${displayPhone}</div>
                        <div class="account-username">${acc.username}</div>
                    </div>
                    <div class="account-actions">
                        <button class="btn btn-primary btn-small" onclick="window.switchAccount('${acc.id}')">切换</button>
                        <button class="btn btn-danger btn-small" onclick="window.deleteAccount('${acc.id}')">删除</button>
                    </div>
                </div>`;
            list.appendChild(item);
        });
    } else {
        list.innerHTML = '<div class="empty-accounts">暂无已保存的账号</div>';
    }
    
    // 更新主视图显示逻辑
    refreshMainView();
}

// 账号切换
window.switchAccount = function(id) {
    if (accountsMap[id]) {
        currentActiveId = id;
        saveAccountsToStorage();
        renderAccountList();
        showToast("已切换到账号: " + accountsMap[id].username, "success");
    }
};

// 账号删除 - 修改为打开自定义模态框
window.deleteAccount = function(id, auto = false) {
    if (!accountsMap[id]) return;

    if (auto) {
        // 自动删除，无需确认
        performDelete(id);
        return;
    }

    // 打开自定义确认模态框
    const modal = document.getElementById('confirmDeleteModal');
    const title = modal.querySelector('#confirmDeleteTitle');
    const text = modal.querySelector('#confirmDeleteText');
    
    title.textContent = '删除账号';
    text.textContent = `您确定要删除账号 ${accountsMap[id].username} 吗？此操作不可撤销。`;
    
    // 将要删除的 id 存储在按钮上，以便事件处理器获取
    document.getElementById('confirmDeleteBtn').dataset.accountId = id;
    
    modal.classList.add('show');
};

// 真正执行删除操作的函数
function performDelete(id) {
    if (!accountsMap[id]) return;
    
    delete accountsMap[id];
    if (currentActiveId === id) {
        currentActiveId = null;
        currentGameRecord = null;
    }
    saveAccountsToStorage();
    renderAccountList();
    showToast("账号已删除", "success");
}

// UI 刷新辅助
function refreshMainView() {
    const isNoAccount = Object.keys(accountsMap).length === 0;
    document.querySelector(".main-container").className = isNoAccount ? "main-container no-accounts" : "main-container has-accounts";
    
    // 修复：在访问 gameRecord 之前，确保 currentActiveId 存在且有效
    if (!isNoAccount && currentActiveId && accountsMap[currentActiveId] && accountsMap[currentActiveId].gameRecord) {
        const data = accountsMap[currentActiveId].gameRecord;
        document.getElementById('currentAccount').textContent = accountsMap[currentActiveId].username;
        document.getElementById('playerId').textContent = data.playerId || '-';
        document.getElementById('recordId').textContent = data.recordId || '-';
        document.getElementById('recordData').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
    } else {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('recordData').style.display = 'none';
    }
}

// 绑定页面按钮
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("refreshBtn")?.addEventListener("click", handleRefreshRecord);
    document.getElementById("addAccountBtn")?.addEventListener("click", () => {
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('accountManager').style.display = 'none';
        // 新增下面这行，确保“返回账号管理”按钮可见
        document.getElementById('backToAccountBtn').style.display = 'flex';
    });
    document.getElementById("backToAccountBtn")?.addEventListener("click", () => {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('accountManager').style.display = 'block';
    });
});