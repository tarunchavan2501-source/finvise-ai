# 🪙 FinVise AI — AI-Powered Personal Finance Advisor (Made for India)

> **Live Application**: [https://quiet-stardust-eacb3c.netlify.app](https://quiet-stardust-eacb3c.netlify.app)  
> **Platform**: Web (Fully compatible with Mobile Phones, Tablets & Laptops)  
> **Target Audience**: Salaried Professionals, College Students, Freelancers, and Household Managers in India.

---

## 📌 Project Overview

**FinVise AI** is a modern, responsive personal finance assistant designed specifically for Indian economic workflows and spending habits. It enables individuals and families to record monthly take-home salary, track expenses across essential Indian categories, evaluate their financial health against the **50-30-20 rule**, and simulate long-term compound wealth growth using automated **SIP (Systematic Investment Plans)** and emergency runway calculators.

The entire platform runs client-side with zero external setup required, while supporting an optional cloud AI integration with Google Gemini.

---

## ✨ Key Features & Capabilities

### 1. Ready-Made Life Situation Profiles (1-Click Preload)
- **Salaried Professional (Rs. 85,000/mo)**: Regular monthly salary with fixed commitments (rent, EMI), daily UPI transactions, and disciplined mutual fund investment focus.
- **College Student (Rs. 15,000/mo)**: Tight pocket-money allowance management, monitoring dining out vs. essentials, and fostering micro-investing habits.
- **Freelancer (Rs. 60,000/mo)**: Variable monthly client revenues, 6-month liquid emergency runway planning, and tax reserve allocations.
- **Household Manager (Rs. 1,20,000/mo)**: Combined family budget spanning schooling, groceries, medical costs, and long-term family goals.

### 2. Tailored Indian Expense Tracking
Real-time inputs across 6 localized spending categories:
- **House Rent or Room Rent**
- **Food, Milk and Groceries**
- **Mobile Recharge, WiFi and Electricity**
- **Petrol, Bus and Train Tickets**
- **Shopping, Movies and Swiggy/Zomato**
- **Doctor, Medicines and Family Needs**

### 3. Real-Time Financial Health Metrics
- **Instant Savings & Spend Rates**: Automatically computes percentage allocation and visualizes spending priorities.
- **50-30-20 Rule Check**: Splits cashflow into **Needs** (<=50%), **Wants** (<=30%), and **Savings** (>=20%).
- **Financial Health Score**: Dynamic score out of 100 with immediate actionable guidance.

### 4. Interactive SIP & Compound Wealth Simulator
- Projects wealth generation across **1, 3, 5, and 10-year horizons** at historical Nifty 50 compound averages (12% p.a.).
- Automatically computes a **6-Month Emergency Runway** check, showing how many months it will take to secure a complete safety net.

### 5. Export & Snapshot History
- **1-Click PDF Report**: Instant download of an executive monthly financial statement.
- **Local Snapshot Storage**: Save and compare financial projections across sessions using browser `localStorage` without privacy risk.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, CSS3 (Modern Responsive Flexbox/Grid Design System), JavaScript (ES6+).
- **Visualization**: Chart.js (interactive category bar charts).
- **Document Generation**: jsPDF client-side PDF engine.
- **Backend (Optional / Local)**: Python Flask with SQLite database (`server.py`).
- **Deployment**: Static Web Hosting on Netlify (100% self-contained single-file bundle).

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/tarunchavan2501-source/finvise-ai.git
   cd finvise-ai
   ```

2. Open the application:
   - Double-click `index.html` to open it in your browser (Chrome, Edge, Safari, Firefox).
   - Alternatively, start a simple Python server:
     ```bash
     python -m http.server 8000
     ```
     And visit `http://localhost:8000`.

---

## 📄 License & Disclaimer

This project is licensed under the MIT License.  
*Disclaimer: FinVise AI is an educational financial analysis tool and does not constitute SEBI-registered investment advice.*
