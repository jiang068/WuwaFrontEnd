document.addEventListener("DOMContentLoaded", function() {
    // 设置 Banner 图片
    if (window.APP_CONFIG && window.APP_CONFIG.bannerImageUrl) {
        const bannerImg = document.getElementById('bannerImage');
        if (bannerImg) {
            bannerImg.src = window.APP_CONFIG.bannerImageUrl;
        }
    }

    // 渲染公告
    if (window.NOTICE_CONFIG) {
        // 显示登录框前面的公告
        if (window.NOTICE_CONFIG.beforeNotices && Array.isArray(window.NOTICE_CONFIG.beforeNotices) && window.NOTICE_CONFIG.beforeNotices.length > 0) {
            const loginContainer = document.querySelector('.login-container');
            const leftPanel = document.querySelector('.left-panel');

            window.NOTICE_CONFIG.beforeNotices.forEach((notice, index) => {
                if (notice.text && notice.text.trim() !== '') {
                    // 创建公告框
                    const noticeDiv = document.createElement('div');
                    noticeDiv.className = 'login-container';
                    noticeDiv.id = `before-notice-${index}`;

                    // 创建标题元素
                    const titleDiv = document.createElement('div');
                    titleDiv.style.cssText = 'color: var(--theme-dark); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.8rem;';
                    titleDiv.textContent = notice.title || '📢 公告';

                    // 创建内容元素
                    const contentDiv = document.createElement('div');
                    contentDiv.style.cssText = 'color: var(--theme-text); font-size: 0.9rem; line-height: 1.6; opacity: 0.9;';

                    // 处理文本：转义HTML、转换换行符和链接
                    let text = notice.text;
                    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    text = text.replace(/\n/g, '<br>');
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    text = text.replace(urlRegex, '<a href="$1" target="_blank" style="color: var(--theme-dark); text-decoration: underline;">$1</a>');
                    contentDiv.innerHTML = text;

                    noticeDiv.appendChild(titleDiv);
                    noticeDiv.appendChild(contentDiv);

                    // 插入到登录框前面
                    leftPanel.insertBefore(noticeDiv, loginContainer);
                }
            });
        }

        // 显示登录框后面的公告
        if (window.NOTICE_CONFIG.afterNotices && Array.isArray(window.NOTICE_CONFIG.afterNotices) && window.NOTICE_CONFIG.afterNotices.length > 0) {
            const noticesContainer = document.getElementById('noticesContainer');

            window.NOTICE_CONFIG.afterNotices.forEach((notice, index) => {
                if (notice.text && notice.text.trim() !== '') {
                    // 创建公告框
                    const noticeDiv = document.createElement('div');
                    noticeDiv.className = 'login-container';
                    noticeDiv.id = `after-notice-${index}`;

                    // 创建标题元素
                    const titleDiv = document.createElement('div');
                    titleDiv.style.cssText = 'color: var(--theme-dark); font-size: 1.1rem; font-weight: 700; margin-bottom: 0.8rem;';
                    titleDiv.textContent = notice.title || '📢 公告';

                    // 创建内容元素
                    const contentDiv = document.createElement('div');
                    contentDiv.style.cssText = 'color: var(--theme-text); font-size: 0.9rem; line-height: 1.6; opacity: 0.9;';

                    // 处理文本：转义HTML、转换换行符和链接
                    let text = notice.text;
                    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    text = text.replace(/\n/g, '<br>');
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    text = text.replace(urlRegex, '<a href="$1" target="_blank" style="color: var(--theme-dark); text-decoration: underline;">$1</a>');
                    contentDiv.innerHTML = text;

                    noticeDiv.appendChild(titleDiv);
                    noticeDiv.appendChild(contentDiv);

                    // 插入到登录框后面
                    noticesContainer.appendChild(noticeDiv);
                }
            });
        }
    }

    // 初始化极验
    if (typeof initCaptcha === 'function') {
        initCaptcha();
    }
    
    // 初始化 UI 状态
    const savedAccounts = localStorage.getItem("wutheringWavesAccounts");
    let accounts = {};
    try {
        accounts = savedAccounts ? JSON.parse(savedAccounts) : {};
    } catch (e) {
        console.error("解析本地账号数据失败:", e);
        accounts = {};
    }

    if (Object.keys(accounts).length > 0) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('accountManager').style.display = 'block';
        document.querySelector('.main-container').classList.remove('no-accounts');
        document.querySelector('.main-container').classList.add('has-accounts');
        if (typeof renderAccountList === 'function') {
            renderAccountList();
        }
    } else {
        document.querySelector('.main-container').classList.add('no-accounts');
        document.querySelector('.main-container').classList.remove('has-accounts');
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('accountManager').style.display = 'none';
    }

    // 绑定关闭模态框
    const successModal = document.getElementById('successModal');
    if (successModal) {
        const closeBtn = successModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                successModal.classList.remove('show');
            }
        }
    }

    // 新增：绑定删除确认模态框的事件
    const confirmModal = document.getElementById('confirmDeleteModal');
    if (confirmModal) {
        const closeBtn = confirmModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        const closeModal = () => confirmModal.classList.remove('show');

        if (closeBtn) closeBtn.onclick = closeModal;
        if (cancelBtn) cancelBtn.onclick = closeModal;
        
        if (confirmBtn) {
            confirmBtn.onclick = function() {
                const accountId = this.dataset.accountId;
                try {
                    if (accountId && typeof performDelete === 'function') {
                        performDelete(accountId);
                    }
                } finally {
                    // 确保无论是否报错，模态框都会关闭
                    closeModal();
                }
            }
        }

        window.onclick = function(event) {
            if (event.target == successModal) {
                successModal.classList.remove('show');
            }
            if (event.target == confirmModal) {
                closeModal();
            }
        }
    }

    // 登录表单提交拦截
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone')?.value?.trim();
            const code = document.getElementById('verificationCode')?.value?.trim();

            if (!phone || phone.length !== 11) {
                showToast && showToast('请输入有效的11位手机号', 'error');
                return;
            }
            if (!code) {
                showToast && showToast('请输入验证码', 'error');
                return;
            }

            if (typeof performLogin === 'function') {
                performLogin(phone, code);
            } else {
                showToast && showToast('登录功能未加载', 'error');
            }
        });
    }
});
