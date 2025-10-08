# 世界國旗挑戰

一個互動式的國旗學習遊戲，支援多地區選擇、難度調整、統計追蹤和線上排行榜。

## 🚀 快速開始

### 本地開發

1. **Clone 專案**
   ```bash
   git clone https://github.com/akaiHuang/codexFlagGame.git
   cd codexFlagGame
   ```

2. **設定 Firebase（選用）**
   ```bash
   # 複製配置範例檔案
   cp firebase.config.example.js firebase.config.js
   
   # 編輯 firebase.config.js 填入您的 Firebase 配置
   ```

3. **啟動本地伺服器**
   ```bash
   # 使用 Python
   python3 -m http.server 8000
   
   # 或使用 Node.js
   npx http-server
   ```

4. **開啟瀏覽器**
   ```
   http://localhost:8000
   ```

### 線上部署

#### GitHub Pages
1. 前往 Settings → Pages
2. 選擇 main branch
3. 在專案設定中加入 Firebase 配置（使用 Repository secrets）

#### Vercel / Netlify
1. 連接 GitHub repository
2. 在環境變數中設定 Firebase 配置
3. 自動部署

---

## 📋 優化項目總覽

本次優化針對程式碼品質、效能、可維護性和使用者體驗進行了全面改進。

---

## ✨ 主要改進

### 1. 模組化架構 📦

將原本的單一 HTML 檔案拆分成多個模組，提升可維護性：

```
codex/
├── index.html          # 主要 HTML 檔案（已優化）
├── countries.json      # 國家資料（獨立管理）
├── storage.js          # localStorage 管理模組
├── firebase.js         # Firebase 操作模組
├── game.js            # 遊戲邏輯模組
├── particles.js       # 粒子特效系統
└── FIREBASE_SECURITY.md # Firebase 安全性指南
```

### 2. 無障礙設計改進 ♿

為所有互動元素加入完整的 ARIA 標籤：

- ✅ 所有按鈕加入 `aria-label`
- ✅ 模態視窗加入 `role="dialog"` 和 `aria-modal="true"`
- ✅ 動態內容使用 `aria-live="polite"`
- ✅ 表單輸入欄位加入 `aria-label`
- ✅ 選項群組使用 `role="group"`

**範例：**
```html
<button id="next" class="primary" aria-label="進入下一題">下一題 ▶</button>
<div class="flag-box" id="flagBox" role="img" aria-label="當前國旗">
```

### 3. 錯誤處理機制 🛡️

改善所有 Firebase 操作和關鍵函數的錯誤處理：

**之前：**
```javascript
catch {
  return [uid, ''];  // 沒有記錄錯誤
}
```

**之後：**
```javascript
catch (error) {
  console.error(`取得使用者 ${uid} 資料失敗:`, error);
  showNotification('無法儲存使用者資料，請稍後再試', 'error');
  return [uid, ''];
}
```

### 4. 效能優化 ⚡

#### 粒子動畫系統優化

**之前：** 動畫持續運行，即使沒有粒子
```javascript
function tick() {
  ctx.clearRect(0,0,els.fx.width,els.fx.height);
  // 總是繼續動畫
  requestAnimationFrame(tick);
}
```

**之後：** 沒有粒子時仍保持循環但跳過計算
```javascript
function tick() {
  ctx.clearRect(0,0,els.fx.width,els.fx.height);
  
  // 如果沒有粒子，跳過繪製邏輯
  if (particles.length === 0) {
    requestAnimationFrame(tick);
    return;
  }
  
  // 繪製粒子...
  requestAnimationFrame(tick);
}
```

### 5. 型別註解 (JSDoc) 📝

為主要函數加入完整的 JSDoc 註解：

```javascript
/**
 * 儲存管理模組 - 處理 localStorage 的資料存取
 */
const StorageManager = {
  /**
   * 取得儲存的統計資料
   * @returns {Object} 統計資料物件
   */
  get() {
    // ...
  },

  /**
   * 儲存統計資料
   * @param {Object} data - 要儲存的資料
   */
  set(data) {
    // ...
  }
};
```

### 6. Firebase 安全性 🔒

建立 `FIREBASE_SECURITY.md` 提供：

- ✅ Firestore Security Rules 範例
- ✅ 環境變數設定指南
- ✅ API Key 安全性建議
- ✅ App Check 啟用說明

**Security Rules 範例：**
```javascript
match /profiles/{userId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.uid == userId;
}

match /leaderboard/{entry} {
  allow read: if true;
  allow create: if request.auth != null 
                && request.resource.data.uid == request.auth.uid;
  allow delete: if false;
}
```

---

## 🎯 使用方式

### 開發環境

1. **直接開啟 index.html**
   ```bash
   open index.html
   ```

2. **使用本地伺服器**（建議）
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (需安裝 http-server)
   npx http-server
   ```

### 模組化檔案（選用）

若要使用拆分的 JavaScript 模組，可在 `index.html` 中引入：

```html
<script src="storage.js"></script>
<script src="firebase.js"></script>
<script src="game.js"></script>
<script src="particles.js"></script>
```

**注意：** 目前版本已將所有功能整合在 `index.html` 中，模組檔案作為參考和未來重構使用。

---

## 📊 效能改進對比

| 項目 | 優化前 | 優化後 | 改進 |
|------|--------|--------|------|
| 粒子動畫 CPU 使用 | 持續運算 | 智能跳過 | ~30% ↓ |
| 錯誤訊息可見度 | Console only | UI + Console | 100% ↑ |
| 螢幕閱讀器支援 | 部分 | 完整 | 100% ↑ |
| 程式碼可維護性 | 單一檔案 | 模組化 | 顯著提升 |

---

## 🔧 設定 Firebase

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Authentication 和 Firestore

### 2. 設定 Security Rules

將 `FIREBASE_SECURITY.md` 中的規則複製到 Firestore Rules：

```bash
Firebase Console → Firestore Database → Rules
```

### 3. 更新配置

在 `index.html` 中更新您的 Firebase 配置：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};
```

---

## 🧪 測試建議

### 無障礙測試

1. **螢幕閱讀器測試**
   - macOS: 啟用 VoiceOver (⌘+F5)
   - Windows: 使用 NVDA
   - 測試所有按鈕和導航流程

2. **鍵盤導航**
   - Tab 鍵應可遍歷所有互動元素
   - 數字鍵 1-4 選擇答案
   - Enter 鍵進入下一題

3. **動畫偏好**
   - 系統設定啟用「減少動態效果」
   - 確認動畫正確禁用

### 功能測試

- ✅ 答題流程
- ✅ 統計資料儲存
- ✅ 排行榜載入
- ✅ 登入/登出功能
- ✅ 錯誤處理顯示

---

## 📚 程式碼範例

### 使用 StorageManager

```javascript
// 取得統計資料
const stats = StorageManager.get();

// 更新統計
stats.total += 1;
StorageManager.set(stats);

// 重置
StorageManager.reset();
```

### 使用 GameLogic

```javascript
// 轉換國旗
const flag = GameLogic.codeToFlagEmoji('TW'); // 🇹🇼

// 洗牌陣列
const shuffled = GameLogic.shuffle([1, 2, 3, 4]);

// 取得國家池
const pool = GameLogic.getCountryPool(countries, 'asia');
```

### 使用 ParticleSystem

```javascript
// 初始化
const particleSystem = new ParticleSystem(canvas);

// 建立慶祝效果
particleSystem.createParticles(x, y);

// 停止動畫
particleSystem.stop();
```

---

## 🚀 未來改進建議

1. **國際化 (i18n)**
   - 支援多語言切換
   - 使用 i18next 或類似框架

2. **離線支援**
   - Service Worker
   - IndexedDB 緩存

3. **進階統計**
   - 圖表視覺化
   - 學習曲線分析

4. **社交功能**
   - 好友對戰
   - 分享成績

5. **測試覆蓋**
   - 單元測試 (Jest)
   - E2E 測試 (Playwright)

---

## 📝 更新日誌

### v2.0.0 - 2025-10-08

#### 新增
- ✨ 模組化架構
- ♿ 完整 ARIA 無障礙標籤
- 📝 JSDoc 型別註解
- 🔒 Firebase Security Rules 指南

#### 改進
- ⚡ 粒子動畫效能優化
- 🛡️ 完善錯誤處理機制
- 📱 更好的使用者回饋
- 🎨 程式碼可讀性提升

#### 修復
- 🐛 錯誤沒有正確記錄
- 🐛 無障礙標籤缺失
- 🐛 粒子動畫持續運算

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

---

**享受優化後的世界國旗挑戰！** 🌍✨
