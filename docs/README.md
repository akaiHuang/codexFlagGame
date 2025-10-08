# 世界國旗挑戰遊戲 - 完整文件

## 📖 目錄

1. [專案說明](#專案說明)
2. [快速開始](#快速開始)
3. [Firebase 設定](#firebase-設定)
4. [部署指南](#部署指南)
5. [安全性說明](#安全性說明)
6. [測試指南](#測試指南)
7. [專案結構](#專案結構)

---

## 📱 專案說明

這是一個互動式的世界國旗挑戰遊戲，使用 Firebase 作為後端服務。

### 主要功能

- 🎮 **猜國旗遊戲**：從四個選項中選出正確答案
- 🌍 **地區選擇**：支援全球、亞洲、歐洲等多個地區
- 🏆 **排行榜系統**：全球和地區排行榜
- 👤 **使用者認證**：支援 Google 登入和訪客模式
- 📊 **統計追蹤**：記錄連勝紀錄、準確率等

### 技術架構

- **前端**：HTML5, CSS3, Vanilla JavaScript
- **後端**：Firebase (Authentication, Firestore, Hosting)
- **部署**：Firebase Hosting + GitHub Actions

---

## 🚀 快速開始

### 1. Clone 專案

```bash
git clone https://github.com/akaiHuang/codexFlagGame.git
cd codexFlagGame
```

### 2. 設定 Firebase

如果要使用自己的 Firebase 專案：

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 建立新專案或選擇現有專案
3. 專案設定 → 您的應用程式 → 複製配置
4. 編輯 `config/firebase.config.js`：

```javascript
window.__FLAG_APP_FIREBASE__ = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. 本地測試

```bash
# 直接開啟 index.html
open index.html

# 或使用簡單的本地伺服器
python3 -m http.server 8000
# 然後訪問 http://localhost:8000
```

### 4. 部署到 Firebase

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入
firebase login

# 部署
firebase deploy
```

---

## 🔧 Firebase 設定

### 必要步驟（30-35 分鐘）

#### 1️⃣ Authentication 設定（5 分鐘）

1. 前往 [Authentication](https://console.firebase.google.com/project/_/authentication)
2. 啟用登入方式：
   - ✅ Google（OAuth 2.0）
   - ✅ 匿名驗證

3. 設定授權網域（重要！）
   - 前往 Authentication → Settings → Authorized domains
   - **移除**：`localhost`, `127.0.0.1`
   - **保留**：`your-project.web.app`, `your-project.firebaseapp.com`

#### 2️⃣ Firestore Database 設定（10 分鐘）

**建立集合**：

1. **profiles** - 使用者名稱
   ```
   文件 ID: {userId}
   欄位:
   - name (string): 使用者名稱
   - createdAt (timestamp): 建立時間
   - updatedAt (timestamp): 更新時間
   ```

2. **scores** - 全球排行榜
   ```
   文件 ID: {userId}
   欄位:
   - uid (string): 使用者 ID
   - bestStreak (number): 最佳連勝
   - accuracy (number): 準確率 (0-100)
   - total (number): 總題數
   - region (string): 地區代碼
   - ts (timestamp): 時間戳記
   ```

3. **scores_region** - 地區排行榜
   ```
   文件 ID: {userId}_{region}
   欄位:
   - uid (string): 使用者 ID
   - region (string): 地區代碼
   - bestStreak (number): 最佳連勝
   - accuracy (number): 準確率
   - total (number): 總題數
   - ts (timestamp): 時間戳記
   ```

**Security Rules**：

前往 Firestore → Rules，貼上以下規則：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // 防止頻繁寫入（3秒限流）
    function notTooFrequent() {
      return !resource.exists || 
             request.time > resource.data.ts + duration.value(3, 's');
    }
    
    // profiles - 使用者名稱
    match /profiles/{userId} {
      allow read: if true;  // 公開讀取
      allow write: if isOwner(userId) && notTooFrequent() &&
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() <= 50;
    }
    
    // scores - 全球排行榜
    match /scores/{userId} {
      allow read: if true;  // 公開讀取
      allow write: if isOwner(userId) && notTooFrequent() &&
        request.resource.data.bestStreak >= 0 &&
        request.resource.data.bestStreak <= 1000 &&
        request.resource.data.accuracy >= 0 &&
        request.resource.data.accuracy <= 100;
    }
    
    // scores_region - 地區排行榜
    match /scores_region/{userRegionId} {
      allow read: if true;  // 公開讀取
      allow write: if isSignedIn() && notTooFrequent() &&
        userRegionId.matches('^' + request.auth.uid + '_[A-Z]{2}$') &&
        request.resource.data.uid == request.auth.uid;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Indexes（索引）**：

前往 Firestore → Indexes，建立複合索引：

1. **scores** 集合
   - bestStreak (Descending)
   - accuracy (Descending)

2. **scores_region** 集合
   - region (Ascending)
   - bestStreak (Descending)

#### 3️⃣ Firebase Hosting 設定（10 分鐘）

```bash
# 初始化 Hosting
firebase init hosting

# 選項：
# - Public directory: .
# - Single-page app: Yes
# - GitHub Actions: Yes (可選)

# 部署
firebase deploy --only hosting
```

---

## 🚀 部署指南

### 部署到 Firebase Hosting

```bash
# 1. 確認已登入
firebase login

# 2. 部署
firebase deploy --only hosting

# 3. 訪問網站
# https://your-project.web.app
```

### 自動部署（GitHub Actions）

專案已設定 GitHub Actions 自動部署：

- **PR 預覽**：每個 Pull Request 都會建立預覽 URL
- **自動部署**：合併到 main 分支後自動部署到正式環境

設定步驟：

1. 前往 GitHub 專案 → Settings → Secrets
2. 新增 Secret：
   - 名稱：`FIREBASE_SERVICE_ACCOUNT_YOUR_PROJECT`
   - 值：從 Firebase Console 取得 Service Account JSON

---

## 🔒 安全性說明

### Firebase API Key 可以公開嗎？

✅ **完全安全！** 

Firebase API Key 與傳統 API Key 不同：

- **不是密鑰**：只是專案識別碼
- **不授予權限**：無法單獨存取資料
- **Google 官方說明**：設計上就是要放在前端程式碼中

### 真正的安全保護

1. **Firestore Security Rules** ⭐⭐⭐⭐⭐
   - 只有登入使用者能寫入
   - 只能寫入自己的資料
   - 3 秒寫入限流
   - 資料範圍驗證

2. **Authentication 授權網域**
   - 限制登入來源
   - 只允許官方網域

3. **資料驗證**
   - bestStreak: 0-1000
   - accuracy: 0-100
   - total: 0-100000

### 防護措施總結

```
即使有人拿到 API Key，也無法：
❌ 竄改他人分數（isOwner 驗證）
❌ 快速大量寫入（3秒限流）
❌ 寫入異常數值（範圍驗證）
❌ 從非官方網域登入（授權網域限制）
```

詳細說明：
- [Firebase API Keys 安全說明](https://firebase.google.com/docs/projects/api-keys)
- [Security Rules 最佳實踐](https://firebase.google.com/docs/rules/best-practices)

---

## 🧪 測試指南

### 功能測試清單

#### 基本功能
- [ ] 頁面正常載入
- [ ] 國旗圖示正確顯示
- [ ] 四個選項正常顯示
- [ ] 點擊答案有反饋（正確/錯誤）
- [ ] 下一題按鈕正常運作

#### 認證功能
- [ ] Google 登入正常
- [ ] 訪客身份登入正常
- [ ] 登入後顯示使用者名稱
- [ ] 登出功能正常

#### 排行榜功能
- [ ] 可以開啟排行榜
- [ ] 全球排行榜顯示正確
- [ ] 地區排行榜顯示正確
- [ ] 成績儲存成功
- [ ] 排行榜排序正確（連勝 → 準確率）

#### 地區選擇
- [ ] 地區切換正常
- [ ] 不同地區顯示不同國旗
- [ ] 地區排行榜對應正確

#### 統計功能
- [ ] 連勝紀錄正確計算
- [ ] 準確率正確計算
- [ ] 總題數正確累計
- [ ] 本地儲存正常運作

### 瀏覽器相容性

測試瀏覽器：
- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] 行動裝置瀏覽器

---

## 📂 專案結構

```
codexFlagGame/
├── index.html                 # 主應用（包含所有功能）
├── firebase.json              # Firebase CLI 配置
├── README.md                  # 快速開始指南
├── config/
│   ├── firebase.config.js     # Firebase 配置
│   └── firestore.rules        # Firestore Security Rules
├── docs/
│   └── README.md              # 完整文件（本檔案）
├── src/js/                    # JS 模組（開發參考用）
│   ├── firebase.js
│   ├── game.js
│   ├── particles.js
│   └── storage.js
└── .github/
    └── workflows/             # GitHub Actions 自動部署
```

### 檔案說明

| 檔案 | 說明 |
|------|------|
| `index.html` | 主應用，包含所有 HTML/CSS/JS |
| `config/firebase.config.js` | Firebase 配置（含教學註解） |
| `firebase.json` | Firebase CLI 配置 |
| `config/firestore.rules` | Firestore Security Rules |
| `src/js/*` | JS 模組（開發參考用，已整合在 index.html） |

---

## 🛠️ 維護指南

### 更新 Firebase 配置

編輯 `config/firebase.config.js`：

```bash
nano config/firebase.config.js
# 修改配置
firebase deploy
```

### 更新 Security Rules

編輯 `config/firestore.rules`，然後：

```bash
firebase deploy --only firestore:rules
```

---

## 📊 效能優化

專案已實作以下優化：

- ✅ **粒子動畫智能跳過**：無粒子時停止計算
- ✅ **國家池預先生成**：避免重複計算
- ✅ **Firestore 查詢限制**：limit(50) 避免過度讀取
- ✅ **本地儲存快取**：localStorage 減少網路請求
- ✅ **模組化架構**：所有功能整合在 index.html

---

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📄 授權

MIT License

---

## 📞 聯絡方式

專案連結：https://github.com/akaiHuang/codexFlagGame

線上版本：https://codexflaggame.web.app

---

**建立者：akaiHuang**  
**最後更新：2025年10月8日**
