import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder=".")
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "finvise.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS financial_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profile_name TEXT,
            income REAL,
            rent REAL,
            groceries REAL,
            bills REAL,
            transport REAL,
            shopping REAL,
            family REAL,
            target_savings REAL,
            total_expense REAL,
            net_savings REAL,
            savings_rate REAL,
            health_score INTEGER,
            ai_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "online", "service": "FinVise AI Backend", "version": "2.4"})

@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.json or {}
    income = float(data.get("income", 0))
    expenses = data.get("expenses", {})
    rent = float(expenses.get("rent", 0))
    groceries = float(expenses.get("groceries", 0))
    bills = float(expenses.get("bills", 0))
    transport = float(expenses.get("transport", 0))
    shopping = float(expenses.get("shopping", 0))
    family = float(expenses.get("family", 0))
    target = float(data.get("targetSavings", 0))

    total_expense = rent + groceries + bills + transport + shopping + family
    net_savings = income - total_expense
    savings_rate = (net_savings / income * 100) if income > 0 else 0
    needs_total = rent + groceries + bills + transport
    wants_total = shopping + family

    # Health score calculation
    score = 70
    if net_savings >= target and target > 0: score += 10
    if savings_rate >= 20: score += 10
    if savings_rate >= 30: score += 5
    if (needs_total / (income or 1)) > 0.6: score -= 10
    if (wants_total / (income or 1)) > 0.35: score -= 10
    if net_savings < 0: score = 30
    score = max(20, min(99, score))

    return jsonify({
        "income": income,
        "totalExpense": total_expense,
        "netSavings": net_savings,
        "savingsRate": round(savings_rate, 1),
        "healthScore": score,
        "needsPercent": round((needs_total / (income or 1)) * 100),
        "wantsPercent": round((wants_total / (income or 1)) * 100)
    })

@app.route("/api/snapshots", methods=["GET", "POST"])
def handle_snapshots():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if request.method == "POST":
        d = request.json or {}
        exp = d.get("expenses", {})
        cursor.execute('''
            INSERT INTO financial_snapshots 
            (profile_name, income, rent, groceries, bills, transport, shopping, family, target_savings, total_expense, net_savings, savings_rate, health_score, ai_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            d.get("profile", "Custom"),
            d.get("income", 0),
            exp.get("rent", 0),
            exp.get("groceries", 0),
            exp.get("bills", 0),
            exp.get("transport", 0),
            exp.get("shopping", 0),
            exp.get("family", 0),
            d.get("targetSavings", 0),
            d.get("totalExpense", 0),
            d.get("netSavings", 0),
            d.get("savingsRate", 0),
            d.get("healthScore", 70),
            d.get("aiNotes", "")
        ))
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({"success": True, "id": new_id})

    # GET
    cursor.execute('SELECT * FROM financial_snapshots ORDER BY created_at DESC LIMIT 20')
    rows = cursor.fetchall()
    snapshots = [dict(r) for r in rows]
    conn.close()
    return jsonify({"snapshots": snapshots})

if __name__ == "__main__":
    print("Starting FinVise AI Server on http://localhost:5000 and accessible across your network...")
    app.run(host="0.0.0.0", port=5000, debug=False)
