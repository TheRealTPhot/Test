// Initialize variables
let userId = null;
let userData = {
    limit: 60,
    weeklyData: Array(7).fill(0),
    appUsage: {},
    badges: {},
    completedActivities: {},
    customActivities: [],
    loginStreak: 0,
    underLimitStreak: 0,
    learningStreak: 0,
    readingStreak: 0,
    exerciseStreak: 0,
    checkinStreak: 0,
    lastCheckinDate: null,
    checkinHistory: {}, // New property to store check-in history
    quizScores: { physical: 0, mental: 0, concentration: 0 },
    quizHistory: [],
    lastLoginDate: null,
    lastActivityDate: null,
    activityHistory: {} // New property to store activity history
};

const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

const socialApps = [
    { id: 'facebook', name: 'Facebook', color: '#1877f2', iconClass: 'fa-brands fa-facebook' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F', iconClass: 'fa-brands fa-instagram' },
    { id: 'tiktok', name: 'TikTok', color: '#000000', iconClass: 'fa-brands fa-tiktok' },
    { id: 'twitter', name: 'Twitter', color: '#1DA1F2', iconClass: 'fa-brands fa-x-twitter' },
    { id: 'threads', name: 'Threads', color: '#000000', iconClass: 'fa-brands fa-threads' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', iconClass: 'fa-brands fa-youtube' },
];

const defaultHealthyActivities = [
    { id: 'reading', name: 'Đọc sách 30 phút' },
    { id: 'exercise', name: 'Tập thể dục 15 phút' },
    { id: 'learning', name: 'Học tập 60 phút' },
    { id: 'music', name: 'Thư giãn với âm nhạc 10 phút' },
    { id: 'conversation', name: 'Trò chuyện trực tiếp' },
    { id: 'pre_sleep_tech_free', name: 'Không sử dụng điện thoại 30 phút trước khi ngủ' },
    { id: 'post_wake_tech_free', name: 'Không sử dụng mạng xã hội ngay khi vừa ngủ dậy' }
];

const allBadges = [
    { id: 'first_day', name: 'Ngày đầu tiên', description: 'Đăng nhập vào ứng dụng', icon: '☀️' },
    { id: 'under_limit_1', name: 'Kiểm soát tốt', description: 'Giữ thời gian dưới giới hạn trong 1 ngày', icon: '✅' },
    { id: 'under_limit_5', name: 'Chuỗi 5 ngày', description: 'Giữ thời gian dưới giới hạn trong 5 ngày liên tiếp', icon: '🏅' },
    { id: 'under_limit_10', name: 'Chuyên gia kỷ luật', description: 'Giữ thời gian dưới giới hạn trong 10 ngày liên tiếp', icon: '🥇' },
    { id: 'under_limit_20', name: 'Thống trị', description: 'Giữ thời gian dưới giới hạn trong 20 ngày liên tiếp', icon: '👑' },
    { id: 'first_activity', name: 'Hoạt động đầu tiên', description: 'Hoàn thành hoạt động lành mạnh đầu tiên', icon: '🌱' },
    { id: 'all_activities', name: 'Toàn năng', description: 'Hoàn thành tất cả hoạt động lành mạnh trong một ngày', icon: '🌟' },
    { id: 'quiz_pro', name: 'Chuyên gia sức khỏe', description: 'Hoàn thành bài kiểm tra sức khỏe', icon: '🧠' },
    { id: 'dependency_low_50', name: 'Tự chủ số', description: 'Đạt điểm phụ thuộc mạng xã hội dưới 50%', icon: '⚖️' },
    { id: 'dependency_low_40', name: 'Giải phóng', description: 'Đạt điểm phụ thuộc mạng xã hội dưới 40%', icon: '🕊️' },
    { id: 'dependency_low_30', name: 'Chủ nhân cuộc sống', description: 'Đạt điểm phụ thuộc mạng xã hội dưới 30%', icon: '🔮' },
    { id: 'login_streak_5', name: 'Kiên trì 5', description: 'Đăng nhập 5 ngày liên tiếp', icon: '🔥' },
    { id: 'login_streak_10', name: 'Kiên trì 10', description: 'Đăng nhập 10 ngày liên tiếp', icon: '⚡' },
    { id: 'login_streak_20', name: 'Kiên trì 20', description: 'Đăng nhập 20 ngày liên tiếp', icon: '🚀' },
    { id: 'learning_streak_5', name: 'Chuỗi học tập 5', description: 'Hoàn thành hoạt động học tập 5 ngày liên tiếp', icon: '📖' },
    { id: 'learning_streak_10', name: 'Chuỗi học tập 10', description: 'Hoàn thành hoạt động học tập 10 ngày liên tiếp', icon: '🎓' },
    { id: 'reading_streak_5', name: 'Chuỗi đọc sách 5', description: 'Hoàn thành hoạt động đọc sách 5 ngày liên tiếp', icon: '📕' },
    { id: 'reading_streak_10', name: 'Chuỗi đọc sách 10', description: 'Hoàn thành hoạt động đọc sách 10 ngày liên tiếp', icon: '📚' },
    { id: 'exercise_streak_5', name: 'Chuỗi tập thể dục 5', description: 'Hoàn thành hoạt động tập thể dục 5 ngày liên tiếp', icon: '💪' },
    { id: 'exercise_streak_10', name: 'Chuỗi tập thể dục 10', description: 'Hoàn thành hoạt động tập thể dục 10 ngày liên tiếp', icon: '🏋️' },
    { id: 'custom_activity', name: 'Sáng tạo', description: 'Thêm một hoạt động lành mạnh của riêng bạn', icon: '🎨' },
    { id: 'checkin_streak_5', name: 'Điểm danh 5 ngày', description: 'Điểm danh 5 ngày liên tiếp', icon: '📅' },
    { id: 'checkin_streak_10', name: 'Điểm danh 10 ngày', description: 'Điểm danh 10 ngày liên tiếp', icon: '📆' },
    { id: 'checkin_streak_20', name: 'Điểm danh 20 ngày', description: 'Điểm danh 20 ngày liên tiếp', icon: '🗓️' },
];

const quizQuestions = {
    physical: [
        { q: "Bạn có thường xuyên cảm thấy đau đầu, mỏi mắt, hoặc đau cổ, vai, gáy không?", score: [1, 2, 3, 4, 5] },
        { q: "Giấc ngủ của bạn có bị gián đoạn hoặc khó ngủ do sử dụng thiết bị điện tử không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có thường xuyên cảm thấy cơ thể mệt mỏi, uể oải ngay cả khi không làm việc nặng nhọc không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có cảm thấy khó khăn khi rời khỏi màn hình để tham gia các hoạt động thể chất không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có thường xuyên có những bữa ăn qua loa để tiếp tục lướt mạng không?", score: [1, 2, 3, 4, 5] },
    ],
    mental: [
        { q: "Bạn có thường xuyên cảm thấy lo lắng, căng thẳng hoặc dễ cáu gắt không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có cảm thấy áp lực phải thể hiện một hình ảnh hoàn hảo trên mạng không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có cảm thấy buồn bã hoặc trống rỗng khi không được lướt mạng không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có cảm thấy lo sợ mình sẽ bỏ lỡ các xu hướng, tin tức trên mạng xã hội không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có thấy mình dễ dàng so sánh bản thân với người khác trên mạng xã hội không?", score: [1, 2, 3, 4, 5] },
    ],
    concentration: [
        { q: "Bạn có dễ bị xao nhãng bởi điện thoại khi đang làm việc/học tập không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có kiểm tra điện thoại ngay khi nhận được thông báo không?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có cảm thấy khó khăn khi phải tập trung vào một cuộc trò chuyện trực tiếp?", score: [1, 2, 3, 4, 5] },
        { q: "Bạn có thể hoàn thành một nhiệm vụ mà không bị gián đoạn không?", score: [5, 4, 3, 2, 1] },
        { q: "Bạn có thể đọc một cuốn sách mà không cần phải cầm điện thoại không?", score: [5, 4, 3, 2, 1] },
    ],
};

const quizOptions = ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Thường xuyên", "Luôn luôn"];

// Pomodoro Timer Variables
const pomodoro = {
    workDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    timer: null,
    isWorkTime: true,
    isRunning: false,
    timeRemaining: 0,
    intervalId: null
};

// Countdown Timer Variables
let countdownInterval = null;
let currentHistoryDate = new Date();

// Initialize localStorage
function initLocalStorage() {
    if (!localStorage.getItem('userId')) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    } else {
        userId = localStorage.getItem('userId');
    }

    const savedData = localStorage.getItem('userData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Initialize activityHistory if it doesn't exist
        if (!userData.activityHistory) {
            userData.activityHistory = {};
            saveData();
        }
        
        // Initialize checkinHistory if it doesn't exist
        if (!userData.checkinHistory) {
            userData.checkinHistory = {};
            saveData();
        }
        
        // Initialize checkinStreak if it doesn't exist
        if (userData.checkinStreak === undefined) {
            userData.checkinStreak = 0;
            saveData();
        }
        
        // Initialize lastCheckinDate if it doesn't exist
        if (!userData.lastCheckinDate) {
            userData.lastCheckinDate = null;
            saveData();
        }
    } else {
        saveData();
    }
    
    // Check for activity reset
    checkActivityReset();
}

function saveData() {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Check if activities need to be reset (at 6:00 AM GMT+7)
function checkActivityReset() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const lastResetDate = userData.lastResetDate || '';
    
    // Get current time in GMT+7
    const gmt7Hours = (now.getUTCHours() + 7) % 24;
    const gmt7Minutes = now.getUTCMinutes();
    
    // Check if it's 6:00 AM or later and we haven't reset today
    if (today !== lastResetDate && gmt7Hours >= 6) {
        // Save today's activities to history before reset
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        
        if (!userData.activityHistory[yesterdayStr]) {
            userData.activityHistory[yesterdayStr] = {};
        }
        
        // Save completed activities to history
        Object.keys(userData.completedActivities).forEach(activityId => {
            if (userData.completedActivities[activityId] === today) {
                userData.activityHistory[yesterdayStr][activityId] = true;
            }
        });
        
        // Check if user stayed under limit yesterday
        const yesterdayIndex = (yesterday.getDay() + 6) % 7; // Convert to 0=Mon, 1=Tue, ..., 6=Sun
        const yesterdayUsage = userData.weeklyData[yesterdayIndex] || 0;
        const userLimit = userData.limit || 60;
        
        if (yesterdayUsage <= userLimit) {
            // Increment under limit streak
            userData.underLimitStreak = (userData.underLimitStreak || 0) + 1;
            
            // Award badges based on streak
            if (userData.underLimitStreak >= 1) awardBadge('under_limit_1');
            if (userData.underLimitStreak >= 5) awardBadge('under_limit_5');
            if (userData.underLimitStreak >= 10) awardBadge('under_limit_10');
            if (userData.underLimitStreak >= 20) awardBadge('under_limit_20');
            
            showNotification("Thành Tựu Mới!", `Bạn đã giữ thời gian sử dụng dưới giới hạn trong ${userData.underLimitStreak} ngày!`);
        } else {
            // Reset streak if over limit
            userData.underLimitStreak = 0;
        }
        
        // Reset completed activities
        userData.completedActivities = {};
        userData.lastResetDate = today;
        saveData();
        
        // Show notification
        showNotification("Reset Hoạt Động", "Hoạt động lành mạnh đã được reset cho ngày mới!");
    }
}

// Update countdown timer to 6:00 AM GMT+7
function updateCountdownTimer() {
    const now = new Date();
    
    // Get current time in GMT+7
    const gmt7Hours = (now.getUTCHours() + 7) % 24;
    const gmt7Minutes = now.getUTCMinutes();
    const gmt7Seconds = now.getUTCSeconds();
    
    // Calculate time until 6:00 AM GMT+7
    let hoursUntilReset = 0;
    let minutesUntilReset = 0;
    let secondsUntilReset = 0;
    
    if (gmt7Hours < 6) {
        // Current time is before 6:00 AM
        hoursUntilReset = 6 - gmt7Hours - 1;
        minutesUntilReset = 60 - gmt7Minutes - 1;
        secondsUntilReset = 60 - gmt7Seconds;
    } else {
        // Current time is after 6:00 AM, calculate until tomorrow
        hoursUntilReset = 24 - gmt7Hours + 6 - 1;
        minutesUntilReset = 60 - gmt7Minutes - 1;
        secondsUntilReset = 60 - gmt7Seconds;
    }
    
    // Format the time as HH:MM:SS
    const formattedTime = 
        String(hoursUntilReset).padStart(2, '0') + ':' +
        String(minutesUntilReset).padStart(2, '0') + ':' +
        String(secondsUntilReset).padStart(2, '0');
    
    document.getElementById('countdown-timer').textContent = formattedTime;
}

// Start countdown timer
function startCountdownTimer() {
    // Update immediately
    updateCountdownTimer();
    
    // Update every second
    countdownInterval = setInterval(updateCountdownTimer, 1000);
}

// Format date as dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Update activity history display
function updateActivityHistory() {
    const dateStr = currentHistoryDate.toISOString().slice(0, 10);
    document.getElementById('history-date-display').textContent = formatDate(currentHistoryDate);
    
    const allActivities = defaultHealthyActivities.concat(userData.customActivities || []);
    const completedActivities = userData.activityHistory[dateStr] || {};
    
    document.getElementById('activity-history-container').innerHTML = allActivities.map(activity => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <p class="text-gray-700">${activity.name}</p>
            <span class="px-4 py-1 rounded-full text-sm font-semibold 
                ${completedActivities[activity.id] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}">
                ${completedActivities[activity.id] ? 'Đã Xong' : 'Chưa làm'}
            </span>
        </div>
    `).join('');
}

// Update check-in streak visualization
function updateCheckinStreakVisualization() {
    const container = document.getElementById('checkin-streak-container');
    if (!container) return;
    
    // Get the last 7 days
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().slice(0, 10));
    }
    
    // Day names
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    container.innerHTML = days.map((dateStr, index) => {
        const dayName = dayNames[new Date(dateStr).getDay()];
        const hasCheckedIn = userData.checkinHistory[dateStr] || false;
        
        return `
            <div class="day-item">
                <i class="fas fa-fire fire-icon ${hasCheckedIn ? 'fire-active' : 'fire-inactive'}"></i>
                <span class="text-xs text-gray-600">${dayName}</span>
            </div>
        `;
    }).join('');
}

// Initialize app
function initApp() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const mainContent = document.getElementById('main-content');
    const surveyContent = document.getElementById('survey-content');
    
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    if (surveyContent) surveyContent.classList.remove('hidden');

    if (document.getElementById('user-id-display')) {
        document.getElementById('user-id-display').textContent = userId;
        updateMainUI();
        startCountdownTimer();
    }
    
    if (document.getElementById('quiz-content')) {
        updateSurveyUI();
    }
}

// Update Main Page UI
function updateMainUI() {
    // Update dashboard
    const totalUsageToday = userData.weeklyData[todayIndex] || 0;
    document.getElementById('current-usage-display').textContent = `${totalUsageToday}p`;
    const limit = userData.limit || 60;
    document.getElementById('limit-input').value = limit;
    document.getElementById('limit-message').innerHTML = `Giới hạn: <strong>${limit}p</strong>`;

    const percentage = Math.min((totalUsageToday / limit) * 100, 100);
    document.getElementById('progress-bar').style.width = `${percentage}%`;

    if (totalUsageToday >= limit) {
        document.getElementById('limit-message').innerHTML = `<span class="font-bold text-red-300">Bạn đã vượt quá giới hạn!</span>`;
    } else if (totalUsageToday > 0) {
        document.getElementById('limit-message').innerHTML = `Còn lại: <strong>${Math.max(0, limit - totalUsageToday)}p</strong>`;
    }

    // Update app usage inputs
    const allApps = socialApps.concat(userData.customApps || []);
    document.getElementById('app-input-container').innerHTML = allApps.map(app => `
        <div class="input-group">
            <div class="app-icon" style="background-color: ${app.color || '#ccc'}">
                <i class="${app.iconClass || 'fa-solid fa-plus'}"></i>
            </div>
            <input type="number" id="input-${app.id}" placeholder="${app.name} (phút)" value="${(userData.appUsage[app.id] && userData.appUsage[app.id][todayIndex]) || 0}" class="flex-grow rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
        </div>
    `).join('');

    // Update check-in button
    const today = new Date().toISOString().slice(0, 10);
    const hasCheckedInToday = userData.checkinHistory[today] || false;
    const checkinBtn = document.getElementById('checkin-btn');
    
    if (checkinBtn) {
        if (hasCheckedInToday) {
            checkinBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Đã Điểm Danh Hôm Nay';
            checkinBtn.classList.add('opacity-75', 'cursor-not-allowed');
            checkinBtn.disabled = true;
        } else {
            checkinBtn.innerHTML = '<i class="fas fa-calendar-check mr-2"></i> Điểm Danh Hàng Ngày';
            checkinBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            checkinBtn.disabled = false;
        }
    }

    // Update check-in streak visualization
    updateCheckinStreakVisualization();

    // Update activities
    const allActivities = defaultHealthyActivities.concat(userData.customActivities || []);
    document.getElementById('healthy-activities-list').innerHTML = allActivities.map(activity => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <p class="text-gray-700">${activity.name}</p>
            <button id="activity-${activity.id}" data-id="${activity.id}" class="complete-activity-btn px-4 py-1 rounded-full text-sm font-semibold transition duration-300
                ${userData.completedActivities[activity.id] ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}">
                ${userData.completedActivities[activity.id] ? 'Đã Xong' : 'Hoàn Thành'}
            </button>
        </div>
    `).join('');

    // Update badges
    document.getElementById('badges-grid').innerHTML = allBadges.map(badge => `
        <div class="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white shadow-sm transition-all transform hover:scale-105">
            <span class="text-4xl ${userData.badges[badge.id] ? 'badge-earned' : 'badge-icon'}">${badge.icon}</span>
            <p class="font-semibold text-center text-sm">${badge.name}</p>
            <p class="text-xs text-center text-gray-500">${badge.description}</p>
        </div>
    `).join('');
   
    // Update charts
    updateCharts();
    
    // Update activity history
    updateActivityHistory();
}

// Update Survey Page UI
function updateSurveyUI() {
    // Nothing specific to initialize on survey page load
}

// Update Charts
function updateCharts() {
    const appLabels = socialApps.map(app => app.name);
    const appColors = socialApps.map(app => app.color);
    const appData = socialApps.map(app => (userData.appUsage[app.id] || Array(7).fill(0)));

    const datasets = appData.map((data, index) => ({
        label: appLabels[index],
        data: data,
        borderColor: appColors[index],
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 5
    }));

    // Line chart for individual app usage
    if (window.appUsageChart) window.appUsageChart.destroy();
    window.appUsageChart = new Chart(document.getElementById('app-usage-chart').getContext('2d'), {
        type: 'line',
        data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'CN', 'T7'].sort(),
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Bar chart for total weekly usage
    if (window.weeklyUsageChart) window.weeklyUsageChart.destroy();
    const limitData = Array(7).fill(userData.limit || 60);
    window.weeklyUsageChart = new Chart(document.getElementById('weekly-usage-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'CN', 'T7'].sort(),
            datasets: [
                {
                    label: 'Thời gian sử dụng',
                    data: userData.weeklyData,
                    backgroundColor: '#6366f1',
                },
                {
                    label: 'Giới hạn',
                    data: limitData,
                    type: 'line',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: true },
                x: { stacked: false }
            }
        }
    });
   
    // Quiz history chart
    if (document.getElementById('quiz-history-chart')) {
        if (window.quizHistoryChart) window.quizHistoryChart.destroy();
        const historyLabels = userData.quizHistory.map((entry, index) => `Lần ${index + 1}`);
        const physicalData = userData.quizHistory.map(entry => entry.scores.physical);
        const mentalData = userData.quizHistory.map(entry => entry.scores.mental);
        const concentrationData = userData.quizHistory.map(entry => entry.scores.concentration);

        window.quizHistoryChart = new Chart(document.getElementById('quiz-history-chart').getContext('2d'), {
            type: 'line',
            data: {
                labels: historyLabels,
                datasets: [
                    { label: 'Thể chất', data: physicalData, borderColor: '#4c51bf', fill: false, tension: 0.4 },
                    { label: 'Tinh thần', data: mentalData, borderColor: '#6b46c1', fill: false, tension: 0.4 },
                    { label: 'Tập trung', data: concentrationData, borderColor: '#f56565', fill: false, tension: 0.4 }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, suggestedMax: 25 } }
            }
        });
    }
}

// Show notification
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification-card bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3 w-full max-w-sm';
    notification.innerHTML = `
        <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.912-2.316L17.726 5.86a2 2 0 00-1.912-1.684H8.186a2 2 0 00-1.912 1.684L4.02 17.684A2 2 0 006.012 20h11.976z" />
            </svg>
        </div>
        <div>
            <div class="font-bold text-gray-900">${title}</div>
            <div class="text-sm text-gray-600">${message}</div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Award badge
function awardBadge(badgeId) {
    if (!userData.badges[badgeId]) {
        userData.badges[badgeId] = true;
        saveData();
        showNotification("Thành Tựu Mới!", `Bạn đã nhận được huy hiệu "${allBadges.find(b => b.id === badgeId).name}"!`);
    }
}

// Get quiz result evaluation
function getQuizResultEvaluation(scores) {
    const { physical, mental, concentration } = scores;
    const dependencyScore = ((physical * 0.4) + (mental * 0.4) + (concentration * 0.2)) / 5;
    const dependencyPercentage = (dependencyScore / 5) * 100;
    const formattedPercentage = dependencyPercentage.toFixed(2);
   
    let evaluationDetails = `
        <p><strong>Điểm phụ thuộc mạng xã hội của bạn là <span class="text-indigo-600 font-bold">${formattedPercentage}%</span>.</strong> Để hiểu rõ hơn về con số này, chúng ta hãy cùng phân tích chi tiết kết quả của bạn ở từng khía cạnh.</p>
        <div class="p-4 bg-white rounded-lg shadow-inner">
            <h5 class="font-bold text-lg mb-2">1. Phân tích chi tiết từng khía cạnh</h5>
            <p class="mb-1"><strong>Sức khỏe thể chất:</strong> (Điểm: ${physical}/25) - ${physical >= 15 ? 'Đang ở mức tốt.' : (physical >= 10 ? 'Cần cải thiện.' : 'Đang có vấn đề.')}</p>
            <p class="text-sm pl-4 mb-2">${physical >= 15 ? 'Bạn đang duy trì một sức khỏe tốt, các dấu hiệu như đau đầu, mỏi mắt, hay mệt mỏi thể chất do sử dụng thiết bị điện tử dường như không phải là vấn đề lớn. Điều này cho thấy bạn đã biết cách cân bằng giữa màn hình và các hoạt động thể chất.' : (physical >= 10 ? 'Sức khỏe thể chất của bạn đang ở mức trung bình. Có thể bạn đã bắt đầu cảm thấy mỏi mắt, đau cổ hoặc giấc ngủ bị ảnh hưởng. Hãy chú ý hơn đến các dấu hiệu này, chúng là lời cảnh báo từ cơ thể bạn. Hãy thử các bài tập giãn cơ, nhìn ra xa sau mỗi 20 phút sử dụng điện thoại và đảm bảo ngủ đủ giấc.' : 'Điểm số của bạn cho thấy sức khỏe thể chất đang bị ảnh hưởng nghiêm trọng. Các vấn đề về thị lực, giấc ngủ và thể lực có thể là hậu quả trực tiếp của việc sử dụng mạng xã hội quá nhiều. Đây là lúc bạn cần ưu tiên việc chăm sóc bản thân, đảm bảo bạn có đủ giấc ngủ và dành thời gian cho các hoạt động thể chất để phục hồi năng lượng.')}</p>

            <p class="mb-1"><strong>Sức khỏe tinh thần:</strong> (Điểm: ${mental}/25) - ${mental >= 15 ? 'Rất ổn định.' : (mental >= 10 ? 'Cần được quan tâm.' : 'Đang bị ảnh hưởng nghiêm trọng.')}</p>
            <p class="text-sm pl-4 mb-2">${mental >= 15 ? 'Bạn có một tinh thần vững vàng. Bạn không quá lo lắng về việc bỏ lỡ các xu hướng và ít bị ảnh hưởng bởi những hình ảnh hào nhoáng trên mạng. Điều này là một tài sản quý giá, giúp bạn sống trọn vẹn với hiện tại.' : (mental >= 10 ? 'Sức khỏe tinh thần của bạn đang ở mức cần được quan tâm. Có thể bạn đang cảm thấy áp lực phải thể hiện bản thân hoặc cảm giác trống rỗng khi không có mạng xã hội. Hãy thử viết nhật ký, trò chuyện với bạn bè hoặc tìm một sở thích mới để nuôi dưỡng cảm xúc tích cực.' : 'Điểm số thấp cho thấy bạn đang phải đối mặt với những vấn đề nghiêm trọng như lo lắng, cảm giác trống rỗng hoặc sợ bị bỏ lỡ. Mạng xã hội có thể là nguyên nhân chính dẫn đến những cảm xúc tiêu cực này. Việc so sánh bản thân với người khác có thể làm giảm lòng tự trọng. Đây là lúc bạn cần tìm kiếm sự giúp đỡ từ bạn bè, gia đình hoặc một chuyên gia tâm lý.')}</p>

            <p class="mb-1"><strong>Mức độ tập trung:</strong> (Điểm: ${concentration}/25) - ${concentration >= 15 ? 'Rất tốt.' : (concentration >= 10 ? 'Cần rèn luyện thêm.' : 'Đang rất thấp.')}</p>
            <p class="text-sm pl-4 mb-2">${concentration >= 15 ? 'Bạn có khả năng tập trung tốt. Điều này giúp bạn học tập, làm việc hiệu quả và tận hưởng trọn vẹn các cuộc trò chuyện. Hãy tiếp tục duy trì thói quen tốt này.' : (concentration >= 10 ? 'Khả năng tập trung của bạn đang ở mức trung bình. Bạn dễ bị phân tâm bởi các thông báo và có thể khó khăn khi làm việc mà không kiểm tra điện thoại. Hãy thử các phương pháp như Pomodoro để dần dần cải thiện sự tập trung của mình.' : 'Mức độ tập trung của bạn đang ở mức báo động. Việc dễ dàng bị xao nhãng có thể là dấu hiệu rõ ràng nhất của sự phụ thuộc vào mạng xã hội. Điều này ảnh hưởng trực tiếp đến hiệu quả công việc và học tập. Hãy thử bắt đầu với những khoảng thời gian ngắn không sử dụng điện thoại và tăng dần lên.')}</p>
        </div>
       
        <div class="p-4 bg-white rounded-lg shadow-inner mt-4">
            <h5 class="font-bold text-lg mb-2">2. Tại sao điểm số tốt ở các phần riêng lại có thể dẫn đến kết quả phụ thuộc cao?</h5>
            <p>Điều này nghe có vẻ mâu thuẫn, nhưng trên thực tế, nó rất phổ biến. Kết quả tổng thể không chỉ dựa trên việc bạn có bị ảnh hưởng tiêu cực hay không, mà còn về mức độ <strong>phụ thuộc vào hành vi</strong>. Một người có thể có sức khỏe thể chất và tinh thần khá tốt, nhưng nếu họ vẫn dành <strong>phần lớn thời gian trong ngày</strong> để lướt mạng xã hội một cách vô thức, thì mức độ phụ thuộc vẫn sẽ ở mức cao. Điều này giống như việc bạn có một chiếc xe với động cơ tốt, lốp xe ổn định, nhưng lại mất kiểm soát vô lăng — chiếc xe vẫn có thể đi được, nhưng nó không đi đúng hướng và có thể gặp nguy hiểm bất cứ lúc nào.</p>
            <p class="mt-2">Mạng xã hội được thiết kế để gây nghiện, khiến chúng ta quay lại liên tục. Do đó, ngay cả khi bạn không cảm thấy căng thẳng hay mỏi mắt, hành vi lướt mạng vô thức, không có mục đích rõ ràng, cũng đã là một dạng phụ thuộc. Mục tiêu cuối cùng của ứng dụng này không chỉ là giúp bạn tránh những tác hại trực tiếp, mà còn là giúp bạn lấy lại quyền kiểm soát thời gian và sự tập trung của mình.</p>
        </div>
       
        <div class="p-4 bg-white rounded-lg shadow-inner mt-4">
            <h5 class="font-bold text-lg mb-2">3. Lời khuyên tổng thể</h5>
            <p>${formattedPercentage >= 60 ? 'Mức độ phụ thuộc mạng xã hội của bạn khá cao. Mặc dù một số lĩnh vực có thể tốt, nhưng tổng thể cho thấy mạng xã hội đang chiếm phần lớn trong cuộc sống của bạn. Hãy bắt đầu bằng việc giảm thời gian sử dụng 10% mỗi tuần và tập trung vào các hoạt động ngoại tuyến.' : (formattedPercentage >= 40 ? 'Mức độ phụ thuộc của bạn ở mức trung bình. Bạn đã nhận ra tầm quan trọng của việc cân bằng. Hãy tiếp tục giảm dần thời gian sử dụng và khám phá thêm các hoạt động lành mạnh để cải thiện điểm số.' : 'Mức độ phụ thuộc của bạn rất thấp. Bạn đã có một lối sống cân bằng và lành mạnh. Hãy tiếp tục phát huy để luôn là người làm chủ cuộc sống số của mình!')}</p>
        </div>
    `;
   
    return {
        evaluationDetails,
        dependencyPercentage,
        finalAdvice: ''
    };
}

// Pomodoro Timer Functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function playBellSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1);
}

function startTimer() {
    pomodoro.isRunning = true;
    document.getElementById('start-pause-btn').textContent = 'Tạm Dừng';
    document.getElementById('start-pause-btn').classList.remove('bg-green-500', 'hover:bg-green-600');
    document.getElementById('start-pause-btn').classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    document.getElementById('reset-btn').classList.remove('hidden');

    pomodoro.intervalId = setInterval(() => {
        pomodoro.timeRemaining--;
        document.getElementById('timer-display').textContent = formatTime(pomodoro.timeRemaining);

        if (pomodoro.timeRemaining <= 0) {
            playBellSound();
            if (pomodoro.isWorkTime) {
                pomodoro.isWorkTime = false;
                pomodoro.timeRemaining = pomodoro.breakDuration;
                document.getElementById('timer-status').textContent = 'Giờ nghỉ!';
            } else {
                pomodoro.isWorkTime = true;
                pomodoro.timeRemaining = pomodoro.workDuration;
                document.getElementById('timer-status').textContent = 'Bắt đầu một chu kỳ mới!';
            }
            document.getElementById('timer-display').textContent = formatTime(pomodoro.timeRemaining);
        }
    }, 1000);
}

function pauseTimer() {
    pomodoro.isRunning = false;
    document.getElementById('start-pause-btn').textContent = 'Tiếp Tục';
    document.getElementById('start-pause-btn').classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    document.getElementById('start-pause-btn').classList.add('bg-green-500', 'hover:bg-green-600');
    clearInterval(pomodoro.intervalId);
}

function resetTimer() {
    pauseTimer();
    pomodoro.isWorkTime = true;
    pomodoro.timeRemaining = pomodoro.workDuration;
    document.getElementById('timer-display').textContent = formatTime(pomodoro.workDuration);
    document.getElementById('timer-status').textContent = 'Sẵn sàng bắt đầu!';
    document.getElementById('start-pause-btn').textContent = 'Bắt Đầu';
    document.getElementById('start-pause-btn').classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    document.getElementById('start-pause-btn').classList.add('bg-green-500', 'hover:bg-green-600');
    document.getElementById('reset-btn').classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize localStorage
    initLocalStorage();
    
    // Initialize app
    initApp();
    
    // Navigation buttons
    document.getElementById('go-to-survey-btn')?.addEventListener('click', () => {
        window.location.href = 'survey.html';
    });
    
    document.getElementById('back-to-main-btn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('back-to-main-after-quiz')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Main page event listeners
    document.getElementById('set-limit-btn')?.addEventListener('click', async () => {
        const newLimit = parseInt(document.getElementById('limit-input').value, 10);
        if (!isNaN(newLimit) && newLimit > 0) {
            userData.limit = newLimit;
            saveData();
            showNotification("Giới hạn đã được đặt", `Giới hạn hàng ngày của bạn đã được đặt là ${newLimit} phút.`);
            updateMainUI();
        }
    });

    document.getElementById('submit-usage-btn')?.addEventListener('click', async () => {
        let totalUsage = 0;
        socialApps.forEach(app => {
            const input = document.getElementById(`input-${app.id}`);
            const value = parseInt(input.value, 10) || 0;
            if (!userData.appUsage[app.id]) userData.appUsage[app.id] = Array(7).fill(0);
            userData.appUsage[app.id][todayIndex] = value;
            totalUsage += value;
        });

        userData.weeklyData[todayIndex] = totalUsage;
        saveData();
        showNotification("Cập nhật thành công", `Tổng thời gian sử dụng hôm nay là ${totalUsage} phút.`);
        updateMainUI();
    });

    document.getElementById('add-activity-btn')?.addEventListener('click', async () => {
        const newActivityName = document.getElementById('new-activity-input').value.trim();
        if (newActivityName) {
            const newActivityId = newActivityName.replace(/\s+/g, '_').toLowerCase();
            const newActivity = { id: newActivityId, name: newActivityName };
            userData.customActivities = userData.customActivities || [];
            userData.customActivities.push(newActivity);
            saveData();
            document.getElementById('new-activity-input').value = '';
            showNotification("Hoạt động mới", "Bạn đã thêm một hoạt động lành mạnh mới!");
            awardBadge('custom_activity');
            updateMainUI();
        }
    });

    // Check-in button event listener
    document.getElementById('checkin-btn')?.addEventListener('click', async () => {
        const today = new Date().toISOString().slice(0, 10);
        
        // Check if already checked in today
        if (userData.checkinHistory[today]) {
            showNotification("Đã Điểm Danh", "Bạn đã điểm danh hôm nay rồi!");
            return;
        }
        
        // Update check-in history
        userData.checkinHistory[today] = true;
        
        // Update check-in streak
        const lastCheckinDate = userData.lastCheckinDate;
        const isSequential = (lastCheckinDate && (new Date(today) - new Date(lastCheckinDate)) / (1000 * 60 * 60 * 24) === 1);
        userData.checkinStreak = isSequential ? (userData.checkinStreak || 0) + 1 : 1;
        userData.lastCheckinDate = today;
        
        // Award badges based on streak
        if (userData.checkinStreak >= 5) awardBadge('checkin_streak_5');
        if (userData.checkinStreak >= 10) awardBadge('checkin_streak_10');
        if (userData.checkinStreak >= 20) awardBadge('checkin_streak_20');
        
        saveData();
        showNotification("Điểm Danh Thành Công!", `Bạn đã điểm danh ${userData.checkinStreak} ngày liên tiếp!`);
        updateMainUI();
    });

    document.addEventListener('click', async (e) => {
        if (e.target.matches('.complete-activity-btn')) {
            const activityId = e.target.dataset.id;
            const activityName = defaultHealthyActivities.find(a => a.id === activityId)?.name || userData.customActivities.find(a => a.id === activityId)?.name;
            
            // Check if already completed today
            const today = new Date().toISOString().slice(0, 10);
            if (userData.completedActivities[activityId] === today) {
                return; // Already completed today
            }
            
            // Mark activity as completed
            userData.completedActivities[activityId] = today;
            
            // Also save to today's activity history
            if (!userData.activityHistory[today]) {
                userData.activityHistory[today] = {};
            }
            userData.activityHistory[today][activityId] = true;
            
            saveData();

            awardBadge('first_activity');
            const allActivitiesCompleted = [...defaultHealthyActivities, ...(userData.customActivities || [])].every(activity => userData.completedActivities[activity.id]);
            if (allActivitiesCompleted) {
                awardBadge('all_activities');
            }
           
            const lastDate = userData.lastActivityDate;
            const isSequential = (lastDate && (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24) === 1);
           
            if (activityId.includes('reading')) {
                userData.readingStreak = isSequential ? (userData.readingStreak || 0) + 1 : 1;
                if (userData.readingStreak >= 5) awardBadge('reading_streak_5');
                if (userData.readingStreak >= 10) awardBadge('reading_streak_10');
            }
            if (activityId.includes('exercise')) {
                userData.exerciseStreak = isSequential ? (userData.exerciseStreak || 0) + 1 : 1;
                if (userData.exerciseStreak >= 5) awardBadge('exercise_streak_5');
                if (userData.exerciseStreak >= 10) awardBadge('exercise_streak_10');
            }
            if (activityId.includes('learning')) {
                userData.learningStreak = isSequential ? (userData.learningStreak || 0) + 1 : 1;
                if (userData.learningStreak >= 5) awardBadge('learning_streak_5');
                if (userData.learningStreak >= 10) awardBadge('learning_streak_10');
            }
           
            userData.lastActivityDate = today;
            saveData();
            updateMainUI();
        }
    });

    // Activity history navigation
    document.getElementById('prev-day-btn')?.addEventListener('click', () => {
        currentHistoryDate.setDate(currentHistoryDate.getDate() - 1);
        updateActivityHistory();
    });

    document.getElementById('next-day-btn')?.addEventListener('click', () => {
        const today = new Date();
        if (currentHistoryDate < today) {
            currentHistoryDate.setDate(currentHistoryDate.getDate() + 1);
            updateActivityHistory();
        }
    });

    // Pomodoro Timer
    document.getElementById('start-pause-btn')?.addEventListener('click', () => {
        if (pomodoro.timeRemaining <= 0) {
            pomodoro.timeRemaining = pomodoro.workDuration;
            document.getElementById('timer-status').textContent = 'Giờ làm việc!';
        }
        if (pomodoro.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });

    document.getElementById('reset-btn')?.addEventListener('click', resetTimer);

    // Survey page event listeners
    document.getElementById('start-quiz-btn')?.addEventListener('click', () => {
        const generateQuiz = (containerId, questions) => {
            const container = document.getElementById(containerId);
            container.innerHTML = questions.map((q, index) => `
                <div class="quiz-question" data-category="${containerId}" data-index="${index}">
                    <p class="font-medium">${index + 1}. ${q.q}</p>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${quizOptions.map((option, optIndex) => `
                            <button data-score="${q.score[optIndex]}" class="quiz-option bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-100 transition duration-300">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            container.classList.remove('hidden');
        };

        generateQuiz('physical-questions', quizQuestions.physical);
        generateQuiz('mental-questions', quizQuestions.mental);
        generateQuiz('concentration-questions', quizQuestions.concentration);

        document.getElementById('start-quiz-btn').classList.add('hidden');
        document.getElementById('submit-quiz-btn').classList.remove('hidden');
        document.getElementById('quiz-status').textContent = 'Hãy trả lời tất cả các câu hỏi để xem kết quả.';
    });

    document.getElementById('submit-quiz-btn')?.addEventListener('click', async () => {
        const allQuestions = document.querySelectorAll('.quiz-question');
        let answeredCount = 0;
        let scores = { physical: 0, mental: 0, concentration: 0 };

        allQuestions.forEach(q => {
            const selected = q.querySelector('.quiz-option.bg-indigo-500');
            if (selected) {
                const category = q.dataset.category.replace('-questions', '');
                scores[category] += parseInt(selected.dataset.score, 10);
                answeredCount++;
            }
        });

        if (answeredCount === allQuestions.length) {
            const evaluation = getQuizResultEvaluation(scores);
           
            document.getElementById('quiz-evaluation').innerHTML = evaluation.evaluationDetails;
            document.getElementById('dependency-score').textContent = ``;

            const today = new Date().toISOString().slice(0, 10);
            userData.quizHistory.push({ date: today, scores: scores });
            saveData();

            document.getElementById('quiz-result-section').classList.remove('hidden');
            document.getElementById('quiz-status').classList.add('hidden');
            document.getElementById('submit-quiz-btn').classList.add('hidden');
            awardBadge('quiz_pro');
           
            const dependencyPercentage = ((scores.physical * 0.4) + (scores.mental * 0.4) + (scores.concentration * 0.2)) / 5 * 20;
            if (dependencyPercentage < 50) awardBadge('dependency_low_50');
            if (dependencyPercentage < 40) awardBadge('dependency_low_40');
            if (dependencyPercentage < 30) awardBadge('dependency_low_30');

            if (window.quizChart) window.quizChart.destroy();
            window.quizChart = new Chart(document.getElementById('quiz-chart').getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Thể chất', 'Tinh thần', 'Tập trung'],
                    datasets: [{
                        label: 'Điểm của bạn (càng cao càng tốt)',
                        data: [scores.physical, scores.mental, scores.concentration],
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        borderColor: '#6366f1',
                        borderWidth: 2,
                        pointBackgroundColor: '#6366f1'
                    }]
                },
                options: {
                    responsive: true,
                    elements: { line: { borderWidth: 3 } },
                    scales: { r: { suggestedMin: 0, suggestedMax: 25, pointLabels: { font: { size: 14 } } } }
                }
            });
           
            updateCharts();
        } else {
            document.getElementById('quiz-status').textContent = 'Vui lòng trả lời tất cả các câu hỏi.';
        }
    });

    document.getElementById('quiz-content')?.addEventListener('click', (e) => {
        if (e.target.matches('.quiz-option')) {
            const parent = e.target.closest('.quiz-question');
            parent.querySelectorAll('.quiz-option').forEach(btn => {
                btn.classList.remove('bg-indigo-500', 'text-white');
                btn.classList.add('bg-white', 'text-gray-700');
            });
            e.target.classList.add('bg-indigo-500', 'text-white');
            e.target.classList.remove('bg-white', 'text-gray-700');
        }
    });

    // Initialize badges on first visit
    if (Object.keys(userData.badges).length === 0) {
        awardBadge('first_day');
    }
});
