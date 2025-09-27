// Initialize variables
let userId = null;
let userData = {
    limit: 60,
    weeklyData: Array(7).fill(0),
    appUsage: {},
    badges: {},
    // Thay đổi cấu trúc completedActivities
    completedActivities: {}, // { activityId: [date1, date2, ...] }
    customActivities: [],
    loginStreak: 0,
    underLimitStreak: 0,
    learningStreak: 0,
    readingStreak: 0,
    exerciseStreak: 0,
    quizScores: { physical: 0, mental: 0, concentration: 0 },
    quizHistory: [],
    lastLoginDate: null,
    lastResetDate: null,
    // Thêm trường mới để lưu trữ lịch sử hoạt động theo ngày
    activityHistory: {} // { date: { activityId1: true, activityId2: true, ... } }
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
    } else {
        saveData();
    }
}

function saveData() {
    localStorage.setItem('userData', JSON.stringify(userData));
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
        
        // Kiểm tra reset hàng ngày
        checkDailyReset();
        
        // Kiểm tra và cập nhật thành tựu từ dữ liệu khảo sát
        checkAndUpdateQuizBadges();
        
        updateMainUI();
        
        // Khởi tạo giao diện lịch sử nếu có phần tử
        if (document.getElementById('history-container')) {
            updateActivityHistory('day');
        }
    }
    
    if (document.getElementById('quiz-content')) {
        updateSurveyUI();
    }
}

// Thêm hàm kiểm tra và cập nhật thành tựu từ khảo sát
function checkAndUpdateQuizBadges() {
    // Kiểm tra nếu người dùng đã hoàn thành khảo sát
    if (userData.quizHistory && userData.quizHistory.length > 0) {
        // Đảm bảo thành tựu quiz_pro được cấp
        awardBadge('quiz_pro');
        
        // Kiểm tra kết quả khảo sát gần nhất
        const latestQuiz = userData.quizHistory[userData.quizHistory.length - 1];
        const scores = latestQuiz.scores;
        
        const dependencyPercentage = ((scores.physical * 0.4) + (scores.mental * 0.4) + (scores.concentration * 0.2)) / 5 * 20;
        if (dependencyPercentage < 50) awardBadge('dependency_low_50');
        if (dependencyPercentage < 40) awardBadge('dependency_low_40');
        if (dependencyPercentage < 30) awardBadge('dependency_low_30');
    }
}

// Thêm hàm lấy ngày hiện tại theo GMT+7
function getGMT7Date() {
    const now = new Date();
    // Convert to UTC+7
    const utc7 = new Date(now.getTime() + (7 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60000));
    return utc7;
}

// Cập nhật hàm kiểm tra reset tự động
function checkDailyReset() {
    const nowGMT7 = getGMT7Date();
    const todayGMT7 = nowGMT7.toISOString().slice(0, 10);
    const lastReset = userData.lastResetDate;
    
    // Kiểm tra nếu đã qua 6h sáng hôm nay (GMT+7)
    if (!lastReset || lastReset !== todayGMT7) {
        // Thiết lập thời gian reset là 6h sáng GMT+7
        const resetTime = new Date(nowGMT7);
        resetTime.setHours(6, 0, 0, 0);
        
        // Nếu thời gian hiện tại đã qua 6h sáng
        if (nowGMT7 >= resetTime) {
            // Reset các hoạt động hàng ngày
            userData.lastResetDate = todayGMT7;
            saveData();
            updateMainUI();
        }
    }
}

// Update Main Page UI
function updateMainUI() {
    try {
        // Update dashboard
        const currentUsageDisplay = document.getElementById('current-usage-display');
        const limitInput = document.getElementById('limit-input');
        const limitMessage = document.getElementById('limit-message');
        const progressBar = document.getElementById('progress-bar');
        
        if (currentUsageDisplay) {
            const totalUsageToday = userData.weeklyData[todayIndex] || 0;
            currentUsageDisplay.textContent = `${totalUsageToday}p`;
        }
        
        if (limitInput) {
            const limit = userData.limit || 60;
            limitInput.value = limit;
        }
        
        if (limitMessage) {
            const limit = userData.limit || 60;
            limitMessage.innerHTML = `Giới hạn: <strong>${limit}p</strong>`;
            
            const totalUsageToday = userData.weeklyData[todayIndex] || 0;
            const percentage = Math.min((totalUsageToday / limit) * 100, 100);
            
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
            
            if (totalUsageToday >= limit) {
                limitMessage.innerHTML = `<span class="font-bold text-red-300">Bạn đã vượt quá giới hạn!</span>`;
            } else if (totalUsageToday > 0) {
                limitMessage.innerHTML = `Còn lại: <strong>${Math.max(0, limit - totalUsageToday)}p</strong>`;
            }
        }

        // Update app usage inputs
        const appInputContainer = document.getElementById('app-input-container');
        if (appInputContainer) {
            const allApps = socialApps.concat(userData.customApps || []);
            appInputContainer.innerHTML = allApps.map(app => `
                <div class="input-group">
                    <div class="app-icon" style="background-color: ${app.color || '#ccc'}">
                        <i class="${app.iconClass || 'fa-solid fa-plus'}"></i>
                    </div>
                    <input type="number" id="input-${app.id}" placeholder="${app.name} (phút)" value="${(userData.appUsage[app.id] && userData.appUsage[app.id][todayIndex]) || 0}" class="flex-grow rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                </div>
            `).join('');
        }

        // Update activities
        const healthyActivitiesList = document.getElementById('healthy-activities-list');
        if (healthyActivitiesList) {
            const allActivities = defaultHealthyActivities.concat(userData.customActivities || []);
            const todayGMT7 = getGMT7Date().toISOString().slice(0, 10);
            
            healthyActivitiesList.innerHTML = allActivities.map(activity => {
                const isCompletedToday = userData.completedActivities[activity.id]?.includes(todayGMT7);
                const streak = getActivityStreak(activity.id);
                
                return `
                    <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                        <div>
                            <p class="text-gray-700">${activity.name}</p>
                            ${streak > 0 ? `<p class="text-xs text-indigo-600">Chuỗi: ${streak} ngày</p>` : ''}
                        </div>
                        <button id="activity-${activity.id}" data-id="${activity.id}" class="complete-activity-btn px-4 py-1 rounded-full text-sm font-semibold transition duration-300
                            ${isCompletedToday ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}">
                            ${isCompletedToday ? 'Đã Hoàn Thành Hôm Nay' : 'Hoàn Thành'}
                        </button>
                    </div>
                `;
            }).join('');
        }

        // Update badges
        const badgesGrid = document.getElementById('badges-grid');
        if (badgesGrid) {
            badgesGrid.innerHTML = allBadges.map(badge => `
                <div class="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white shadow-sm transition-all transform hover:scale-105">
                    <span class="text-4xl ${userData.badges[badge.id] ? 'badge-earned' : 'badge-icon'}">${badge.icon}</span>
                    <p class="font-semibold text-center text-sm">${badge.name}</p>
                    <p class="text-xs text-center text-gray-500">${badge.description}</p>
                </div>
            `).join('');
        }
       
        // Update charts
        updateCharts();
    } catch (error) {
        console.error("Error in updateMainUI:", error);
    }
}

// Update Survey Page UI
function updateSurveyUI() {
    // Nothing specific to initialize on survey page load
}

// Update Charts
function updateCharts() {
    try {
        const appUsageChartCanvas = document.getElementById('app-usage-chart');
        const weeklyUsageChartCanvas = document.getElementById('weekly-usage-chart');
        
        if (appUsageChartCanvas) {
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
            window.appUsageChart = new Chart(appUsageChartCanvas.getContext('2d'), {
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
        }

        // Bar chart for total weekly usage
        if (weeklyUsageChartCanvas) {
            if (window.weeklyUsageChart) window.weeklyUsageChart.destroy();
            const limitData = Array(7).fill(userData.limit || 60);
            window.weeklyUsageChart = new Chart(weeklyUsageChartCanvas.getContext('2d'), {
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
        }
       
        // Quiz history chart
        const quizHistoryChartCanvas = document.getElementById('quiz-history-chart');
        if (quizHistoryChartCanvas) {
            if (window.quizHistoryChart) window.quizHistoryChart.destroy();
            const historyLabels = userData.quizHistory.map((entry, index) => `Lần ${index + 1}`);
            const physicalData = userData.quizHistory.map(entry => entry.scores.physical);
            const mentalData = userData.quizHistory.map(entry => entry.scores.mental);
            const concentrationData = userData.quizHistory.map(entry => entry.scores.concentration);

            window.quizHistoryChart = new Chart(quizHistoryChartCanvas.getContext('2d'), {
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
    } catch (error) {
        console.error("Error in updateCharts:", error);
    }
}

// Show notification
function showNotification(title, message) {
    try {
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
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    } catch (error) {
        console.error("Error in showNotification:", error);
    }
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
    try {
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
    } catch (error) {
        console.error("Error in playBellSound:", error);
    }
}

function startTimer() {
    pomodoro.isRunning = true;
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const timerStatus = document.getElementById('timer-status');
    
    if (startPauseBtn) {
        startPauseBtn.textContent = 'Tạm Dừng';
        startPauseBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        startPauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    }
    
    if (resetBtn) {
        resetBtn.classList.remove('hidden');
    }

    pomodoro.intervalId = setInterval(() => {
        pomodoro.timeRemaining--;
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(pomodoro.timeRemaining);
        }

        if (pomodoro.timeRemaining <= 0) {
            playBellSound();
            if (pomodoro.isWorkTime) {
                pomodoro.isWorkTime = false;
                pomodoro.timeRemaining = pomodoro.breakDuration;
                if (timerStatus) {
                    timerStatus.textContent = 'Giờ nghỉ!';
                }
            } else {
                pomodoro.isWorkTime = true;
                pomodoro.timeRemaining = pomodoro.workDuration;
                if (timerStatus) {
                    timerStatus.textContent = 'Bắt đầu một chu kỳ mới!';
                }
            }
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(pomodoro.timeRemaining);
            }
        }
    }, 1000);
}

function pauseTimer() {
    pomodoro.isRunning = false;
    const startPauseBtn = document.getElementById('start-pause-btn');
    
    if (startPauseBtn) {
        startPauseBtn.textContent = 'Tiếp Tục';
        startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
    
    clearInterval(pomodoro.intervalId);
}

function resetTimer() {
    pauseTimer();
    pomodoro.isWorkTime = true;
    pomodoro.timeRemaining = pomodoro.workDuration;
    
    const timerDisplay = document.getElementById('timer-display');
    const timerStatus = document.getElementById('timer-status');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(pomodoro.workDuration);
    }
    
    if (timerStatus) {
        timerStatus.textContent = 'Sẵn sàng bắt đầu!';
    }
    
    if (startPauseBtn) {
        startPauseBtn.textContent = 'Bắt Đầu';
        startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
    
    if (resetBtn) {
        resetBtn.classList.add('hidden');
    }
}

// Thêm hàm lấy chuỗi ngày của hoạt động
function getActivityStreak(activityId) {
    if (!userData.completedActivities[activityId] || userData.completedActivities[activityId].length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date(getGMT7Date());
    currentDate.setHours(0, 0, 0, 0);
    
    // Kiểm tra ngược từ hôm nay
    while (true) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        if (userData.completedActivities[activityId]?.includes(dateStr)) {
            streak++;
            // Lùi lại 1 ngày
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

// Thêm hàm cập nhật chuỗi ngày
function updateStreaks(activityId, today) {
    const lastDate = userData.lastActivityDate;
    const isSequential = lastDate && 
        (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24) === 1;
    
    // Cập nhật chuỗi ngày chung
    userData.lastActivityDate = today;
    
    // Cập nhật chuỗi ngày cho từng loại hoạt động
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
}

// Thêm hàm cập nhật giao diện lịch sử hoạt động
function updateActivityHistory(viewType = 'day') {
    try {
        const container = document.getElementById('history-container');
        if (!container) return;
        
        const nowGMT7 = getGMT7Date();
        const todayGMT7 = nowGMT7.toISOString().slice(0, 10);
        
        // Cập nhật trạng thái nút
        const viewDayBtn = document.getElementById('view-day-btn');
        const viewWeekBtn = document.getElementById('view-week-btn');
        const viewMonthBtn = document.getElementById('view-month-btn');
        
        if (viewDayBtn) {
            viewDayBtn.className = viewType === 'day' ? 
                'px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm font-medium' : 
                'px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium';
        }
        
        if (viewWeekBtn) {
            viewWeekBtn.className = viewType === 'week' ? 
                'px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm font-medium' : 
                'px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium';
        }
        
        if (viewMonthBtn) {
            viewMonthBtn.className = viewType === 'month' ? 
                'px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm font-medium' : 
                'px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium';
        }
        
        if (viewType === 'day') {
            // Hiển thị lịch sử theo ngày
            const todayActivities = userData.activityHistory[todayGMT7] || {};
            const allActivities = [...defaultHealthyActivities, ...(userData.customActivities || [])];
            
            container.innerHTML = `
                <div class="mb-4">
                    <h4 class="font-semibold text-lg">Hoạt động hôm nay (${todayGMT7})</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${allActivities.map(activity => `
                        <div class="flex items-center p-3 bg-white rounded-lg shadow-sm">
                            <div class="flex-1">
                                <p class="text-gray-700">${activity.name}</p>
                            </div>
                            <div class="w-6 h-6 rounded-full ${todayActivities[activity.id] ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center">
                                ${todayActivities[activity.id] ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (viewType === 'week') {
            // Hiển thị lịch sử theo tuần
            const weekSummary = getWeekSummary();
            
            container.innerHTML = `
                <div class="mb-4">
                    <h4 class="font-semibold text-lg">Tóm tắt tuần này</h4>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="py-2 px-4 text-left">Hoạt động</th>
                                ${weekSummary.days.map(day => `<th class="py-2 px-4 text-center">${day}</th>`).join('')}
                                <th class="py-2 px-4 text-center">Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${weekSummary.activities.map(activity => `
                                <tr class="border-b">
                                    <td class="py-2 px-4">${activity.name}</td>
                                    ${activity.completion.map(completed => 
                                        `<td class="py-2 px-4 text-center">
                                            ${completed ? '<i class="fas fa-check text-green-500"></i>' : '-'}
                                        </td>`
                                    ).join('')}
                                    <td class="py-2 px-4 text-center font-semibold">${activity.total}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else if (viewType === 'month') {
            // Hiển thị lịch sử theo tháng
            const monthSummary = getMonthSummary();
            
            container.innerHTML = `
                <div class="mb-4">
                    <h4 class="font-semibold text-lg">Tóm tắt tháng này</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${monthSummary.map(week => `
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h5 class="font-semibold mb-2">Tuần ${week.weekNumber}</h5>
                            <div class="space-y-2">
                                ${week.activities.map(activity => `
                                    <div class="flex justify-between">
                                        <span class="text-sm">${activity.name}</span>
                                        <span class="text-sm font-semibold">${activity.count} lần</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error("Error in updateActivityHistory:", error);
    }
}

// Thêm hàm lấy tóm tắt theo tuần
function getWeekSummary() {
    const nowGMT7 = getGMT7Date();
    const todayGMT7 = nowGMT7.toISOString().slice(0, 10);
    const currentDayOfWeek = nowGMT7.getDay();
    
    // Tính ngày bắt đầu của tuần (Chủ Nhật)
    const startDate = new Date(nowGMT7);
    startDate.setDate(startDate.getDate() - currentDayOfWeek);
    
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    // Tạo mảng 7 ngày của tuần
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        days.push(date.toISOString().slice(0, 10));
    }
    
    // Lấy tất cả hoạt động
    const allActivities = [...defaultHealthyActivities, ...(userData.customActivities || [])];
    
    // Tạo dữ liệu tóm tắt
    const activities = allActivities.map(activity => {
        const completion = days.map(day => {
            return userData.activityHistory[day]?.[activity.id] || false;
        });
        
        const total = completion.filter(Boolean).length;
        
        return {
            name: activity.name,
            completion,
            total
        };
    });
    
    return {
        days: days.map(day => {
            const date = new Date(day);
            return dayNames[date.getDay()];
        }),
        activities
    };
}

// Thêm hàm lấy tóm tắt theo tháng
function getMonthSummary() {
    const nowGMT7 = getGMT7Date();
    const year = nowGMT7.getFullYear();
    const month = nowGMT7.getMonth();
    
    // Tính số tuần trong tháng
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks = [];
    let currentWeek = 1;
    let currentWeekStart = new Date(firstDay);
    
    // Đảm bảo tuần bắt đầu từ Chủ Nhật
    const dayOfWeek = firstDay.getDay();
    currentWeekStart.setDate(firstDay.getDate() - dayOfWeek);
    
    while (currentWeekStart <= lastDay) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Đảm bảo không vượt qua ngày cuối tháng
        if (weekEnd > lastDay) {
            weekEnd.setTime(lastDay.getTime());
        }
        
        const weekActivities = [];
        
        // Lấy tất cả hoạt động
        const allActivities = [...defaultHealthyActivities, ...(userData.customActivities || [])];
        
        // Tính toán số lần hoàn thành mỗi hoạt động trong tuần
        allActivities.forEach(activity => {
            let count = 0;
            
            // Kiểm tra từng ngày trong tuần
            for (let day = new Date(currentWeekStart); day <= weekEnd; day.setDate(day.getDate() + 1)) {
                const dayStr = day.toISOString().slice(0, 10);
                if (userData.activityHistory[dayStr]?.[activity.id]) {
                    count++;
                }
            }
            
            if (count > 0) {
                weekActivities.push({
                    name: activity.name,
                    count
                });
            }
        });
        
        weeks.push({
            weekNumber: currentWeek,
            activities: weekActivities
        });
        
        // Chuyển sang tuần tiếp theo
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        currentWeek++;
    }
    
    return weeks;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize localStorage
        initLocalStorage();
        
        // Initialize app
        initApp();
        
        // Navigation buttons
        const goToSurveyBtn = document.getElementById('go-to-survey-btn');
        if (goToSurveyBtn) {
            goToSurveyBtn.addEventListener('click', () => {
                window.location.href = 'survey.html';
            });
        }
        
        const backToMainBtn = document.getElementById('back-to-main-btn');
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        const backToMainAfterQuizBtn = document.getElementById('back-to-main-after-quiz');
        if (backToMainAfterQuizBtn) {
            backToMainAfterQuizBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        // History view buttons
        const viewDayBtn = document.getElementById('view-day-btn');
        if (viewDayBtn) {
            viewDayBtn.addEventListener('click', () => {
                updateActivityHistory('day');
            });
        }
        
        const viewWeekBtn = document.getElementById('view-week-btn');
        if (viewWeekBtn) {
            viewWeekBtn.addEventListener('click', () => {
                updateActivityHistory('week');
            });
        }
        
        const viewMonthBtn = document.getElementById('view-month-btn');
        if (viewMonthBtn) {
            viewMonthBtn.addEventListener('click', () => {
                updateActivityHistory('month');
            });
        }
        
        // Main page event listeners
        const setLimitBtn = document.getElementById('set-limit-btn');
        if (setLimitBtn) {
            setLimitBtn.addEventListener('click', async () => {
                const limitInput = document.getElementById('limit-input');
                if (limitInput) {
                    const newLimit = parseInt(limitInput.value, 10);
                    if (!isNaN(newLimit) && newLimit > 0) {
                        userData.limit = newLimit;
                        saveData();
                        showNotification("Giới hạn đã được đặt", `Giới hạn hàng ngày của bạn đã được đặt là ${newLimit} phút.`);
                        updateMainUI();
                    }
                }
            });
        }

        const submitUsageBtn = document.getElementById('submit-usage-btn');
        if (submitUsageBtn) {
            submitUsageBtn.addEventListener('click', async () => {
                let totalUsage = 0;
                socialApps.forEach(app => {
                    const input = document.getElementById(`input-${app.id}`);
                    if (input) {
                        const value = parseInt(input.value, 10) || 0;
                        if (!userData.appUsage[app.id]) userData.appUsage[app.id] = Array(7).fill(0);
                        userData.appUsage[app.id][todayIndex] = value;
                        totalUsage += value;
                    }
                });

                userData.weeklyData[todayIndex] = totalUsage;
                saveData();
                showNotification("Cập nhật thành công", `Tổng thời gian sử dụng hôm nay là ${totalUsage} phút.`);
                updateMainUI();
            });
        }

        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', async () => {
                const newActivityInput = document.getElementById('new-activity-input');
                if (newActivityInput) {
                    const newActivityName = newActivityInput.value.trim();
                    if (newActivityName) {
                        const newActivityId = newActivityName.replace(/\s+/g, '_').toLowerCase();
                        const newActivity = { id: newActivityId, name: newActivityName };
                        userData.customActivities = userData.customActivities || [];
                        userData.customActivities.push(newActivity);
                        saveData();
                        if (newActivityInput) {
                            newActivityInput.value = '';
                        }
                        showNotification("Hoạt động mới", "Bạn đã thêm một hoạt động lành mạnh mới!");
                        awardBadge('custom_activity');
                        updateMainUI();
                    }
                }
            });
        }

        // Event delegation for activity buttons
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.complete-activity-btn')) {
                const activityId = e.target.dataset.id;
                const activityName = defaultHealthyActivities.find(a => a.id === activityId)?.name || 
                                    userData.customActivities.find(a => a.id === activityId)?.name;
                
                const todayGMT7 = getGMT7Date().toISOString().slice(0, 10);
                
                // Kiểm tra nếu hoạt động đã được hoàn thành hôm nay chưa
                const completedToday = userData.completedActivities[activityId]?.includes(todayGMT7);
                
                if (!completedToday) {
                    // Thêm ngày hoàn thành vào mảng
                    if (!userData.completedActivities[activityId]) {
                        userData.completedActivities[activityId] = [];
                    }
                    userData.completedActivities[activityId].push(todayGMT7);
                    
                    // Cập nhật lịch sử hoạt động theo ngày
                    if (!userData.activityHistory[todayGMT7]) {
                        userData.activityHistory[todayGMT7] = {};
                    }
                    userData.activityHistory[todayGMT7][activityId] = true;
                    
                    awardBadge('first_activity');
                    
                    // Cập nhật chuỗi ngày
                    updateStreaks(activityId, todayGMT7);
                    
                    // Kiểm tra nếu tất cả hoạt động đã được hoàn thành hôm nay
                    const allActivitiesCompleted = [...defaultHealthyActivities, ...(userData.customActivities || [])]
                        .every(activity => userData.completedActivities[activity.id]?.includes(todayGMT7));
                    if (allActivitiesCompleted) {
                        awardBadge('all_activities');
                    }
                    
                    saveData();
                    updateMainUI();
                    updateActivityHistory('day');
                }
            }
        });

        // Pomodoro Timer
        const startPauseBtn = document.getElementById('start-pause-btn');
        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => {
                if (pomodoro.timeRemaining <= 0) {
                    pomodoro.timeRemaining = pomodoro.workDuration;
                    const timerStatus = document.getElementById('timer-status');
                    if (timerStatus) {
                        timerStatus.textContent = 'Giờ làm việc!';
                    }
                }
                if (pomodoro.isRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            });
        }

        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetTimer);
        }

        // Survey page event listeners
        const startQuizBtn = document.getElementById('start-quiz-btn');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                const generateQuiz = (containerId, questions) => {
                    const container = document.getElementById(containerId);
                    if (container) {
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
                    }
                };

                generateQuiz('physical-questions', quizQuestions.physical);
                generateQuiz('mental-questions', quizQuestions.mental);
                generateQuiz('concentration-questions', quizQuestions.concentration);

                if (startQuizBtn) {
                    startQuizBtn.classList.add('hidden');
                }
                
                const submitQuizBtn = document.getElementById('submit-quiz-btn');
                if (submitQuizBtn) {
                    submitQuizBtn.classList.remove('hidden');
                }
                
                const quizStatus = document.getElementById('quiz-status');
                if (quizStatus) {
                    quizStatus.textContent = 'Hãy trả lời tất cả các câu hỏi để xem kết quả.';
                }
            });
        }

        const submitQuizBtn = document.getElementById('submit-quiz-btn');
        if (submitQuizBtn) {
            submitQuizBtn.addEventListener('click', async () => {
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
                   
                    const quizEvaluation = document.getElementById('quiz-evaluation');
                    if (quizEvaluation) {
                        quizEvaluation.innerHTML = evaluation.evaluationDetails;
                    }
                    
                    const dependencyScore = document.getElementById('dependency-score');
                    if (dependencyScore) {
                        dependencyScore.textContent = ``;
                    }

                    const today = new Date().toISOString().slice(0, 10);
                    userData.quizHistory.push({ date: today, scores: scores });
                    
                    // Lưu dữ liệu trước khi cập nhật giao diện
                    saveData();

                    const quizResultSection = document.getElementById('quiz-result-section');
                    if (quizResultSection) {
                        quizResultSection.classList.remove('hidden');
                    }
                    
                    const quizStatus = document.getElementById('quiz-status');
                    if (quizStatus) {
                        quizStatus.classList.add('hidden');
                    }
                    
                    if (submitQuizBtn) {
                        submitQuizBtn.classList.add('hidden');
                    }
                    
                    // Cấp thành tựu
                    awardBadge('quiz_pro');
                   
                    const dependencyPercentage = ((scores.physical * 0.4) + (scores.mental * 0.4) + (scores.concentration * 0.2)) / 5 * 20;
                    if (dependencyPercentage < 50) awardBadge('dependency_low_50');
                    if (dependencyPercentage < 40) awardBadge('dependency_low_40');
                    if (dependencyPercentage < 30) awardBadge('dependency_low_30');

                    // Cập nhật biểu đồ
                    const quizChartCanvas = document.getElementById('quiz-chart');
                    if (quizChartCanvas) {
                        if (window.quizChart) window.quizChart.destroy();
                        window.quizChart = new Chart(quizChartCanvas.getContext('2d'), {
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
                    }
                   
                    updateCharts();
                    
                    // Hiển thị thông báo thành công
                    showNotification("Khảo sát hoàn thành", "Kết quả khảo sát của bạn đã được lưu. Hãy quay lại trang chính để xem thành tựu mới!");
                } else {
                    const quizStatus = document.getElementById('quiz-status');
                    if (quizStatus) {
                        quizStatus.textContent = 'Vui lòng trả lời tất cả các câu hỏi.';
                    }
                }
            });
        }

        const quizContent = document.getElementById('quiz-content');
        if (quizContent) {
            quizContent.addEventListener('click', (e) => {
                if (e.target.matches('.quiz-option')) {
                    const parent = e.target.closest('.quiz-question');
                    if (parent) {
                        parent.querySelectorAll('.quiz-option').forEach(btn => {
                            btn.classList.remove('bg-indigo-500', 'text-white');
                            btn.classList.add('bg-white', 'text-gray-700');
                        });
                        e.target.classList.add('bg-indigo-500', 'text-white');
                        e.target.classList.remove('bg-white', 'text-gray-700');
                    }
                }
            });
        }

        // Initialize badges on first visit
        if (Object.keys(userData.badges).length === 0) {
            awardBadge('first_day');
        }
    } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
    }
});
