# 📋 專案配置檔案說明

## firebase.json - Firebase CLI 配置檔案

### 🎯 用途
`firebase.json` 是 **Firebase CLI 的配置檔案**，用於設定：
- 部署規則（哪些檔案要上傳）
- URL 重寫規則（SPA 路由）
- 快取設定
- 安全標頭

### ⚠️ 重要：這個檔案不能刪除或合併到 .gitignore

**為什麼？**

1. **Firebase CLI 必需檔案**
   ```bash
   firebase deploy
   # ↑ 這個命令需要讀取 firebase.json
   ```

2. **控制部署內容**
   - 決定哪些檔案要上傳到 Firebase Hosting
   - 排除不必要的檔案（.md 文件、模組檔案等）

3. **設定 URL 路由**
   - 讓 SPA (單頁應用) 正確運作
   - 所有路徑都導向 index.html

---

## 📂 當前配置解析

```json
{
  "hosting": {
    "public": ".",                    // 部署當前目錄
    "ignore": [                       // 不要部署這些檔案
      "firebase.json",                // Firebase 配置（不需要上傳）
      "**/.*",                        // 隱藏檔案（.git, .gitignore 等）
      "**/node_modules/**",           // Node.js 依賴
      "**/*.md",                      // Markdown 文件
      "storage.js",                   // 原始模組（已打包進 index.html）
      "firebase.js",
      "game.js",
      "particles.js"
    ],
    "rewrites": [                     // URL 重寫規則
      {
        "source": "**",               // 所有路徑
        "destination": "/index.html"  // 都導向 index.html（SPA）
      }
    ]
  }
}
```

---

## 🔄 部署流程

```
1. 本地執行 firebase deploy
   ↓
2. Firebase CLI 讀取 firebase.json
   ↓
3. 根據 "ignore" 規則過濾檔案
   ↓
4. 上傳允許的檔案到 Firebase Hosting
   ↓
5. 設定 URL 重寫規則（rewrites）
   ↓
6. 部署完成 ✅
```

---

## 📋 實際部署的檔案

根據當前的 `firebase.json` 配置：

### ✅ 會部署的檔案
- `index.html` - 主應用
- `firebase.config.js` - Firebase 配置
- `countries.json` - 國家資料

### ❌ 不會部署的檔案
- `*.md` - 所有文件（README.md, FIREBASE_SETUP.md 等）
- `storage.js` - 原始模組
- `firebase.js` - 原始模組
- `game.js` - 原始模組
- `particles.js` - 原始模組
- `.git/` - Git 資料夾
- `.gitignore` - Git 配置
- `firebase.json` - Firebase 配置

---

## 🆚 firebase.json vs .gitignore

### 不同用途，不能合併

| 項目 | firebase.json | .gitignore |
|------|--------------|------------|
| **工具** | Firebase CLI | Git |
| **用途** | 控制**部署到 Firebase** | 控制**上傳到 Git** |
| **作用時機** | `firebase deploy` | `git commit` |
| **範例** | 不部署 .md 文件 | 不上傳 node_modules/ |

### 實際案例

```
檔案: README.md

├─ .gitignore: 沒有排除
│  ✅ 會上傳到 GitHub（作為專案說明）
│
└─ firebase.json: 排除 "**/*.md"
   ❌ 不會部署到 Firebase Hosting（使用者不需要看）
```

---

## 🛠️ 常見配置調整

### 新增要部署的檔案類型
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      // 移除不想排除的規則
      // 例如：想部署 .md 文件，刪除 "**/*.md"
    ]
  }
}
```

### 新增快取設定
```json
{
  "hosting": {
    "public": ".",
    "headers": [{
      "source": "**/*.@(jpg|jpeg|gif|png)",
      "headers": [{
        "key": "Cache-Control",
        "value": "max-age=7200"
      }]
    }]
  }
}
```

### 新增重定向規則
```json
{
  "hosting": {
    "redirects": [{
      "source": "/old-page",
      "destination": "/new-page",
      "type": 301
    }]
  }
}
```

---

## 📚 相關文件

- [Firebase Hosting 配置參考](https://firebase.google.com/docs/hosting/full-config)
- [URL 重寫規則](https://firebase.google.com/docs/hosting/full-config#rewrites)
- [快取控制](https://firebase.google.com/docs/hosting/full-config#headers)

---

## ✅ 總結

### firebase.json 的重要性

1. ✅ **必須存在**：Firebase CLI 運作必需
2. ✅ **控制部署**：決定哪些檔案要上傳
3. ✅ **設定路由**：讓 SPA 正確運作
4. ✅ **不能合併**：與 .gitignore 是不同工具

**請務必保留此檔案！**
