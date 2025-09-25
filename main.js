document.addEventListener('DOMContentLoaded', async function () {
// Firebase SDK modules
const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
const { getFirestore, doc, setDoc, updateDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
const { setLogLevel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
// Firebase init
setLogLevel('debug');
const app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};
const initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
// --- App constants and initial state ---
let userId = null;
let appUsageChart, weeklyUsageChart, quizChart, quizHistoryChart;
const initialLimit = 60;
let userData = {
    limit: initialLimit,
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
    quizScores: { physical: 0, mental: 0, concentration: 0 },
    quizHistory: [],
    lastLoginDate: null,
    lastActivityDate: null
};
const todayIndex = new Date().getDay();
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
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    timer: null,
    isWorkTime: true,
    isRunning: false,
    timeRemaining: 0,
    intervalId: null
};
// DOM elements
const loadingSpinner = document.getElementById('loading-spinner');
const mainContent = document.getElementById('main-content');
const userIdDisplay = document.getElementById('user-id-display');
const currentUsageDisplay = document.getElementById('current-usage-display');
const limitInput = document.getElementById('limit-input');
const setLimitBtn = document.getElementById('set-limit-btn');
const progressBar = document.getElementById('progress-bar');
const limitMessage = document.getElementById('limit-message');
const appInputContainer = document.getElementById('app-input-container');
const submitUsageBtn = document.getElementById('submit-usage-btn');
const appUsageChartCtx = document.getElementById('app-usage-chart').getContext('2d');
const weeklyUsageChartCtx = document.getElementById('weekly-usage-chart').getContext('2d');
const healthyActivitiesList = document.getElementById('healthy-activities-list');
const addActivityBtn = document.getElementById('add-activity-btn');
const newActivityInput = document.getElementById('new-activity-input');
const badgesGrid = document.getElementById('badges-grid');
const startQuizBtn = document.getElementById('start-quiz-btn');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const quizContent = document.getElementById('quiz-content');
const quizStatus = document.getElementById('quiz-status');
const quizResultSection = document.getElementById('quiz-result-section');
const quizEvaluation = document.getElementById('quiz-evaluation');
const dependencyScoreDisplay = document.getElementById('dependency-score');
const quizChartCtx = document.getElementById('quiz-chart').getContext('2d');
const quizHistoryChartCtx = document.getElementById('quiz-history-chart').getContext('2d');
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
// --- Helper Functions ---
const getUserDocRef = () => doc(db, `artifacts/${app_id}/users/${userId}/usage_data`, 'user_data');
const showNotification = (title, message) => {
    const notification = document.createElement('div');
    notification.className = 'notification-card bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3 w-full max-w-sm';
    notification.innerHTML = `
        <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856a2 2 0 001.912-2.316L17.726 5.86a2 2 0 00-1.912-1.684H8.186a2 2 0 00-1.9..."/>
            </svg>
        </div>
        <div>
            <div class="font-bold text-gray-900">${title}</div>
            <div class="text-sm text-gray-600">${message}</div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 5000);
};
const updateUI = () => {
    if (!userData) return;
    const totalUsageToday = userData.weeklyData[todayIndex] || 0;
    currentUsageDisplay.textContent = `${totalUsageToday}p`;
    const limit = userData.limit || initialLimit;
    limitInput.value = limit;
    limitMessage.innerHTML = `Giới hạn: <strong>${limit}p</strong>`;
    const percentage = Math.min((totalUsageToday / limit) * 100, 100);
    progressBar.style.width = `${percentage}%`;
    if (totalUsageToday >= limit) {
        limitMessage.innerHTML = `<span class="font-bold text-red-300">Bạn đã vượt quá giới hạn!</span>`;
    } else if (totalUsageToday > 0) {
        limitMessage.innerHTML = `Còn lại: <strong>${Math.max(0, limit - totalUsageToday)}p</strong>`;
    }
    const allApps = socialApps.concat(userData.customApps || []);
    appInputContainer.innerHTML = allApps.map(app => `
        <div class="input-group">
            <div class="app-icon" style="background-color: ${app.color || '#ccc'}">
                <i class="${app.iconClass || 'fa-solid fa-plus'}"></i>
            </div>
            <input type="number" id="input-${app.id}" placeholder="${app.name} (phút)" value="${(userData.appUsage[app.id] && userData.appUsage[app.id][todayIndex]) || 0}" class="flex-grow rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400">
        </div>
    `).join('');
    const allActivities = defaultHealthyActivities.concat(userData.customActivities || []);
    healthyActivitiesList.innerHTML = allActivities.map(activity => `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
            <p class="text-gray-700">${activity.name}</p>
            <button id="activity-${activity.id}" data-id="${activity.id}" class="complete-activity-btn px-4 py-1 rounded-full text-sm font-semibold transition duration-300
                ${userData.completedActivities[activity.id] ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-indigo-200 text-indigo-700 hover:bg-indigo-300'}">
                ${userData.completedActivities[activity.id] ? 'Đã Xong' : 'Hoàn Thành'}
            </button>
        </div>
    `).join('');
    badgesGrid.innerHTML = allBadges.map(badge => `
        <div class="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white shadow-sm transition-all transform hover:scale-105">
            <span class="text-4xl ${userData.badges[badge.id] ? 'badge-earned' : 'badge-icon'}">${badge.icon}</span>
            <p class="font-semibold text-center text-sm">${badge.name}</p>
            <p class="text-xs text-center text-gray-500">${badge.description}</p>
        </div>
    `).join('');
    updateCharts();
};
const updateCharts = () => {
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
    if (appUsageChart) appUsageChart.destroy();
    appUsageChart = new Chart(appUsageChartCtx, {
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
    if (weeklyUsageChart) weeklyUsageChart.destroy();
    const limitData = Array(7).fill(userData.limit || initialLimit);
    weeklyUsageChart = new Chart(weeklyUsageChartCtx, {
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
    if (quizHistoryChart) quizHistoryChart.destroy();
    const historyLabels = userData.quizHistory.map((entry, index) => `Lần ${index + 1}`);
    const physicalData = userData.quizHistory.map(entry => entry.scores.physical);
    const mentalData = userData.quizHistory.map(entry => entry.scores.mental);
    const concentrationData = userData.quizHistory.map(entry => entry.scores.concentration);
    quizHistoryChart = new Chart(quizHistoryChartCtx, {
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
};
const saveData = async () => {
    try { await setDoc(getUserDocRef(), userData); } catch (error) { console.error("Error saving data:", error); }
};
const awardBadge = async (badgeId) => {
    if (!userData.badges[badgeId]) {
        const userDocRef = getUserDocRef();
        userData.badges[badgeId] = true;
        await updateDoc(userDocRef, { [`badges.${badgeId}`]: true });
        showNotification("Thành Tựu Mới!", `Bạn đã nhận được huy hiệu "${allBadges.find(b => b.id === badgeId).name}"!`);
    }
};
const initApp = () => {
    loadingSpinner.classList.add('hidden');
    mainContent.classList.remove('hidden');
    userIdDisplay.textContent = userId;
    updateUI();
};
const getQuizResultEvaluation = (scores) => {
    const { physical, mental, concentration } = scores;
    const dependencyScore = ((physical * 0.4) + (mental * 0.4) + (concentration * 0.2)) / 5;
    const dependencyPercentage = (dependencyScore / 5) * 100;
    const formattedPercentage = dependencyPercentage.toFixed(2);
    let evaluationDetails = `
        <p><strong>Điểm phụ thuộc mạng xã hội của bạn là <span class="text-indigo-600 font-bold">${formattedPercentage}%</span>.</strong></p>
        <div class="p-4 bg-white rounded-lg shadow-inner">
            <h5 class="font-bold text-lg mb-2">1. Phân tích chi tiết từng khía cạnh</h5>
            <p class="mb-1"><strong>Sức khỏe thể chất:</strong> (Điểm: ${physical}/25) - ${physical >= 15 ? 'Đang ở mức tốt.' : (physical >= 10 ? 'Cần cải thiện.' : 'Đang báo động.')}</p>
            <p class="mb-1"><strong>Sức khỏe tinh thần:</strong> (Điểm: ${mental}/25) - ${mental >= 15 ? 'Rất ổn định.' : (mental >= 10 ? 'Cần được quan tâm.' : 'Đang báo động.')}</p>
            <p class="mb-1"><strong>Mức độ tập trung:</strong> (Điểm: ${concentration}/25) - ${concentration >= 15 ? 'Rất tốt.' : (concentration >= 10 ? 'Cần rèn luyện thêm.' : 'Đang báo động.')}</p>
        </div>
        <div class="p-4 bg-white rounded-lg shadow-inner mt-4">
            <h5 class="font-bold text-lg mb-2">2. Lời khuyên tổng thể</h5>
            <p>${formattedPercentage >= 60 ? 'Mức độ phụ thuộc mạng xã hội của bạn khá cao. Hãy cân nhắc điều chỉnh thói quen sử dụng mạng xã hội.' :
                formattedPercentage >= 40 ? 'Bạn kiểm soát ở mức trung bình. Có thể cải thiện thêm!' :
                'Bạn kiểm soát rất tốt! Hãy tiếp tục phát huy.' }</p>
        </div>
    `;
    return { evaluationDetails, dependencyPercentage, finalAdvice: '' };
};
// --- Event Listeners ---
setLimitBtn.addEventListener('click', async () => {
    const newLimit = parseInt(limitInput.value, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
        userData.limit = newLimit;
        await saveData();
        showNotification("Giới hạn đã được đặt", `Giới hạn hàng ngày của bạn đã được đặt là ${newLimit} phút.`);
        updateUI();
    }
});
submitUsageBtn.addEventListener('click', async () => {
    let totalUsage = 0;
    socialApps.forEach(app => {
        const input = document.getElementById(`input-${app.id}`);
        const value = parseInt(input.value, 10) || 0;
        if (!userData.appUsage[app.id]) userData.appUsage[app.id] = Array(7).fill(0);
        userData.appUsage[app.id][todayIndex] = value;
        totalUsage += value;
    });
    userData.weeklyData[todayIndex] = totalUsage;
    await saveData();
    showNotification("Cập nhật thành công", `Tổng thời gian sử dụng hôm nay là ${totalUsage} phút.`);
    updateUI();
});
addActivityBtn.addEventListener('click', async () => {
    const newActivityName = newActivityInput.value.trim();
    if (newActivityName) {
        const newActivityId = newActivityName.replace(/\s+/g, '_').toLowerCase();
        const newActivity = { id: newActivityId, name: newActivityName };
        userData.customActivities = userData.customActivities || [];
        userData.customActivities.push(newActivity);
        await saveData();
        newActivityInput.value = '';
        showNotification("Hoạt động mới", "Bạn đã thêm một hoạt động lành mạnh mới!");
        awardBadge('custom_activity');
        updateUI();
    }
});
document.addEventListener('click', async (e) => {
    if (e.target.matches('.complete-activity-btn')) {
        const activityId = e.target.dataset.id;
        if (!userData.completedActivities[activityId]) {
            userData.completedActivities[activityId] = new Date().toISOString().slice(0, 10);
            await saveData();
            awardBadge('first_activity');
            const allActivitiesCompleted = [...defaultHealthyActivities, ...(userData.customActivities || [])].every(activity => userData.completedActivities[activity.id]);
            if (allActivitiesCompleted) {
                awardBadge('all_activities');
            }
            // Handle streaks (simplified for demonstration)
            userData.lastActivityDate = new Date().toISOString().slice(0, 10);
            await saveData();
            updateUI();
        }
    }
});
startQuizBtn.addEventListener('click', () => {
    const generateQuiz = (containerId, questions) => {
        const container = document.getElementById(containerId);
        container.innerHTML = questions.map((q, index) => `
            <div class="quiz-question" data-category="${containerId}" data-index="${index}">
                <p class="font-medium">${index + 1}. ${q.q}</p>
                <div class="flex flex-wrap gap-2 mt-2">
                    ${quizOptions.map((option, optIndex) => `
                        <button data-score="${q.score[optIndex]}" class="quiz-option bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-100 transition duration-200">
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
    startQuizBtn.classList.add('hidden');
    submitQuizBtn.classList.remove('hidden');
    quizStatus.textContent = 'Hãy trả lời tất cả các câu hỏi để xem kết quả.';
});
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
        quizEvaluation.innerHTML = evaluation.evaluationDetails;
        dependencyScoreDisplay.textContent = ``;
        const today = new Date().toISOString().slice(0, 10);
        userData.quizHistory.push({ date: today, scores: scores });
        await saveData();
        quizResultSection.classList.remove('hidden');
        quizStatus.classList.add('hidden');
        submitQuizBtn.classList.add('hidden');
        awardBadge('quiz_pro');
        const dependencyPercentage = ((scores.physical * 0.4) + (scores.mental * 0.4) + (scores.concentration * 0.2)) / 5 * 20;
        if (dependencyPercentage < 50) awardBadge('dependency_low_50');
        if (dependencyPercentage < 40) awardBadge('dependency_low_40');
        if (dependencyPercentage < 30) awardBadge('dependency_low_30');
        if (quizChart) quizChart.destroy();
        quizChart = new Chart(quizChartCtx, {
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
        quizStatus.textContent = 'Vui lòng trả lời tất cả các câu hỏi.';
    }
});
quizContent.addEventListener('click', (e) => {
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
// Pomodoro Timer Logic
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
    oscillator.frequency.value = 440;
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
    startPauseBtn.textContent = 'Tạm Dừng';
    startPauseBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
    startPauseBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
    resetBtn.classList.remove('hidden');
    pomodoro.intervalId = setInterval(() => {
        pomodoro.timeRemaining--;
        timerDisplay.textContent = formatTime(pomodoro.timeRemaining);
        if (pomodoro.timeRemaining <= 0) {
            playBellSound();
            if (pomodoro.isWorkTime) {
                pomodoro.isWorkTime = false;
                pomodoro.timeRemaining = pomodoro.breakDuration;
                timerStatus.textContent = 'Giờ nghỉ!';
            } else {
                pomodoro.isWorkTime = true;
                pomodoro.timeRemaining = pomodoro.workDuration;
                timerStatus.textContent = 'Bắt đầu một chu kỳ mới!';
            }
            timerDisplay.textContent = formatTime(pomodoro.timeRemaining);
        }
    }, 1000);
}
function pauseTimer() {
    pomodoro.isRunning = false;
    startPauseBtn.textContent = 'Tiếp Tục';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    clearInterval(pomodoro.intervalId);
}
function resetTimer() {
    pauseTimer();
    pomodoro.isWorkTime = true;
    pomodoro.timeRemaining = pomodoro.workDuration;
    timerDisplay.textContent = formatTime(pomodoro.workDuration);
    timerStatus.textContent = 'Sẵn sàng bắt đầu!';
    startPauseBtn.textContent = 'Bắt Đầu';
    startPauseBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
    startPauseBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    resetBtn.classList.add('hidden');
}
startPauseBtn.addEventListener('click', () => {
    if (pomodoro.timeRemaining <= 0) {
        pomodoro.timeRemaining = pomodoro.workDuration;
        timerStatus.textContent = 'Giờ làm việc!';
    }
    if (pomodoro.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});
resetBtn.addEventListener('click', resetTimer);
// --- Firebase Auth State Listener ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        const userDocRef = getUserDocRef();
        onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                userData = docSnapshot.data();
                // streaks, login, etc. can be handled here
                initApp();
            } else {
                userData.limit = initialLimit;
                saveData();
                initApp();
            }
        }, (error) => {
            console.error("Firestore listener error:", error);
            initApp();
        });
    } else {
        if (initial_auth_token) {
            try {
                await signInWithCustomToken(auth, initial_auth_token);
            } catch (error) {
                console.error("Error signing in with custom token:", error);
                initApp();
            }
        } else {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error signing in anonymously:", error);
                initApp();
            }
        }
    }
});
});
