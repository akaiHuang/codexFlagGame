# 🔒 生產環境安全設定指南

## ⚠️ 重要：部署後必須執行的安全設定

### 1️⃣ 限制 Firebase Authentication 授權網域

防止他人從其他網域使用您的 Firebase 配置。

#### 操作步驟：

1. 前往 [Firebase Console](https://console.firebase.google.com/project/codexflaggame/authentication/settings)
2. 點擊 **Authentication** → **Settings** → **Authorized domains**
3. **移除以下網域**（僅限本地開發用）：
   - ❌ `localhost`
   - ❌ `127.0.0.1`

4. **保留以下生產網域**：
   - ✅ `codexflaggame.web.app`
   - ✅ `codexflaggame.firebaseapp.com`

#### 為什麼要這樣做？

- 防止他人在 localhost 使用您的 API Key
- 限制只能從官方網域登入
- 減少濫用風險

---

### 2️⃣ 加強 Firestore Security Rules

在 Security Rules 中加入來源網域檢查和流量限制。

#### 操作步驟：

1. 前往 [Firestore Security Rules](https://console.firebase.google.com/project/codexflaggame/firestore/rules)
2. 將規則更新為以下內容：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // 通用函數：驗證與限流
    // ============================================
    
    // 驗證使用者已登入
    function isSignedIn() {
      return request.auth != null;
    }
    
    // 驗證是資料擁有者
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // 基本的寫入限流（防止短時間大量寫入）
    function notTooFrequent() {
      // 檢查上次更新時間，至少間隔 3 秒
      return !resource.exists || 
             request.time > resource.data.updatedAt + duration.value(3, 's');
    }
    
    // ============================================
    // profiles 集合
    // ============================================
    match /profiles/{userId} {
      // 讀取：所有已登入使用者（用於排行榜顯示名稱）
      allow read: if isSignedIn();
      
      // 寫入：僅限資料擁有者，且需要限流
      allow write: if isOwner(userId) && notTooFrequent() &&
        // 驗證資料結構
        request.resource.data.keys().hasAll(['name', 'createdAt', 'updatedAt']) &&
        request.resource.data.name is string &&
        request.resource.data.name.size() > 0 &&
        request.resource.data.name.size() <= 50 &&
        request.resource.data.createdAt is timestamp &&
        request.resource.data.updatedAt is timestamp;
    }
    
    // ============================================
    // scores 集合（全球排行榜）
    // ============================================
    match /scores/{userId} {
      // 讀取：所有已登入使用者（排行榜查詢）
      allow read: if isSignedIn();
      
      // 寫入：僅限資料擁有者，限流，且需驗證資料合理性
      allow write: if isOwner(userId) && notTooFrequent() &&
        // 驗證資料結構
        request.resource.data.keys().hasAll(['bestStreak', 'accuracy', 'totalGames', 'region', 'updatedAt']) &&
        // 驗證資料型態
        request.resource.data.bestStreak is int &&
        request.resource.data.accuracy is number &&
        request.resource.data.totalGames is int &&
        request.resource.data.region is string &&
        request.resource.data.updatedAt is timestamp &&
        // 驗證資料合理範圍
        request.resource.data.bestStreak >= 0 &&
        request.resource.data.bestStreak <= 1000 && // 防止異常高分
        request.resource.data.accuracy >= 0 &&
        request.resource.data.accuracy <= 100 &&
        request.resource.data.totalGames >= 0 &&
        request.resource.data.totalGames <= 100000; // 防止異常數值
    }
    
    // ============================================
    // scores_region 集合（地區排行榜）
    // ============================================
    match /scores_region/{userRegionId} {
      // 讀取：所有已登入使用者（地區排行榜查詢）
      allow read: if isSignedIn();
      
      // 寫入：需驗證 userId 與當前使用者一致，且需限流
      allow write: if isSignedIn() && notTooFrequent() &&
        // 驗證文件 ID 格式為 {userId}_{region}
        userRegionId.matches('^' + request.auth.uid + '_[A-Z]{2}$') &&
        // 驗證資料結構
        request.resource.data.keys().hasAll(['userId', 'region', 'bestStreak', 'accuracy', 'totalGames', 'updatedAt']) &&
        request.resource.data.userId == request.auth.uid &&
        // 驗證資料型態與範圍
        request.resource.data.bestStreak is int &&
        request.resource.data.accuracy is number &&
        request.resource.data.totalGames is int &&
        request.resource.data.region is string &&
        request.resource.data.updatedAt is timestamp &&
        request.resource.data.bestStreak >= 0 &&
        request.resource.data.bestStreak <= 1000 &&
        request.resource.data.accuracy >= 0 &&
        request.resource.data.accuracy <= 100 &&
        request.resource.data.totalGames >= 0 &&
        request.resource.data.totalGames <= 100000;
    }
    
    // 拒絕其他所有存取
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### 新增的安全機制：

1. **寫入限流** (`notTooFrequent`)
   - 同一使用者至少間隔 3 秒才能再次寫入
   - 防止惡意程式快速大量寫入

2. **資料範圍驗證**
   - `bestStreak` 最高 1000 連勝
   - `accuracy` 必須在 0-100 之間
   - `totalGames` 最多 100,000 場
   - `name` 長度 1-50 字元

3. **文件 ID 格式驗證**
   - `scores_region` 必須符合 `{userId}_{region}` 格式
   - 防止偽造他人資料

---

### 3️⃣ 設定 Firebase App Check（進階，可選）

最強的保護機制，但需要額外設定。

#### 什麼是 App Check？

- 驗證請求確實來自您的官方應用
- 使用 reCAPTCHA 或其他驗證機制
- 阻擋所有未經驗證的流量

#### 操作步驟：

1. 前往 [Firebase Console](https://console.firebase.google.com/project/codexflaggame/appcheck)
2. 點擊 **App Check** → **Get started**
3. 選擇 **reCAPTCHA Enterprise** 或 **reCAPTCHA v3**
4. 註冊網域：`codexflaggame.web.app`
5. 在程式碼中加入 App Check（可選，稍後實作）

---

### 4️⃣ 監控異常流量

#### 操作步驟：

1. 前往 [Firebase Usage Dashboard](https://console.firebase.google.com/project/codexflaggame/usage)
2. 設定預算警報：
   - **Firestore Reads**: 建議設定 100,000/天 的警報
   - **Firestore Writes**: 建議設定 10,000/天 的警報
   - **Authentication**: 建議設定 1,000/天 的警報

3. 如果收到警報，檢查 Firestore 的使用記錄

---

## ✅ 安全檢查清單

完成部署後，請確認以下項目：

- [ ] 已從 Authentication 移除 `localhost` 和 `127.0.0.1`
- [ ] 已更新 Firestore Security Rules（包含限流機制）
- [ ] 已設定 Firebase 用量警報
- [ ] 已測試登入功能仍正常運作
- [ ] 已測試排行榜儲存功能
- [ ] （選擇性）已啟用 App Check

---

## 🔍 常見問題

### Q1: 移除 localhost 後本地開發怎麼辦？

使用 Firebase Emulator 進行本地開發：
```bash
firebase emulators:start --only auth,firestore
```

或暫時加回 localhost（記得上線前移除）。

### Q2: 如果有人盜用我的 API Key 怎麼辦？

不用擔心！即使別人拿到您的 API Key：
- ✅ Security Rules 會阻擋未授權的操作
- ✅ 授權網域限制了登入來源
- ✅ 寫入限流防止大量操作
- ✅ 資料驗證防止異常數值

### Q3: 這樣就足夠安全了嗎？

對於您的遊戲應用來說，**這已經非常安全**！

Firebase 的安全模型是：
1. **API Key 公開** ← 這是正常的
2. **Security Rules 保護** ← 這是關鍵
3. **授權網域限制** ← 這是加強
4. **App Check（選擇性）** ← 這是最強

---

## 📚 相關文件

- [Firebase Security Rules 最佳實踐](https://firebase.google.com/docs/rules/best-practices)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [授權網域設定](https://firebase.google.com/docs/auth/web/redirect-best-practices)
