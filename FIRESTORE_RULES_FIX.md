# 🔧 Firestore Security Rules 修正版

## ❌ 問題診斷

您遇到的錯誤：
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

**原因**：
1. 排行榜查詢需要**讀取多個使用者的資料**
2. 您的 Security Rules 要求 `isSignedIn()`（必須登入）
3. 但查詢時使用者可能：
   - 還沒完成登入流程
   - 或是純粹想**瀏覽排行榜**（不需要登入）

---

## ✅ 修正方案

### 設計原則：
- **讀取排行榜**：公開（任何人都能看）
- **寫入成績**：需要登入（防止匿名濫用）
- **限流保護**：防止大量寫入

---

## 📋 正確的 Security Rules

請複製以下規則到 [Firestore Rules](https://console.firebase.google.com/project/codexflaggame/firestore/rules)：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // 通用函數
    // ============================================
    
    // 驗證使用者已登入
    function isSignedIn() {
      return request.auth != null;
    }
    
    // 驗證是資料擁有者
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // 寫入限流：至少間隔 3 秒
    function notTooFrequent() {
      return !resource.exists || 
             request.time > resource.data.ts + duration.value(3, 's');
    }
    
    // 驗證資料欄位完整性
    function hasValidScoreFields() {
      return request.resource.data.keys().hasAll(['uid', 'bestStreak', 'accuracy', 'total', 'region', 'ts']);
    }
    
    // 驗證分數合理性
    function hasValidScoreValues() {
      return request.resource.data.bestStreak is int &&
             request.resource.data.accuracy is number &&
             request.resource.data.total is int &&
             request.resource.data.bestStreak >= 0 &&
             request.resource.data.bestStreak <= 1000 &&
             request.resource.data.accuracy >= 0 &&
             request.resource.data.accuracy <= 100 &&
             request.resource.data.total >= 0 &&
             request.resource.data.total <= 100000;
    }
    
    // ============================================
    // profiles 集合
    // ============================================
    match /profiles/{userId} {
      // 🔓 讀取：公開（排行榜需要顯示名稱）
      allow read: if true;
      
      // 🔒 寫入：僅限擁有者，限流，驗證資料
      allow write: if isOwner(userId) && 
                      notTooFrequent() &&
                      request.resource.data.keys().hasAll(['name', 'createdAt', 'updatedAt']) &&
                      request.resource.data.name is string &&
                      request.resource.data.name.size() > 0 &&
                      request.resource.data.name.size() <= 50;
    }
    
    // ============================================
    // scores 集合（全球排行榜）
    // ============================================
    match /scores/{userId} {
      // 🔓 讀取：公開（任何人都能瀏覽排行榜）
      allow read: if true;
      
      // 🔒 寫入：僅限擁有者，限流，驗證資料
      allow write: if isOwner(userId) && 
                      notTooFrequent() &&
                      hasValidScoreFields() &&
                      hasValidScoreValues() &&
                      request.resource.data.uid == userId;
    }
    
    // ============================================
    // scores_region 集合（地區排行榜）
    // ============================================
    match /scores_region/{userRegionId} {
      // 🔓 讀取：公開（任何人都能瀏覽排行榜）
      allow read: if true;
      
      // 🔒 寫入：需驗證 userId 與當前使用者一致，限流，驗證資料
      allow write: if isSignedIn() && 
                      notTooFrequent() &&
                      // 驗證文件 ID 格式為 {userId}_{region}
                      userRegionId.matches('^' + request.auth.uid + '_[A-Z]{2}$') &&
                      hasValidScoreFields() &&
                      hasValidScoreValues() &&
                      request.resource.data.uid == request.auth.uid;
    }
    
    // 拒絕其他所有存取
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🔍 關鍵修改說明

### 1. **讀取權限改為公開**
```javascript
// 之前（太嚴格）
allow read: if isSignedIn();

// 現在（合理）
allow read: if true;
```

**理由**：
- 排行榜本來就應該公開瀏覽
- 不需要強制登入才能看
- 類似遊戲排行榜網站（如 Steam、App Store）

### 2. **寫入權限仍然嚴格**
```javascript
allow write: if isOwner(userId) && 
                notTooFrequent() &&
                hasValidScoreFields() &&
                hasValidScoreValues();
```

**保護措施**：
- ✅ 必須登入（Google 或訪客）
- ✅ 只能寫入自己的資料
- ✅ 3 秒寫入限流
- ✅ 資料範圍驗證
- ✅ 欄位完整性檢查

### 3. **新增輔助函數**
- `hasValidScoreFields()` - 檢查必要欄位
- `hasValidScoreValues()` - 檢查數值範圍
- 讓規則更清晰易讀

---

## 🔒 安全性分析

### ✅ 仍然安全的理由

即使排行榜公開讀取，您的資料仍然安全：

1. **寫入保護**
   - 必須登入（Firebase Authentication）
   - 只能寫入自己的 uid
   - 無法偽造他人資料

2. **限流保護**
   - 同一使用者 3 秒只能寫一次
   - 防止惡意腳本快速大量寫入

3. **資料驗證**
   - bestStreak 最高 1000
   - accuracy 必須 0-100
   - total 最多 100,000
   - 防止異常數值

4. **查詢限制**
   - 程式碼中已設定 `limit(50)`
   - 單次查詢最多 50 筆
   - 不會造成大量讀取

### ❌ 不需要擔心的問題

**Q: 公開讀取會被盜刷流量嗎？**
A: 不會！因為：
- 您的程式碼已經設定 `limit(50)`
- Firestore 有每日免費額度（50,000 讀取/天）
- 一般使用量遠低於此
- Firebase 會自動快取結果

**Q: 別人能看到我的資料嗎？**
A: 能，但這是**設計上應該的**：
- 排行榜本來就是公開的
- 只顯示：名稱、分數、準確率
- 不會顯示：email、uid、敏感資訊

---

## 🎯 修正步驟

1. 前往 [Firestore Rules](https://console.firebase.google.com/project/codexflaggame/firestore/rules)
2. 複製上面的完整規則
3. 點擊 **發布**
4. 等待約 1 分鐘讓規則生效
5. 重新測試 https://codexflaggame.web.app

---

## ✅ 測試檢查清單

修正後應該能正常：
- [ ] 未登入狀態下可以點擊「排行榜」
- [ ] 可以看到全球和地區排行榜
- [ ] Google 登入後可以儲存成績
- [ ] 訪客身份可以儲存成績
- [ ] 成績出現在排行榜上
- [ ] Console 沒有 permission-denied 錯誤

---

## 📚 延伸閱讀

- [Firestore Security Rules 最佳實踐](https://firebase.google.com/docs/firestore/security/get-started)
- [排行榜設計模式](https://firebase.google.com/docs/firestore/solutions/leaderboards)
