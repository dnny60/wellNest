# Wellnest 心窩：心理健康 App

一款專為年輕人設計的心理健康行動應用程式，使用 **React Native**、**React.js**、**OpenAI** 和 **Three.js** 打造。  
本應用透過 AI 聊天機器人、即時情緒分析、任務推薦以及 3D 動畫小雞陪伴，提供情緒支持與互動體驗，幫助使用者管理心理健康。

---

![演示截圖或 GIF](./assets/demo.gif)

---

## 🚀 功能特色

- 💬 **AI 聊天機器人**：基於 OpenAI API，融入認知行為療法（CBT）理念，提供情感支持與對話引導。
- 🎯 **情緒分析與推薦**：使用 TensorFlow.js 進行即時情緒檢測，並推薦個人化任務與活動。
- 🐣 **3D 動畫小雞**：以 React Three Fiber 和 TypeScript 打造的 3D 角色，作為情感陪伴，提升互動趣味。
- 📄 **心理健康資源**：提供校內/校外心理諮商預約資訊，方便快速尋求專業幫助。
- 🧭 **互動式使用者體驗**：包含新手引導、每日任務、情緒漫畫與心情日誌功能。

---

## 🛠 技術堆疊

- **前端**：React Native、React.js、TypeScript、Tailwind CSS（可選）
- **AI 與自然語言處理**：OpenAI API、TensorFlow.js
- **3D 渲染**：React Three Fiber（`@react-three/drei/native`）、Three.js、glTF
- **其他**：Expo、WebSocket、Custom Hook、Context API、Figma

---

## 📁 資料夾結構

```
src/
├── assets/                # 靜態資源（圖片、模型等）
├── components/            # 可重複使用的組件
│   ├── Chick.tsx          # 3D 小雞模型與動畫（使用 R3F + TS）
│   ├── CustomButton.js    # 可重複使用的按鈕組件
│   ├── Loader.tsx         # 載入動畫畫面
│   ├── Trigger.tsx        # 基於事件的動畫觸發器
│   ├── WebSocket.js       # 即時訊息同步（聊天室或事件）
│   └── UseAudioManager.js # 自訂音頻播放 Hook
├── constants/             # 配色方案、字型大小、間距值
├── content/               # 靜態文字或情緒相關任務資料
├── navigation/            # React Navigation 導航邏輯
├── scenes/                # 3D 可視化場景（若分離）
├── screens/               # 應用程式主要頁面
│   ├── ChatbotScreen.js   # AI 聊天機器人介面
│   ├── ComicScreen.js     # 基於情緒的漫畫呈現
│   ├── MissionsScreen.js  # 情緒相關任務與獎勵
│   ├── QuestionnaireScreen.js # 自我評估流程
│   ├── AppointmentScreen.js   # 心理諮商預約頁面
│   └── HomeScreen.js      # 主儀表板
```

---

## 📽 演示影片

👉 **[系統demo影片](https://drive.google.com/file/d/1qi08N-vroGFlp0b__W9Z201iuonssLNx/view?usp=sharing)**  

---

## 🔧 開始使用

```bash
git clone https://github.com/your-username/mental-health-app.git
cd mental-health-app
npm install
npx expo start
```

---

## 📖 專題簡介

在快速變遷的現代社會中，心理健康議題日益受到重視。根據統計，台灣年輕族群的憂鬱症發病率在過去十年增長約 20%，且有四成患者未獲得適當醫療照護，顯示年輕化憂鬱症與心理諮商資源不足的問題。因此，我們開發 **Wellnest**，一款專為年輕人設計的心理健康 App，旨在提供即時情緒梳理與任務指引。

### 核心功能：
1. **AI 聊天機器人**：基於 CBT 理論與 OpenAI GPT-4，幫助使用者反思情緒來源並提供情感支持。
2. **情緒分析與推薦系統**：透過 BERT 情緒分析模型，理解使用者情緒並提供個人化建議與任務。
3. **3D 角色陪伴**：人性化的 3D 角色作為情感陪伴者，增強使用者互動體驗。
4. **漫畫式回顧**：將心情歷程轉化為視覺化漫畫記錄，讓回顧更有趣味。
5. **一鍵預約諮商**：根據使用者位置推薦台北市附近諮商診所，並提供快速預約功能。

### 關鍵詞：
「心理健康」、「ChatGPT」、「AI 情緒分析」、「情緒任務」、「3D 角色陪伴」、「漫畫日記」

---

## 👥 專題成員
- 黃郁茜
- 葉晉嘉
- 陳柏駿
- 黃榕坤
- 蘇建安

---

Wellnest 期望成為年輕人在壓力生活中尋求心理平衡的可靠夥伴！


# 🧠 Mental Health App – AI Chatbot & 3D Companion

A mobile-friendly mental wellness app built with **React Native**, **React.js**, **OpenAI**, and **Three.js**.  
This app provides emotional support through an AI-powered chatbot, real-time mood detection, task recommendations, and a 3D animated chick companion for visual comfort and interaction.

---

![demo screenshot or gif here](./assets/demo.gif)

---

## 🚀 Features

- 💬 **AI Chatbot** using OpenAI API for CBT-inspired conversation and emotional support
- 🎯 **Emotion Detection** using TensorFlow.js to detect real-time mood and recommend personalized activities
- 🐣 **3D Animated Chick** built with React Three Fiber + TypeScript to enhance engagement
- 📄 **Mental Health Resources** including booking info for on-campus/off-campus therapy
- 🧭 **Interactive User Journey** including onboarding, daily missions, emotion comics, and mood logs

---

## 🛠 Tech Stack

- **Frontend:** React Native, React.js, TypeScript, Tailwind CSS (optional)
- **AI & NLP:** OpenAI API, TensorFlow.js
- **3D Rendering:** React Three Fiber (`@react-three/drei/native`), Three.js, glTF
- **Others:** Expo, WebSocket, Custom Hook, Context API, Figma
---

## 📽 Demo Video

👉 **[Click here to watch the demo video](https://drive.google.com/file/d/1qi08N-vroGFlp0b__W9Z201iuonssLNx/view?usp=sharing)**  

---

## 🔧 Getting Started

```bash
git clone https://github.com/your-username/mental-health-app.git
cd mental-health-app
npm install
npx expo start
