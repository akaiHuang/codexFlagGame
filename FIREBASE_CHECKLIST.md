# Firebase 快速設定檢查表

使用此檢查表快速完成 Firebase 設定。

---

## 📋 設定前準備

- [ ] 已有 Google 帳號
- [ ] 已安裝瀏覽器（Chrome/Firefox/Safari）
- [ ] 已 Clone GitHub 專案到本地

---

## 🔥 Firebase Console 設定

### 步驟 1: 建立專案 (5 分鐘)

1. 前往 https://console.firebase.google.com/
2. 點擊「新增專案」
3. 輸入專案名稱: `codexFlagGame` (或自訂)
4. 啟用 Google Analytics (建議)
5. 選擇 Analytics 帳戶
6. 點擊「建立專案」
7. 等待專案建立完成

**✅ 完成:** 您應該看到 Firebase 專案控制台

---

### 步驟 2: 啟用 Firestore (3 分鐘)

1. 左側選單 → **Firestore Database**
2. 點擊「建立資料庫」
3. 選擇「以生產模式開始」
4. 選擇地區: **asia-east1 (台灣)** 或 **asia-northeast1 (東京)**
5. 點擊「啟用」
6. 等待資料庫建立完成

**✅ 完成:** 您應該看到空的 Firestore 資料庫

---

### 步驟 3: 設定 Security Rules (2 分鐘)

1. Firestore Database 頁面
2. 點擊上方「規則」標籤
3. 刪除現有規則
4. 開啟 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
5. 複製「完整的 Firestore Security Rules」
6. 貼上到規則編輯器
7. 點擊「發布」

**✅ 完成:** 規則狀態顯示「已發布」，時間為剛剛

---

### 步驟 4: 啟用 Authentication (3 分鐘)

#### 4.1 啟用匿名登入
1. 左側選單 → **Authentication**
2. 點擊「開始使用」(如果是第一次)
3. 點擊「登入方式」標籤
4. 點擊「匿名」
5. 切換為「已啟用」
6. 點擊「儲存」

**✅ 完成:** 匿名登入狀態顯示「已啟用」

#### 4.2 啟用 Google 登入
1. 在「登入方式」標籤中
2. 點擊「Google」
3. 切換為「已啟用」
4. 輸入專案的公開名稱: `世界國旗挑戰`
5. 選擇專案支援電子郵件 (您的 Gmail)
6. 點擊「儲存」

**✅ 完成:** Google 登入狀態顯示「已啟用」

---

### 步驟 5: 取得 Firebase 配置 (2 分鐘)

1. 點擊左上角齒輪圖示 → **專案設定**
2. 滾動到「您的應用程式」區域
3. 點擊 Web 應用程式圖示 `</>`
4. 輸入應用程式暱稱: `Flag Game Web`
5. 不要勾選「同時設定 Firebase Hosting」
6. 點擊「註冊應用程式」
7. 複製 `firebaseConfig` 物件中的所有值

**您會看到類似這樣的配置：**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  measurementId: "G-..."
};
```

**✅ 完成:** 配置已複製

---

## 💻 本地專案設定

### 步驟 6: 設定本地配置檔案 (2 分鐘)

1. 開啟終端機
2. 進入專案目錄:
   ```bash
   cd /path/to/codexFlagGame
   ```

3. 複製範例檔案:
   ```bash
   cp firebase.config.example.js firebase.config.js
   ```

4. 編輯 `firebase.config.js`:
   ```bash
   # 使用您喜歡的編輯器，例如：
   code firebase.config.js  # VS Code
   nano firebase.config.js  # Nano
   vim firebase.config.js   # Vim
   ```

5. 貼上您的 Firebase 配置:
   ```javascript
   window.__FLAG_APP_FIREBASE__ = {
     apiKey: "貼上您的 API Key",
     authDomain: "貼上您的 Auth Domain",
     projectId: "貼上您的 Project ID",
     storageBucket: "貼上您的 Storage Bucket",
     messagingSenderId: "貼上您的 Messaging Sender ID",
     appId: "貼上您的 App ID",
     measurementId: "貼上您的 Measurement ID"
   };
   ```

6. 儲存檔案

**✅ 完成:** `firebase.config.js` 已建立並填入配置

---

### 步驟 7: 啟動本地測試 (1 分鐘)

1. 在專案目錄中啟動伺服器:
   ```bash
   python3 -m http.server 8000
   ```

2. 開啟瀏覽器:
   ```
   http://localhost:8000
   ```

3. 開啟開發者工具 (F12)
4. 查看 Console 是否有錯誤

**✅ 完成:** 網頁正常載入，無 Firebase 相關錯誤

---

### 步驟 8: 測試功能 (5 分鐘)

#### 8.1 測試匿名登入
1. 重新整理頁面
2. 檢查右上角顯示「訪客」
3. 開發者工具 Console 應該沒有登入錯誤

**✅ 完成:** 匿名登入成功

#### 8.2 測試 Google 登入
1. 點擊「登入」按鈕
2. 點擊「使用 Google 登入」
3. 選擇 Google 帳號
4. 授權應用程式
5. 檢查右上角顯示您的 Google 名稱或 Email

**✅ 完成:** Google 登入成功

#### 8.3 測試答題功能
1. 答對一題國旗
2. 檢查統計數字是否更新
3. 查看是否有粒子特效

**✅ 完成:** 答題功能正常

#### 8.4 測試排行榜（第一次會失敗，這是正常的）
1. 點擊「排行榜」按鈕
2. 開發者工具會顯示需要建立索引的錯誤
3. **點擊錯誤訊息中的連結**
4. Firebase Console 會自動開啟索引建立頁面
5. 點擊「建立索引」
6. 等待 3-10 分鐘讓索引建立完成

**錯誤訊息範例：**
```
The query requires an index. You can create it here:
https://console.firebase.google.com/...
```

**✅ 完成:** 索引建立中（狀態：正在建立）

---

### 步驟 9: 建立索引 (10 分鐘)

#### 9.1 `scores` 索引
1. 點擊排行榜錯誤訊息中的第一個連結
2. 確認索引欄位:
   - `bestStreak` (降冪)
   - `accuracy` (降冪)
3. 點擊「建立」
4. 等待狀態變為「已啟用」

**✅ 完成:** `scores` 索引狀態為「已啟用」

#### 9.2 `scores_region` 索引
1. 切換到不同地區（例如：亞洲）
2. 再次點擊「排行榜」
3. 點擊新的錯誤訊息中的連結
4. 確認索引欄位:
   - `region` (升冪)
   - `bestStreak` (降冪)
5. 點擊「建立」
6. 等待狀態變為「已啟用」

**✅ 完成:** `scores_region` 索引狀態為「已啟用」

---

### 步驟 10: 驗證完整功能 (5 分鐘)

1. 重新整理頁面
2. 點擊「登入」→「使用 Google 登入」
3. 輸入暱稱（例如：「測試玩家」）
4. 答對幾題
5. 點擊「排行榜」
6. 確認可以看到排行榜資料
7. 檢查 Firestore 資料庫:
   - 前往 Firebase Console → Firestore Database
   - 確認有 `profiles`、`scores`、`scores_region` 三個集合
   - 點開查看是否有您的資料

**✅ 完成:** 所有功能正常運作

---

## 🎉 設定完成檢查清單

### Firebase Console
- [x] 專案已建立
- [x] Firestore 已啟用
- [x] Security Rules 已設定並發布
- [x] 匿名登入已啟用
- [x] Google 登入已啟用
- [x] Firebase 配置已取得

### 本地專案
- [x] `firebase.config.js` 已建立
- [x] Firebase 配置已填入
- [x] 本地伺服器可正常運行

### 索引
- [x] `scores` 索引已建立且狀態為「已啟用」
- [x] `scores_region` 索引已建立且狀態為「已啟用」

### 功能測試
- [x] 匿名登入正常
- [x] Google 登入正常
- [x] 答題功能正常
- [x] 統計資料正常儲存
- [x] 排行榜可正常顯示

---

## ⏱️ 預估總時間

- Firebase Console 設定: **15 分鐘**
- 本地專案設定: **3 分鐘**
- 測試與索引建立: **15 分鐘**
- **總計: 約 30-35 分鐘**

---

## 🆘 遇到問題？

### 問題 1: 排行榜一直載入失敗
**解決方案**: 檢查索引是否建立完成，狀態必須是「已啟用」，不是「正在建立」

### 問題 2: Google 登入後沒有顯示名稱
**解決方案**: 輸入暱稱後再登入，或在登入後重新輸入暱稱並重新載入頁面

### 問題 3: Console 顯示「missing firebaseConfig」
**解決方案**: 確認 `firebase.config.js` 檔案存在且配置正確填入

### 問題 4: 無法儲存到 Firestore
**解決方案**: 檢查 Security Rules 是否正確發布，確認沒有語法錯誤

---

## 📚 詳細說明

完整的 Firebase 設定說明請參考：
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - 詳細設定指南
- **[FIREBASE_SECURITY.md](FIREBASE_SECURITY.md)** - 安全性最佳實踐

---

**恭喜！您已完成 Firebase 設定！** 🎊
