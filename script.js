// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAR13kz2vTvXnAyfOH93kO2w0mf65huDII",
  authDomain: "accounting-e8609.firebaseapp.com",
  databaseURL: "https://accounting-e8609-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "accounting-e8609",
  storageBucket: "accounting-e8609.firebasestorage.app",
  messagingSenderId: "802516920170",
  appId: "1:802516920170:web:f4ce114ae95ea2dc906713",
  measurementId: "G-ZWBHX9BDM9"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// 全局变量
let currentUser = null;
let currentDate = new Date();
let selectedDate = new Date();
let calendarDate = new Date();
let records = [];
let filteredRecords = [];
let currentPage = 1;
let recordsPerPage = 10;
let selectedRecordType = 'income';
let selectedCategory = '';
let detailDateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
};

// DOM 元素
const elements = {
    // 容器
    loginContainer: document.getElementById('login-container'),
    mainContainer: document.getElementById('main-container'),
    
    // 加载动画
    loadingSpinner: document.getElementById('loading-spinner'),
    
    // 登录表单
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    forgotPassword: document.getElementById('forgot-password'),
    
    // 主界面元素
    logoutBtn: document.getElementById('logout-btn'),
    detailsBtn: document.getElementById('details-btn'),
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    todayBtn: document.getElementById('today-btn'),
    currentDateEl: document.getElementById('current-date'),
    dateText: document.getElementById('date-text'),
    calendarIcon: document.getElementById('calendar-icon'),
    dailyIncome: document.getElementById('daily-income'),
    dailyExpense: document.getElementById('daily-expense'),
    dailyProfit: document.getElementById('daily-profit'),
    recordsList: document.getElementById('records-list'),
    addRecordBtn: document.getElementById('add-record-btn'),
    exportBtn: document.getElementById('export-btn'),
    exportCSV: document.getElementById('export-csv'),
    exportExcel: document.getElementById('export-excel'),
    
    // 添加记录模态框
    addModal: document.getElementById('add-modal'),
    amountInput: document.getElementById('amount-input'),
    incomeBtn: document.getElementById('income-btn'),
    expenseBtn: document.getElementById('expense-btn'),
    incomeCategories: document.getElementById('income-categories'),
    expenseCategories: document.getElementById('expense-categories'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    cancelAdd: document.getElementById('cancel-add'),
    saveRecord: document.getElementById('save-record'),
    
    // 详细数据模态框
    detailsModal: document.getElementById('details-modal'),
    closeDetails: document.getElementById('close-details'),
    rangeBtns: document.querySelectorAll('.range-btn'),
    startDate: document.getElementById('start-date'),
    endDate: document.getElementById('end-date'),
    applyRange: document.getElementById('apply-range'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    totalProfit: document.getElementById('total-profit'),
    detailRecordsList: document.getElementById('detail-records-list'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info'),
    detailExportBtn: document.getElementById('detail-export-btn'),
    detailExportCSV: document.getElementById('detail-export-csv'),
    detailExportExcel: document.getElementById('detail-export-excel'),
    
    // 日历模态框
    calendarModal: document.getElementById('calendar-modal'),
    calendarTitle: document.getElementById('calendar-title'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    calendarDays: document.getElementById('calendar-days'),
    closeCalendar: document.getElementById('close-calendar'),
    selectDate: document.getElementById('select-date'),
    
    // 重置密码模态框
    resetModal: document.getElementById('reset-modal'),
    resetEmail: document.getElementById('reset-email'),
    cancelReset: document.getElementById('cancel-reset'),
    sendReset: document.getElementById('send-reset')
};

// 图表实例
let profitChart = null;
let incomeChart = null;
let expenseChart = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    addEventListeners();
});

// 初始化认证状态
function initAuth() {
    showLoading();
    
    // 检查本地存储中的用户凭据
    const savedEmail = localStorage.getItem('userEmail');
    const savedPassword = localStorage.getItem('userPassword');
    
    if (savedEmail && savedPassword) {
        // 尝试自动登录
        auth.signInWithEmailAndPassword(savedEmail, savedPassword)
            .catch(error => {
                console.error('自动登录失败:', error);
                hideLoading();
            });
    } else {
        hideLoading();
    }
    
    // 监听认证状态变化
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            onLogin();
        } else {
            currentUser = null;
            showLoginUI();
        }
    });
}

// 注册事件监听器
function addEventListeners() {
    // 登录相关
    elements.loginBtn.addEventListener('click', login);
    elements.registerBtn.addEventListener('click', register);
    elements.forgotPassword.addEventListener('click', showResetModal);
    elements.logoutBtn.addEventListener('click', logout);
    
    // 重置密码模态框
    elements.cancelReset.addEventListener('click', hideResetModal);
    elements.sendReset.addEventListener('click', resetPassword);
    
    // 日期导航
    elements.prevDayBtn.addEventListener('click', () => navigateDay(-1));
    elements.nextDayBtn.addEventListener('click', () => navigateDay(1));
    elements.todayBtn.addEventListener('click', goToday);
    elements.currentDateEl.addEventListener('click', showCalendarModal);
    
    // 添加记录
    elements.addRecordBtn.addEventListener('click', showAddModal);
    elements.cancelAdd.addEventListener('click', hideAddModal);
    elements.saveRecord.addEventListener('click', saveRecord);
    
    // 记录类型切换
    elements.incomeBtn.addEventListener('click', () => {
        selectRecordType('income');
    });
    elements.expenseBtn.addEventListener('click', () => {
        selectRecordType('expense');
    });
    
    // 类别选择
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectCategory(btn);
        });
    });
    
    // 详细数据
    elements.detailsBtn.addEventListener('click', showDetailsModal);
    elements.closeDetails.addEventListener('click', hideDetailsModal);
    elements.rangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectDateRange(btn.dataset.range);
        });
    });
    elements.applyRange.addEventListener('click', applyCustomRange);
    elements.prevPage.addEventListener('click', prevPage);
    elements.nextPage.addEventListener('click', nextPage);
    
    // 日历模态框
    elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
    elements.nextMonth.addEventListener('click', () => navigateMonth(1));
    elements.closeCalendar.addEventListener('click', hideCalendarModal);
    elements.selectDate.addEventListener('click', selectCalendarDate);
    
    // 导出功能
    elements.exportBtn.addEventListener('click', toggleExportDropdown);
    elements.exportCSV.addEventListener('click', () => exportData('csv', false));
    elements.exportExcel.addEventListener('click', () => exportData('excel', false));
    elements.detailExportBtn.addEventListener('click', toggleDetailExportDropdown);
    elements.detailExportCSV.addEventListener('click', () => exportData('csv', true));
    elements.detailExportExcel.addEventListener('click', () => exportData('excel', true));
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!e.target.matches('#export-btn') && !e.target.matches('#detail-export-btn')) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                if (!dropdown.classList.contains('hidden')) {
                    dropdown.classList.add('hidden');
                }
            });
        }
    });
}

// 登录
function login() {
    const email = elements.email.value.trim();
    const password = elements.password.value;
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    showLoading();
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            // 保存用户凭据到本地存储实现自动登录
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
        })
        .catch(error => {
            hideLoading();
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                alert('邮箱或密码错误');
            } else {
                alert('登录失败: ' + error.message);
            }
        });
}

// 注册
function register() {
    const email = elements.email.value.trim();
    const password = elements.password.value;
    
    if (!email || !password) {
        alert('请输入邮箱和密码');
        return;
    }
    
    if (password.length < 6) {
        alert('密码长度至少为6位');
        return;
    }
    
    showLoading();
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            // 保存用户凭据到本地存储实现自动登录
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
        })
        .catch(error => {
            hideLoading();
            if (error.code === 'auth/email-already-in-use') {
                alert('该邮箱已被注册');
            } else {
                alert('注册失败: ' + error.message);
            }
        });
}

// 登出
function logout() {
    auth.signOut()
        .then(() => {
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPassword');
        })
        .catch(error => {
            console.error('登出失败:', error);
        });
}

// 显示重置密码模态框
function showResetModal() {
    elements.resetModal.classList.remove('hidden');
    elements.resetEmail.value = elements.email.value || '';
}

// 隐藏重置密码模态框
function hideResetModal() {
    elements.resetModal.classList.add('hidden');
}

// 发送重置密码邮件
function resetPassword() {
    const email = elements.resetEmail.value.trim();
    
    if (!email) {
        alert('请输入邮箱');
        return;
    }
    
    showLoading();
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            hideLoading();
            alert('重置密码邮件已发送，请查收');
            hideResetModal();
        })
        .catch(error => {
            hideLoading();
            if (error.code === 'auth/user-not-found') {
                alert('该邮箱未注册');
            } else {
                alert('发送失败: ' + error.message);
            }
        });
}

// 登录成功后的处理
function onLogin() {
    showMainUI();
    loadRecords();
    updateDateDisplay();
}

// 显示登录界面
function showLoginUI() {
    elements.loginContainer.classList.remove('hidden');
    elements.mainContainer.classList.add('hidden');
}

// 显示主界面
function showMainUI() {
    elements.loginContainer.classList.add('hidden');
    elements.mainContainer.classList.remove('hidden');
}

// 显示加载动画
function showLoading() {
    elements.loadingSpinner.classList.remove('hidden');
}

// 隐藏加载动画
function hideLoading() {
    elements.loadingSpinner.classList.add('hidden');
}

// 日期导航
function navigateDay(days) {
    currentDate = new Date(currentDate.getTime());
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    loadRecords();
}

// 切换到今天
function goToday() {
    currentDate = new Date();
    updateDateDisplay();
    loadRecords();
}

// 更新日期显示
function updateDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateStr = currentDate.toLocaleDateString('zh-CN', options);
    elements.dateText.textContent = dateStr;
}

// 记录管理相关函数
// 加载记录
function loadRecords() {
    showLoading();
    
    // 获取当前日期的开始和结束时间戳
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const startTimestamp = startOfDay.getTime();
    const endTimestamp = endOfDay.getTime();
    
    // 从Firebase获取记录
    database.ref(`records/${currentUser.uid}`)
        .orderByChild('timestamp')
        .startAt(startTimestamp)
        .endAt(endTimestamp)
        .once('value')
        .then(snapshot => {
            records = [];
            
            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                record.id = childSnapshot.key;
                records.push(record);
            });
            
            // 按时间戳排序
            records.sort((a, b) => b.timestamp - a.timestamp);
            
            displayRecords();
            updateDailyTotals();
            hideLoading();
        })
        .catch(error => {
            console.error('加载记录失败:', error);
            hideLoading();
            alert('加载记录失败，请检查网络连接');
        });
}

// 显示记录
function displayRecords() {
    elements.recordsList.innerHTML = '';
    
    if (records.length === 0) {
        elements.recordsList.innerHTML = '<div class="empty-records">暂无记录</div>';
        return;
    }
    
    records.forEach(record => {
        const recordElement = createRecordElement(record);
        elements.recordsList.appendChild(recordElement);
    });
}

// 创建记录元素
function createRecordElement(record) {
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    
    const recordInfo = document.createElement('div');
    recordInfo.className = 'record-info';
    
    const category = document.createElement('div');
    category.className = 'record-category';
    category.textContent = record.category;
    
    const date = document.createElement('div');
    date.className = 'record-date';
    date.textContent = new Date(record.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    recordInfo.appendChild(category);
    recordInfo.appendChild(date);
    
    const amountWrapper = document.createElement('div');
    amountWrapper.className = 'amount-wrapper';
    
    const amount = document.createElement('span');
    amount.className = `record-amount ${record.type === 'income' ? 'income' : 'expense'}`;
    amount.textContent = formatCurrency(record.amount, record.type);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    deleteBtn.addEventListener('click', () => {
        if (confirm('确定要删除这条记录吗？')) {
            deleteRecord(record.id);
        }
    });
    
    amountWrapper.appendChild(amount);
    amountWrapper.appendChild(deleteBtn);
    
    recordItem.appendChild(recordInfo);
    recordItem.appendChild(amountWrapper);
    
    return recordItem;
}

// 计算并更新每日总额
function updateDailyTotals() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    records.forEach(record => {
        if (record.type === 'income') {
            totalIncome += record.amount;
        } else {
            totalExpense += record.amount;
        }
    });
    
    const profit = totalIncome - totalExpense;
    
    elements.dailyIncome.textContent = formatCurrency(totalIncome);
    elements.dailyExpense.textContent = formatCurrency(totalExpense);
    elements.dailyProfit.textContent = formatCurrency(profit);
    
    // 设置利润颜色
    if (profit > 0) {
        elements.dailyProfit.className = 'amount profit';
    } else if (profit < 0) {
        elements.dailyProfit.className = 'amount expense';
    } else {
        elements.dailyProfit.className = 'amount';
    }
}

// 格式化货币
function formatCurrency(amount, type) {
    const prefix = type === 'expense' ? '-' : '';
    return `${prefix}¥${amount.toFixed(2)}`;
}

// 添加记录相关函数
// 显示添加记录模态框
function showAddModal() {
    resetAddModal();
    elements.addModal.classList.remove('hidden');
}

// 隐藏添加记录模态框
function hideAddModal() {
    elements.addModal.classList.add('hidden');
}

// 重置添加记录模态框
function resetAddModal() {
    elements.amountInput.value = '';
    selectRecordType('income');
    elements.categoryBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedCategory = '';
}

// 选择记录类型
function selectRecordType(type) {
    selectedRecordType = type;
    
    if (type === 'income') {
        elements.incomeBtn.classList.add('selected');
        elements.expenseBtn.classList.remove('selected');
        elements.incomeCategories.classList.remove('hidden');
        elements.expenseCategories.classList.add('hidden');
    } else {
        elements.incomeBtn.classList.remove('selected');
        elements.expenseBtn.classList.add('selected');
        elements.incomeCategories.classList.add('hidden');
        elements.expenseCategories.classList.remove('hidden');
    }
    
    // 重置类别选择
    elements.categoryBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedCategory = '';
}

// 选择类别
function selectCategory(btn) {
    elements.categoryBtns.forEach(button => {
        button.classList.remove('selected');
    });
    
    btn.classList.add('selected');
    selectedCategory = btn.dataset.category;
}

// 保存记录
function saveRecord() {
    const amount = parseFloat(elements.amountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        alert('请输入有效金额');
        return;
    }
    
    if (!selectedCategory) {
        alert('请选择类别');
        return;
    }
    
    const record = {
        type: selectedRecordType,
        category: selectedCategory,
        amount: amount,
        timestamp: new Date().getTime(),
        date: currentDate.toISOString().split('T')[0]
    };
    
    showLoading();
    
    // 保存到Firebase
    database.ref(`records/${currentUser.uid}`).push(record)
        .then(() => {
            hideLoading();
            hideAddModal();
            loadRecords();
        })
        .catch(error => {
            hideLoading();
            console.error('保存记录失败:', error);
            alert('保存记录失败，请检查网络连接');
        });
}

// 删除记录
function deleteRecord(id) {
    showLoading();
    
    database.ref(`records/${currentUser.uid}/${id}`).remove()
        .then(() => {
            hideLoading();
            loadRecords();
        })
        .catch(error => {
            hideLoading();
            console.error('删除记录失败:', error);
            alert('删除记录失败，请检查网络连接');
        });
}

// 日历相关函数
// 显示日历模态框
function showCalendarModal() {
    calendarDate = new Date(currentDate);
    updateCalendarDisplay();
    elements.calendarModal.classList.remove('hidden');
}

// 隐藏日历模态框
function hideCalendarModal() {
    elements.calendarModal.classList.add('hidden');
}

// 更新日历显示
function updateCalendarDisplay() {
    // 更新标题
    const yearMonth = calendarDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
    elements.calendarTitle.textContent = yearMonth;
    
    // 获取月份的第一天和最后一天
    const firstDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const lastDay = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0);
    
    // 获取第一天是星期几（0-6，0表示星期日）
    const firstDayOfWeek = firstDay.getDay();
    
    // 清空日历
    elements.calendarDays.innerHTML = '';
    
    // 添加前一个月的空白天数
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        elements.calendarDays.appendChild(emptyDay);
    }
    
    // 添加当月的天数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = i;
        
        const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i);
        
        // 如果是今天，添加今天的样式
        if (date.getTime() === today.getTime()) {
            day.classList.add('today');
        }
        
        // 如果是当前选中的日期，添加选中的样式
        if (date.getTime() === currentDate.setHours(0, 0, 0, 0)) {
            day.classList.add('selected');
            selectedDate = new Date(date);
        }
        
        // 添加点击事件
        day.addEventListener('click', () => {
            // 移除之前选中的日期样式
            document.querySelectorAll('.day.selected').forEach(el => {
                el.classList.remove('selected');
            });
            
            // 添加选中的样式
            day.classList.add('selected');
            selectedDate = new Date(date);
        });
        
        elements.calendarDays.appendChild(day);
    }
}

// 导航月份
function navigateMonth(months) {
    calendarDate.setMonth(calendarDate.getMonth() + months);
    updateCalendarDisplay();
}

// 选择日历中的日期
function selectCalendarDate() {
    if (selectedDate) {
        currentDate = new Date(selectedDate);
        updateDateDisplay();
        loadRecords();
        hideCalendarModal();
    }
}

// 导出下拉菜单
function toggleExportDropdown() {
    const dropdown = elements.exportBtn.nextElementSibling;
    dropdown.classList.toggle('hidden');
}

// 详细数据导出下拉菜单
function toggleDetailExportDropdown() {
    const dropdown = elements.detailExportBtn.nextElementSibling;
    dropdown.classList.toggle('hidden');
}

// 详细数据相关函数
// 显示详细数据模态框
function showDetailsModal() {
    // 初始化日期范围选择器
    const today = new Date();
    elements.endDate.value = today.toISOString().split('T')[0];
    
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    elements.startDate.value = lastMonth.toISOString().split('T')[0];
    
    // 默认选择最近30天
    selectDateRange('30');
    
    elements.detailsModal.classList.remove('hidden');
}

// 隐藏详细数据模态框
function hideDetailsModal() {
    elements.detailsModal.classList.add('hidden');
}

// 选择日期范围
function selectDateRange(range) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    
    elements.rangeBtns.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.range === range) {
            btn.classList.add('selected');
        }
    });
    
    switch (range) {
        case '7':
            startDate.setDate(today.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            break;
        case '30':
            startDate.setDate(today.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            break;
        case '90':
            startDate.setDate(today.getDate() - 90);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'this-month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'last-month':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            startDate.setHours(0, 0, 0, 0);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            endOfLastMonth.setHours(23, 59, 59, 999);
            today.setTime(endOfLastMonth.getTime());
            break;
        case 'this-year':
            startDate = new Date(today.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        default:
            break;
    }
    
    // 更新日期输入框
    elements.startDate.value = startDate.toISOString().split('T')[0];
    elements.endDate.value = today.toISOString().split('T')[0];
    
    // 更新日期范围对象
    detailDateRange.startDate = startDate;
    detailDateRange.endDate = today;
    
    // 加载详细数据
    loadDetailRecords();
}

// 应用自定义日期范围
function applyCustomRange() {
    const startDate = new Date(elements.startDate.value);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(elements.endDate.value);
    endDate.setHours(23, 59, 59, 999);
    
    if (startDate > endDate) {
        alert('开始日期不能大于结束日期');
        return;
    }
    
    // 清除范围按钮的选中状态
    elements.rangeBtns.forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 更新日期范围对象
    detailDateRange.startDate = startDate;
    detailDateRange.endDate = endDate;
    
    // 加载详细数据
    loadDetailRecords();
}

// 加载详细数据记录
function loadDetailRecords() {
    showLoading();
    
    // 获取日期范围的开始和结束时间戳
    const startTimestamp = detailDateRange.startDate.getTime();
    const endTimestamp = detailDateRange.endDate.getTime();
    
    // 从Firebase获取记录
    database.ref(`records/${currentUser.uid}`)
        .orderByChild('timestamp')
        .startAt(startTimestamp)
        .endAt(endTimestamp)
        .once('value')
        .then(snapshot => {
            filteredRecords = [];
            
            snapshot.forEach(childSnapshot => {
                const record = childSnapshot.val();
                record.id = childSnapshot.key;
                filteredRecords.push(record);
            });
            
            // 按时间戳排序
            filteredRecords.sort((a, b) => b.timestamp - a.timestamp);
            
            // 重置分页
            currentPage = 1;
            
            updateDetailTotals();
            displayDetailRecords();
            updateCharts();
            updatePagination();
            hideLoading();
        })
        .catch(error => {
            console.error('加载详细记录失败:', error);
            hideLoading();
            alert('加载详细记录失败，请检查网络连接');
        });
}

// 计算并更新详细数据总额
function updateDetailTotals() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredRecords.forEach(record => {
        if (record.type === 'income') {
            totalIncome += record.amount;
        } else {
            totalExpense += record.amount;
        }
    });
    
    const profit = totalIncome - totalExpense;
    
    elements.totalIncome.textContent = formatCurrency(totalIncome);
    elements.totalExpense.textContent = formatCurrency(totalExpense);
    elements.totalProfit.textContent = formatCurrency(profit);
    
    // 设置利润颜色
    if (profit > 0) {
        elements.totalProfit.className = 'amount profit';
    } else if (profit < 0) {
        elements.totalProfit.className = 'amount expense';
    } else {
        elements.totalProfit.className = 'amount';
    }
}

// 显示详细数据记录
function displayDetailRecords() {
    elements.detailRecordsList.innerHTML = '';
    
    if (filteredRecords.length === 0) {
        elements.detailRecordsList.innerHTML = '<div class="empty-records">暂无记录</div>';
        return;
    }
    
    // 计算当前页的记录
    const start = (currentPage - 1) * recordsPerPage;
    const end = Math.min(start + recordsPerPage, filteredRecords.length);
    const pageRecords = filteredRecords.slice(start, end);
    
    pageRecords.forEach(record => {
        const recordElement = createDetailRecordElement(record);
        elements.detailRecordsList.appendChild(recordElement);
    });
}

// 创建详细数据记录元素
function createDetailRecordElement(record) {
    const recordItem = document.createElement('div');
    recordItem.className = 'record-item';
    
    const recordInfo = document.createElement('div');
    recordInfo.className = 'record-info';
    
    const category = document.createElement('div');
    category.className = 'record-category';
    category.textContent = record.category;
    
    const date = document.createElement('div');
    date.className = 'record-date';
    date.textContent = new Date(record.timestamp).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    recordInfo.appendChild(category);
    recordInfo.appendChild(date);
    
    const amount = document.createElement('div');
    amount.className = `record-amount ${record.type === 'income' ? 'income' : 'expense'}`;
    amount.textContent = formatCurrency(record.amount, record.type);
    
    recordItem.appendChild(recordInfo);
    recordItem.appendChild(amount);
    
    return recordItem;
}

// 更新分页信息
function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    elements.pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    
    // 更新上一页/下一页按钮状态
    elements.prevPage.disabled = currentPage <= 1;
    elements.nextPage.disabled = currentPage >= totalPages;
}

// 上一页
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayDetailRecords();
        updatePagination();
    }
}

// 下一页
function nextPage() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayDetailRecords();
        updatePagination();
    }
}

// 更新图表
function updateCharts() {
    const dates = [];
    const incomeData = {};
    const expenseData = {};
    
    // 初始化日期范围内的每一天
    let currentDate = new Date(detailDateRange.startDate);
    while (currentDate <= detailDateRange.endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dates.push(dateStr);
        incomeData[dateStr] = 0;
        expenseData[dateStr] = 0;
        
        // 增加一天
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 按日期分组记录
    filteredRecords.forEach(record => {
        const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
        
        if (record.type === 'income') {
            incomeData[recordDate] = (incomeData[recordDate] || 0) + record.amount;
        } else {
            expenseData[recordDate] = (expenseData[recordDate] || 0) + record.amount;
        }
    });
    
    // 限制数据点数量，最多显示10个刻度
    let interval = 1;
    if (dates.length > 10) {
        interval = Math.ceil(dates.length / 10);
    }
    
    const filteredDates = [];
    const filteredIncomeData = [];
    const filteredExpenseData = [];
    const filteredProfitData = [];
    
    // 筛选数据点
    for (let i = 0; i < dates.length; i += interval) {
        const dateStr = dates[i];
        const income = incomeData[dateStr] || 0;
        const expense = expenseData[dateStr] || 0;
        const profit = income - expense;
        
        filteredDates.push(dateStr);
        filteredIncomeData.push(income);
        filteredExpenseData.push(expense);
        filteredProfitData.push(profit);
    }
    
    // 格式化日期显示
    const formattedDates = filteredDates.map(dateStr => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // 更新利润图表
    profitChart = updateChart('profit-chart', profitChart, formattedDates, filteredProfitData, '利润', 'rgba(0, 122, 255, 0.2)', 'rgba(0, 122, 255, 1)');
    
    // 更新收入图表
    incomeChart = updateChart('income-chart', incomeChart, formattedDates, filteredIncomeData, '收入', 'rgba(52, 199, 89, 0.2)', 'rgba(52, 199, 89, 1)');
    
    // 更新费用图表
    expenseChart = updateChart('expense-chart', expenseChart, formattedDates, filteredExpenseData, '费用', 'rgba(255, 59, 48, 0.2)', 'rgba(255, 59, 48, 1)');
}

// 更新单个图表
function updateChart(chartId, chartInstance, labels, data, label, backgroundColor, borderColor) {
    const ctx = document.getElementById(chartId).getContext('2d');
    
    // 销毁现有图表实例
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // 创建新图表
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ¥${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// 数据导出相关函数
// 导出数据
function exportData(type, isDetail) {
    // 确定要导出的记录
    const recordsToExport = isDetail ? filteredRecords : records;
    
    if (recordsToExport.length === 0) {
        alert('暂无记录可导出');
        return;
    }
    
    // 准备导出数据
    const exportData = recordsToExport.map(record => {
        const date = new Date(record.timestamp);
        return {
            '日期': date.toLocaleDateString('zh-CN'),
            '时间': date.toLocaleTimeString('zh-CN'),
            '类型': record.type === 'income' ? '收入' : '费用',
            '类别': record.category,
            '金额': record.amount.toFixed(2)
        };
    });
    
    // 根据类型导出
    if (type === 'csv') {
        exportToCSV(exportData);
    } else {
        exportToExcel(exportData);
    }
}

// 导出为CSV
function exportToCSV(data) {
    // 获取表头
    const headers = Object.keys(data[0]);
    
    // 生成CSV内容
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // 如果值包含逗号、双引号或换行符，则用双引号包围
            if (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n')) {
                return `"${value.toString().replace(/"/g, '""')}"`;
            }
            return value;
        });
        
        csvContent += values.join(',') + '\n';
    });
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 下载文件
    downloadFile(blob, `外卖记账_${new Date().toLocaleDateString('zh-CN')}.csv`);
}

// 导出为Excel
function exportToExcel(data) {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '外卖记账');
    
    // 生成Excel文件并下载
    XLSX.writeFile(wb, `外卖记账_${new Date().toLocaleDateString('zh-CN')}.xlsx`);
}

// 下载文件
function downloadFile(blob, fileName) {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // 模拟点击下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 