# Firebase 配置說明

## ⚠️ 重要：部署前設定

此專案已移除 Firebase 配置的敏感資訊。您需要在部署時設定環境變數。

## 本地開發設定

1. 複製 `firebase.config.example.js` 為 `firebase.config.js`
2. 填入您的 Firebase 配置資訊
3. `firebase.config.js` 已被 `.gitignore` 忽略，不會被提交

## 部署設定（GitHub Pages / Vercel / Netlify）

### 方法 1: 在 HTML 中使用全域變數（推薦用於公開專案）

在部署平台的環境變數中設定：

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 方法 2: 建立獨立配置檔案

建立 `firebase.config.js`：

```javascript
window.__FLAG_APP_FIREBASE__ = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id",
  measurementId: "your_measurement_id"
};
```

然後在 `index.html` 中引入：
```html
<script src="firebase.config.js"></script>
```

## Firebase 安全性設定

請參考 `FIREBASE_SECURITY.md` 設定 Firestore Security Rules。

**注意：** Firebase API Key 雖然可以公開，但務必設定 Security Rules 保護資料庫！
