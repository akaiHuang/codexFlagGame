# Firebase 完整設定指南

根據您提供的截圖，以下是完整的 Firebase 設定步驟。

---

## 📋 目錄

1. [Firestore 資料庫結構](#firestore-資料庫結構)
2. [Security Rules 設定](#security-rules-設定)
3. [Authentication 設定](#authentication-設定)
4. [索引設定](#索引設定)
5. [完整設定步驟](#完整設定步驟)

---

## 🗄️ Firestore 資料庫結構

### 集合（Collections）

您的專案需要以下三個主要集合：

#### 1. `profiles` - 使用者資料
```
profiles/
  └── {uid}/
      ├── uid: string           // 使用者 ID
      ├── name: string          // 顯示名稱（用於排行榜）
      ├── createdAt: timestamp  // 建立時間
      └── updatedAt: timestamp  // 更新時間
```

**範例文件：**
```javascript
{
  uid: "8QIvPfnycwRG3aaRTkmfIRjgiVp1",
  name: "huang akai",
  createdAt: 2025年10月8日 下午2:49:57 [UTC+8],
  updatedAt: 2025年10月8日 下午2:49:57 [UTC+8]
}
```

#### 2. `scores` - 全球排行榜
```
scores/
  └── {uid}/
      ├── uid: string           // 使用者 ID
      ├── bestStreak: number    // 最佳連勝紀錄
      ├── accuracy: number      // 準確率 (0-100)
      ├── total: number         // 累積題數
      ├── region: string        // 地區 (global/asia/europe等)
      └── ts: timestamp         // 時間戳記
```

**範例文件：**
```javascript
{
  uid: "5V6g0ZDNnIgBD67lqyU1AmmJarJ2",
  bestStreak: 2,
  accuracy: 44,
  total: 9,
  region: "global",
  ts: 2025年10月8日 下午2:49:46 [UTC+8]
}
```

#### 3. `scores_region` - 地區排行榜
```
scores_region/
  └── {uid}_{region}/
      ├── uid: string           // 使用者 ID
      ├── bestStreak: number    // 最佳連勝紀錄
      ├── accuracy: number      // 準確率 (0-100)
      ├── total: number         // 累積題數
      ├── region: string        // 地區
      └── ts: timestamp         // 時間戳記
```

**範例文件 ID：**
- `5V6g0ZDNnIgBD67lqyU1AmmJarJ2_global`
- `8QIvPfnycwRG3aaRTkmfIRjgiVp1_asia`

---

## 🔒 Security Rules 設定

### 完整的 Firestore Security Rules

複製以下規則到 Firebase Console → Firestore Database → 規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // 使用者個人資料 (profiles)
    // ========================================
    match /profiles/{uid} {
      // 任何人都可以讀取個人資料（用於排行榜顯示名稱）
      allow read: if true;
      
      // 只有本人可以建立和更新自己的資料
      allow create, update: if request.auth != null 
                            && request.auth.uid == uid
                            && request.resource.data.keys().hasOnly(['uid', 'name', 'createdAt', 'updatedAt'])
                            && request.resource.data.uid == request.auth.uid
                            && request.resource.data.name is string
                            && request.resource.data.createdAt is timestamp
                            && request.resource.data.updatedAt is timestamp;
      
      // 禁止刪除
      allow delete: if false;
    }
    
    // ========================================
    // 全球排行榜 (scores)
    // ========================================
    match /scores/{uid} {
      // 任何人都可以讀取排行榜
      allow read: if true;
      
      // 只有認證使用者可以寫入，且必須是自己的資料
      allow create, update: if request.auth != null 
                            && request.auth.uid == uid
                            && isScoreData(request.resource.data);
      
      // 禁止刪除
      allow delete: if false;
    }
    
    // ========================================
    // 地區排行榜 (scores_region)
    // ========================================
    match /scores_region/{docId} {
      // 任何人都可以讀取排行榜
      allow read: if true;
      
      // 只有認證使用者可以寫入，且文件 ID 格式必須正確
      allow create, update: if request.auth != null 
                            && docId.matches('^' + request.auth.uid + '_[a-z]+$')
                            && request.resource.data.uid == request.auth.uid
                            && isScoreData(request.resource.data);
      
      // 禁止刪除
      allow delete: if false;
    }
    
    // ========================================
    // 輔助函數
    // ========================================
    function isScoreData(data) {
      return data.keys().hasOnly(['uid', 'bestStreak', 'accuracy', 'total', 'region', 'ts'])
          && data.uid is string
          && data.bestStreak is int && data.bestStreak >= 0
          && data.accuracy is int && data.accuracy >= 0 && data.accuracy <= 100
          && data.total is int && data.total >= 0
          && data.region is string
          && data.ts is timestamp
          && request.time >= data.ts;
    }
  }
}
```

### 設定步驟

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 左側選單選擇 **Firestore Database**
4. 點擊上方的 **規則** 標籤
5. 將上面的規則複製貼上
6. 點擊 **發布** 按鈕
7. 確認發布成功

---

## 🔐 Authentication 設定

### 啟用的登入方式

根據您的截圖，需要啟用：

#### 1. Google 登入
1. Firebase Console → **Authentication** → **登入方式**
2. 點擊 **Google**
3. 切換為 **已啟用**
4. 設定專案的公開名稱
5. 選擇專案支援電子郵件
6. 點擊 **儲存**

#### 2. 匿名登入
1. Firebase Console → **Authentication** → **登入方式**
2. 點擊 **匿名**
3. 切換為 **已啟用**
4. 點擊 **儲存**

### ⚠️ 不需要啟用的項目
- ❌ Email/密碼登入（已從程式碼移除）

---

## 📊 索引設定

### 必要的複合索引

根據您的截圖，需要建立以下索引：

#### 1. `scores` 集合索引
- **集合 ID**: `scores`
- **已建立索引的欄位**:
  - `bestStreak` (降冪 ↓)
  - `accuracy` (降冪 ↓)
  - `__name__` (降冪 ↓)
- **查詢範圍**: 集合
- **狀態**: 已啟用

#### 2. `scores_region` 集合索引
- **集合 ID**: `scores_region`
- **已建立索引的欄位**:
  - `region` (升冪 ↑)
  - `bestStreak` (降冪 ↓)
  - `__name__` (降冪 ↓)
- **查詢範圍**: 集合
- **狀態**: 已啟用

### 建立索引的方式

#### 方法 1: 自動建立（推薦）
1. 啟動您的應用程式
2. 點擊「排行榜」按鈕
3. Firebase 會在 Console 中顯示需要建立索引的錯誤訊息
4. 點擊錯誤訊息中的連結，會自動跳轉到索引建立頁面
5. 點擊「建立索引」
6. 等待幾分鐘讓索引建立完成

#### 方法 2: 手動建立
1. Firebase Console → **Firestore Database** → **索引**
2. 點擊 **新增索引**
3. 選擇集合 ID
4. 加入欄位和排序順序
5. 點擊 **建立**

---

## 🚀 完整設定步驟

### 步驟 1: 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」
3. 輸入專案名稱（例如：`codexFlagGame`）
4. 選擇是否啟用 Google Analytics（建議啟用）
5. 完成專案建立

### 步驟 2: 啟用 Firestore

1. 左側選單選擇 **Firestore Database**
2. 點擊「建立資料庫」
3. 選擇模式：
   - **生產模式**（建議）- 需要設定 Security Rules
   - 測試模式 - 僅用於開發
4. 選擇地區（建議選擇 asia-east1 - 台灣）
5. 點擊「啟用」

### 步驟 3: 設定 Authentication

1. 左側選單選擇 **Authentication**
2. 點擊「開始使用」
3. 啟用 **Google** 和 **匿名** 登入方式（參考上方說明）

### 步驟 4: 設定 Security Rules

1. Firestore Database → **規則**
2. 複製上方的完整規則
3. 點擊「發布」

### 步驟 5: 取得 Firebase 配置

1. Firebase Console → 專案設定（齒輪圖示）
2. 滾動到「您的應用程式」區域
3. 選擇網頁應用程式（`</>`）
4. 註冊應用程式
5. 複製 Firebase SDK 配置物件

### 步驟 6: 更新本地配置

在 `firebase.config.js` 中填入您的配置：

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

### 步驟 7: 測試功能

1. 啟動本地伺服器：`python3 -m http.server 8000`
2. 開啟瀏覽器：`http://localhost:8000`
3. 測試以下功能：
   - ✅ 匿名登入（應自動執行）
   - ✅ Google 登入
   - ✅ 答題並檢查統計
   - ✅ 查看排行榜
   - ✅ 輸入暱稱並儲存

### 步驟 8: 建立索引

當您第一次查看排行榜時：
1. 開啟瀏覽器開發工具（F12）
2. 查看 Console 錯誤訊息
3. 點擊錯誤中的索引連結
4. 建立所需索引
5. 等待索引建立完成（通常需要幾分鐘）

---

## 🎯 驗證清單

設定完成後，請確認：

- [ ] Firestore 已啟用
- [ ] Security Rules 已設定並發布
- [ ] Google 登入已啟用
- [ ] 匿名登入已啟用
- [ ] `scores` 索引已建立並啟用
- [ ] `scores_region` 索引已建立並啟用
- [ ] Firebase 配置已填入 `firebase.config.js`
- [ ] 本地測試所有功能正常

---

## 🔍 常見問題

### Q: 為什麼排行榜載入失敗？
A: 可能是索引尚未建立。檢查 Console 錯誤訊息並建立所需索引。

### Q: 為什麼無法儲存暱稱？
A: 檢查 Security Rules 是否正確設定，確認使用者已登入（不是匿名）。

### Q: 匿名使用者可以上傳分數嗎？
A: 可以！匿名使用者也有 UID，可以儲存分數到排行榜。

### Q: 如何清除測試資料？
A: 前往 Firestore Database → 資料，手動刪除文件或集合。

---

## 📚 相關資源

- [Firebase 官方文件](https://firebase.google.com/docs)
- [Firestore Security Rules 參考](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firebase Authentication 指南](https://firebase.google.com/docs/auth)
- [Firestore 索引說明](https://firebase.google.com/docs/firestore/query-data/indexing)

---

## 💡 進階設定（選用）

### 啟用 App Check（推薦）

防止未授權的客戶端存取：

1. Firebase Console → **App Check**
2. 註冊您的應用程式
3. 選擇認證提供者（reCAPTCHA）
4. 啟用強制執行

### 設定配額和限制

1. Firebase Console → **Firestore Database** → **用量**
2. 設定每日讀取/寫入限制
3. 啟用預算警示

### 監控和分析

1. Firebase Console → **Analytics**
2. 查看使用者活動
3. 追蹤關鍵事件

---

**設定完成！祝您遊戲愉快！** 🎉
