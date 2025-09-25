// main.js
document.addEventListener('DOMContentLoaded', async function () {
    // Firebase SDKs (module import)
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
    const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
    const { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    const { setLogLevel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

    // Config from global
    setLogLevel('debug');
    const app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};
    const initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

    // Firebase init
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

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

    // DOM Elements
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

    // Helper functions...
    // (for brevity, add all helper functions from your current working code here, unchanged)

    // ... (Copy all the code logic from your previous <script type="module"> section here)
    // Ensure everything is wrapped inside the DOMContentLoaded block

    // Example for one event:
    setLimitBtn.addEventListener('click', async () => {
        const newLimit = parseInt(limitInput.value, 10);
        if (!isNaN(newLimit) && newLimit > 0) {
            userData.limit = newLimit;
            await saveData();
            showNotification("Giới hạn đã được đặt", `Giới hạn hàng ngày của bạn đã được đặt là ${newLimit} phút.`);
            updateUI();
        }
    });

    // (Repeat for all other event handlers and app logic...)

    // Firebase Auth State Listener...
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            const userDocRef = getUserDocRef();
            onSnapshot(userDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    userData = docSnapshot.data();
                    // ...update userData and UI as needed...
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
    // (And so on for all the logic...)

    // Copy all your app logic, helpers, event handlers, and feature code from the <script type="module"> block into here.
});
