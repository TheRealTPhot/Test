// main.js - phiên bản đã được làm sạch và chú thích, sử dụng Firebase v11.6.1

document.addEventListener('DOMContentLoaded', async function () {
  // ===== Firebase SDK modules =====
  // Import các module cần thiết từ CDN (v11.6.1, ES module)
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
  const { getFirestore, doc, setDoc, updateDoc, onSnapshot, setLogLevel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  // ===== Firebase config & app khởi tạo =====
  setLogLevel('debug');
  const app_id = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
  const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};
  const initial_auth_token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  // ======== App constants and state =========
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
  // ... (các hằng số khác như socialApps, defaultHealthyActivities, allBadges, quizQuestions, quizOptions, pomodoro...)

  // ======== DOM elements & helper functions =========
  // ... (lấy reference tới các phần tử DOM, showNotification, updateUI, updateCharts, saveData, awardBadge, initApp, getQuizResultEvaluation)
  // ... (giữ nguyên như code gốc bạn đã gửi, hoặc copy từ phiên bản trước)

  // ======== Event listeners UI =========
  // ... (tất cả event listeners cho: setLimitBtn, submitUsageBtn, addActivityBtn, complete-activity-btn, startQuizBtn, submitQuizBtn, quizContent, Pomodoro timer...)

  // ======== Firebase Auth State Listener =========
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.uid;
      const userDocRef = doc(db, `artifacts/${app_id}/users/${userId}/usage_data`, 'user_data');
      onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          userData = docSnapshot.data();
          // Xử lý login streak, badge, v.v. ở đây nếu muốn
          initApp();
        } else {
          userData.limit = initialLimit;
          setDoc(userDocRef, userData);
          initApp();
        }
      }, (error) => {
        console.error("Firestore listener error:", error);
        initApp();
      });
    } else {
      // Đăng nhập bằng custom token (nếu có) hoặc anonymous
      try {
        if (initial_auth_token) {
          await signInWithCustomToken(auth, initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase Auth error:", error);
        initApp();
      }
    }
  });

  // ===== Bạn có thể thêm các hàm helper, event listeners ở dưới (hoặc tách file nhỏ nếu code lớn) =====
});
