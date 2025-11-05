# 🏆 Leaderboard

A lightweight, real-time leaderboard built using **HTML, CSS, and JavaScript**, with data sourced directly from a **Google Sheet (CSV export)**.  
It automatically fetches and updates rankings every 30 seconds without requiring any backend or database.

---

## 🚀 Features
- 📊 Fetches live data from a published Google Sheet (`.csv`)
- 🧮 Automatically aggregates scores for each participant
- 🕒 Sorts by total score and latest submission timestamp
- 🔄 Auto-refresh every 30 seconds
- 💻 No backend needed — pure frontend solution
- 🧠 Entire logic refined and written with ChatGPT’s help

---

## ⚙️ How It Works
1. A Google Form collects submissions (Name + Score + Timestamp).
2. The linked Google Sheet is **published to the web** in CSV format.
3. This app fetches that CSV using `fetch()` and parses it into JavaScript objects.
4. It groups scores by player, calculates totals, sorts, and displays a leaderboard.

---

## 🧾 Setup Guide

### 1️⃣ Prepare Google Sheet
- Link your Google Form to a Sheet.
- Go to: **File → Share → Publish to the web → CSV format**
- Copy the public `.csv` link (something like):
