# 🎌 世界國旗挑戰遊戲

互動式的世界國旗猜謎遊戲，使用 Firebase 作為後端服務。

🎮 **線上遊玩**：https://codexflaggame.web.app

---

## ✨ 主要功能

- 🌍 **多地區支援**：全球、亞洲、歐洲、美洲、非洲、大洋洲
- 🏆 **排行榜系統**：全球和地區排行榜
- 👤 **使用者認證**：Google 登入 + 訪客模式
- 📊 **統計追蹤**：連勝紀錄、準確率、總題數

---

## 🚀 快速開始

### 本地測試

```bash
# Clone 專案
git clone https://github.com/akaiHuang/codexFlagGame.git
cd codexFlagGame

# 開啟遊戲
open index.html
```

### 部署到 Firebase

```bash
# 安裝 Firebase CLI
npm install -g firebase-tools

# 登入並部署
firebase login
firebase deploy
```

---

## 📖 完整文件

詳細的設定、部署、安全性說明，請參考：

**📄 [完整文件 (docs/README.md)](docs/README.md)**

包含內容：
- Firebase 詳細設定步驟
- Security Rules 配置
- 部署指南
- 安全性說明
- 測試指南
- 專案架構

---

## 📂 專案結構

```
codexFlagGame/
├── index.html           # 主應用
├── firebase.json        # Firebase CLI 配置
├── config/              # 配置檔案
│   ├── firebase.config.js
│   └── firestore.rules
├── src/js/              # JS 模組（開發參考用）
└── docs/                # 完整文件
    └── README.md
```

---

## 🛠️ 技術架構

- **前端**：HTML5 + CSS3 + Vanilla JavaScript
- **後端**：Firebase (Authentication, Firestore, Hosting)
- **部署**：Firebase Hosting + GitHub Actions

---

## 📄 授權

MIT License

---

**建立者：akaiHuang** | [線上遊玩](https://codexflaggame.web.app)
