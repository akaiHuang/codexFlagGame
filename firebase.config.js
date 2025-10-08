// ============================================
// Firebase 配置檔案
// ============================================
// 
// 📋 使用說明：
// 
// 1. 如果您是新開發者，需要填入自己的 Firebase 配置：
//    - 前往 Firebase Console: https://console.firebase.google.com
//    - 建立或選擇專案
//    - 專案設定 → 您的應用程式 → 複製配置
//    - 將配置貼到下方 window.__FLAG_APP_FIREBASE__
//
// 2. 此檔案會被部署到 Firebase Hosting（安全的）
//    - Firebase API Key 設計上可以公開
//    - 真正的安全由 Firestore Security Rules 保護
//    - 詳見 PRODUCTION_SECURITY.md
//
// 3. 本地開發時可以修改此檔案測試不同配置
//
// ⚠️  注意：此檔案會被部署，不要放其他敏感資訊
// ============================================

window.__FLAG_APP_FIREBASE__ = {
  // Firebase 專案配置
  apiKey: "AIzaSyAaVDoqkdSRFV2kHjV1IrHdlJdgYntHP1E",
  authDomain: "codexflaggame.firebaseapp.com",
  projectId: "codexflaggame",
  storageBucket: "codexflaggame.firebasestorage.app",
  messagingSenderId: "571045602455",
  appId: "1:571045602455:web:4a42bcead0d4b1223875d2",
  measurementId: "G-P0S3Z36EM2"
};

// ============================================
// 🔰 新開發者快速設定範例：
// ============================================
// 
// window.__FLAG_APP_FIREBASE__ = {
//   apiKey: "YOUR_API_KEY",                    // 從 Firebase Console 取得
//   authDomain: "YOUR_PROJECT.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID",
//   measurementId: "YOUR_MEASUREMENT_ID"       // Google Analytics（可選）
// };
//
// 💡 取得配置的步驟：
// 1. 前往 https://console.firebase.google.com
// 2. 選擇專案 → 齒輪圖示 → 專案設定
// 3. 往下滾動到「您的應用程式」區塊
// 4. 選擇網頁應用程式（</> 圖示）
// 5. 複製 firebaseConfig 物件的內容
// 6. 貼上到上方的 window.__FLAG_APP_FIREBASE__
// ============================================
