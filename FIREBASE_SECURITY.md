# Firebase Security Rules 範例

將此規則套用到您的 Firebase Firestore：

## Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 使用者個人資料
    match /profiles/{userId} {
      // 任何人都可以讀取
      allow read: if true;
      
      // 只有本人可以寫入自己的資料
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 排行榜資料
    match /leaderboard/{entry} {
      // 任何人都可以讀取排行榜
      allow read: if true;
      
      // 只有認證使用者可以寫入，且必須是自己的資料
      allow create: if request.auth != null 
                    && request.resource.data.uid == request.auth.uid;
      
      allow update: if request.auth != null 
                    && resource.data.uid == request.auth.uid;
      
      // 禁止刪除
      allow delete: if false;
    }
  }
}
```

## 環境變數設定建議

建議將 Firebase 配置移到環境變數：

1. 建立 `.env` 檔案（不要提交到 Git）：
```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

2. 在 `.gitignore` 中加入：
```
.env
.env.local
```

3. 在部署時設定環境變數（Vercel、Netlify 等平台都支援）

## 額外安全建議

1. **啟用 App Check**：防止未授權的客戶端存取您的 Firebase 資源
2. **設定使用配額**：在 Firebase Console 中設定每日請求限制
3. **監控異常活動**：定期檢查 Firebase 的使用量和存取記錄
4. **限制 API Key 範圍**：在 Google Cloud Console 中限制 API Key 的使用範圍
