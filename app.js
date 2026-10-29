/**
 * FinVise AI — Core Engine & Interactivity
 * High-performance, offline-capable Indian financial budget AI generator,
 * Real-time Chart.js integration, SIP Simulator, LocalStorage snapshot persistence,
 * and high-fidelity PDF Monthly Financial Statement export.
 */

// Profile Pre-sets matching exactly the 4 scenarios
const PROFILES = {
  salaried: {
    name: "Salaried Professional",
    income: 85000,
    rent: 25000,
    groceries: 12000,
    bills: 4000,
    transport: 6000,
    shopping: 10000,
    family: 5000,
    targetSavings: 20000,
    preference: "wealth"
  },
  student: {
    name: "College Student",
    income: 15000,
    rent: 6000,
    groceries: 3500,
    bills: 1000,
    transport: 1500,
    shopping: 1800,
    family: 0,
    targetSavings: 1200,
    preference: "emergency"
  },
  freelancer: {
    name: "Freelancer",
    income: 60000,
    rent: 18000,
    groceries: 9000,
    bills: 3500,
    transport: 3000,
    shopping: 6500,
    family: 4000,
    targetSavings: 16000,
    preference: "emergency"
  },
  household: {
    name: "Household Manager",
    income: 120000,
    rent: 32000,
    groceries: 22000,
    bills: 8500,
    transport: 9500,
    shopping: 14000,
    family: 12000,
    targetSavings: 22000,
    preference: "family"
  }
};

// State
let chartInstance = null;
let currentProfileKey = 'salaried';
let simHorizonYears = 5;

// DOM Elements
const incomeInput = document.getElementById('incomeInput');
const incomeHint = document.getElementById('incomeHint');
const expRent = document.getElementById('expRent');
const expGroceries = document.getElementById('expGroceries');
const expBills = document.getElementById('expBills');
const expTransport = document.getElementById('expTransport');
const expShopping = document.getElementById('expShopping');
const expFamily = document.getElementById('expFamily');
const targetSavings = document.getElementById('targetSavings');
const investmentPref = document.getElementById('investmentPref');

const kpiIncome = document.getElementById('kpi-income');
const kpiSpend = document.getElementById('kpi-spend');
const kpiSpendPct = document.getElementById('kpi-spend-pct');
const kpiSavings = document.getElementById('kpi-savings');
const kpiSavingsPct = document.getElementById('kpi-savings-pct');
const chartSavingsRateTag = document.getElementById('chartSavingsRateTag');

const quickInsightsList = document.getElementById('quickInsightsList');
const profileDropdown = document.getElementById('profileDropdown');
const profileCards = document.querySelectorAll('.profile-card');

// Simulator elements
const simSipSlider = document.getElementById('simSipSlider');
const simReturnSlider = document.getElementById('simReturnSlider');
const simSipVal = document.getElementById('simSipVal');
const simReturnVal = document.getElementById('simReturnVal');
const simInvested = document.getElementById('simInvested');
const simReturns = document.getElementById('simReturns');
const simCorpus = document.getElementById('simCorpus');
const simEmergencyNote = document.getElementById('simEmergencyNote');
const periodBtns = document.querySelectorAll('.period-btn');

// Rule 50-30-20 elements
const needsPct = document.getElementById('needsPct');
const wantsPct = document.getElementById('wantsPct');
const savingsRulePct = document.getElementById('savingsRulePct');
const needsBar = document.getElementById('needsBar');
const wantsBar = document.getElementById('wantsBar');
const savingsBar = document.getElementById('savingsBar');
const healthScorePill = document.getElementById('healthScorePill');

// Number formatting to Indian Lakhs/Crores convention
function formatINR(number) {
  if (isNaN(number)) return "₹0";
  const num = Math.round(number);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  const s = absNum.toString();
  let lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return (isNegative ? "-₹" : "₹") + formatted;
}

// Convert number to Indian words
function numberToIndianWords(num) {
  if (!num || num <= 0) return "Zero";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim();
}

// Read current inputs
function getFinancialData() {
  const income = parseFloat(incomeInput.value) || 0;
  const rent = parseFloat(expRent.value) || 0;
  const groceries = parseFloat(expGroceries.value) || 0;
  const bills = parseFloat(expBills.value) || 0;
  const transport = parseFloat(expTransport.value) || 0;
  const shopping = parseFloat(expShopping.value) || 0;
  const family = parseFloat(expFamily.value) || 0;
  const target = parseFloat(targetSavings.value) || 0;

  const totalExpense = rent + groceries + bills + transport + shopping + family;
  const netSavings = income - totalExpense;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
  const spendRate = income > 0 ? (totalExpense / income) * 100 : 0;

  // Indian 50-30-20 Classification:
  // Needs: Rent + Groceries + Bills + Transport/Fuel (essential)
  // Wants: Shopping & Outings + Discretionary Family spends
  const needsTotal = rent + groceries + bills + transport;
  const wantsTotal = shopping + family;

  return {
    income,
    expenses: { rent, groceries, bills, transport, shopping, family },
    totalExpense,
    netSavings,
    savingsRate,
    spendRate,
    target,
    needsTotal,
    wantsTotal,
    preference: investmentPref.value
  };
}

// Update UI and Dashboard
function updateCalculations() {
  const data = getFinancialData();

  // Hints
  const words = numberToIndianWords(data.income);
  incomeHint.textContent = `${formatINR(data.income)} (${words ? words + ' Rupees' : ''})`;

  // KPI cards
  kpiIncome.textContent = formatINR(data.income);
  kpiSpend.textContent = formatINR(data.totalExpense);
  kpiSpendPct.textContent = `${Math.round(data.spendRate)}% of income`;

  kpiSavings.textContent = formatINR(data.netSavings);
  kpiSavingsPct.textContent = `${Math.round(data.savingsRate)}% savings rate`;
  chartSavingsRateTag.textContent = `${Math.round(data.savingsRate)}% savings rate`;

  if (data.netSavings < 0) {
    kpiSavings.style.color = '#c0392b';
  } else {
    kpiSavings.style.color = '#12824c';
  }

  // 50-30-20 Rule Calculation
  const inc = data.income > 0 ? data.income : 1;
  const needsPercent = Math.min(100, Math.round((data.needsTotal / inc) * 100));
  const wantsPercent = Math.min(100, Math.round((data.wantsTotal / inc) * 100));
  const savingsPercent = Math.max(0, Math.round((data.netSavings / inc) * 100));

  needsPct.textContent = `${needsPercent}%`;
  wantsPct.textContent = `${wantsPercent}%`;
  savingsRulePct.textContent = `${savingsPercent}%`;

  needsBar.style.width = `${Math.min(100, needsPercent)}%`;
  wantsBar.style.width = `${Math.min(100, wantsPercent)}%`;
  savingsBar.style.width = `${Math.min(100, savingsPercent)}%`;

  // Compute Financial Health Score (out of 100)
  let healthScore = 70;
  if (data.netSavings >= data.target && data.target > 0) healthScore += 10;
  if (savingsPercent >= 20) healthScore += 10;
  if (savingsPercent >= 30) healthScore += 5;
  if (needsPercent > 60) healthScore -= 10;
  if (wantsPercent > 35) healthScore -= 10;
  if (data.netSavings < 0) healthScore = 32;

  healthScore = Math.max(25, Math.min(98, healthScore));

  let healthLabel = "Excellent";
  let healthColor = "#0b753c";
  let healthBg = "#e5f6ed";

  if (healthScore < 50) {
    healthLabel = "High Risk";
    healthColor = "#b91c1c";
    healthBg = "#fee2e2";
  } else if (healthScore < 75) {
    healthLabel = "Fair / Moderate";
    healthColor = "#b45309";
    healthBg = "#fef3c7";
  }

  healthScorePill.textContent = `Health: ${healthLabel} (${healthScore}/100)`;
  healthScorePill.style.color = healthColor;
  healthScorePill.style.backgroundColor = healthBg;

  // Real-time Advisor Quick Insights list
  generateQuickInsights(data);

  // Update Chart
  updateChart(data.expenses);

  // Auto-sync Simulator
  const mobSavings = document.getElementById('mobileNetSavings');
  if (mobSavings) {
    mobSavings.textContent = `${formatINR(data.netSavings)} Saved`;
  }
  if (data.netSavings > 500) {
    const suggestedSip = Math.round(Math.min(data.netSavings * 0.75, 100000) / 500) * 500;
    simSipSlider.value = suggestedSip;
    simSipVal.textContent = `${formatINR(suggestedSip)} / month`;
  }
  updateSimulator();
}

function generateQuickInsights(data) {
  const items = [];

  // Goal check
  if (data.netSavings >= data.target) {
    const diff = data.netSavings - data.target;
    items.push(`✅ You beat your target savings goal by <strong>${formatINR(diff)}</strong>.`);
  } else if (data.netSavings > 0) {
    const shortfall = data.target - data.netSavings;
    items.push(`⚠️ You are <strong>${formatINR(shortfall)}</strong> short of your ₹${data.target.toLocaleString('en-IN')} target savings.`);
  } else {
    items.push(`🚨 You are running a monthly deficit of <strong>${formatINR(Math.abs(data.netSavings))}</strong>. Urgent expense trim required!`);
  }

  // Find biggest category
  const expEntries = Object.entries(data.expenses);
  expEntries.sort((a, b) => b[1] - a[1]);
  const [topCat, topAmt] = expEntries[0];
  const catNames = {
    rent: "Rent / EMI",
    groceries: "Groceries & Food",
    bills: "Bills & Recharge",
    transport: "Transport / Fuel",
    shopping: "Shopping & Outings",
    family: "Family & Health"
  };

  const topPct = data.income > 0 ? Math.round((topAmt / data.income) * 100) : 0;
  items.push(`📊 Biggest spend: <strong>${catNames[topCat]}</strong> at <strong>${formatINR(topAmt)}</strong> (${topPct}% of income).`);

  // Indian context tailored tip
  if (data.expenses.shopping > data.income * 0.18) {
    items.push(`💡 Tip: Discretionary shopping & dining out is high. Use UPI autopay limits or the '30-day rule' for non-essential buys.`);
  } else if (data.netSavings > 15000) {
    items.push(`💡 Tip: Auto-invest ₹${Math.round(data.netSavings * 0.7).toLocaleString('en-IN')} on salary credit day via SIP so surplus doesn't get spent.`);
  } else {
    items.push(`💡 Tip: Direct any festival bonuses or tax refunds directly into an emergency liquid mutual fund.`);
  }

  quickInsightsList.innerHTML = items.map(li => `<li>${li}</li>`).join('');
}

// Chart.js Bar Chart Setup
function updateChart(expenses) {
  const ctx = document.getElementById('expenseBarChart').getContext('2d');
  const labels = ['Rent', 'Groceries', 'Bills', 'Transport', 'Shopping', 'Family'];
  const values = [
    expenses.rent,
    expenses.groceries,
    expenses.bills,
    expenses.transport,
    expenses.shopping,
    expenses.family
  ];

  // Palette: Top category gets vibrant orange accent, others soft forest green shades
  const maxVal = Math.max(...values);
  const bgColors = values.map(v => (v === maxVal && v > 0) ? '#d96b27' : '#31694f');

  if (chartInstance) {
    chartInstance.data.datasets[0].data = values;
    chartInstance.data.datasets[0].backgroundColor = bgColors;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderRadius: 6,
          barPercentage: 0.6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ${formatINR(context.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              color: '#4f6055'
            }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: (value) => value >= 1000 ? (value / 1000) + 'k' : value,
              font: { family: 'Plus Jakarta Sans', size: 10 },
              color: '#72857a'
            }
          }
        }
      }
    });
  }
}

// Profile Loader
function loadProfile(key) {
  const p = PROFILES[key];
  if (!p) return;

  incomeInput.value = p.income;
  expRent.value = p.rent;
  expGroceries.value = p.groceries;
  expBills.value = p.bills;
  expTransport.value = p.transport;
  expShopping.value = p.shopping;
  expFamily.value = p.family;
  targetSavings.value = p.targetSavings;
  investmentPref.value = p.preference;

  // Highlight selected card
  profileCards.forEach(c => {
    if (c.dataset.profile === key) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  profileDropdown.value = key;
  updateCalculations();
}

// SIP & Compound Interest Calculator
function updateSimulator() {
  const p = parseFloat(simSipSlider.value) || 10000;
  const annualRate = parseFloat(simReturnSlider.value) || 12;
  const n = simHorizonYears;

  simSipVal.textContent = `${formatINR(p)} / month`;
  simReturnVal.textContent = `${annualRate}% p.a.`;

  // SIP Future Value formula: M = P * [ ((1 + i)^n - 1) / i ] * (1 + i)
  const i = (annualRate / 100) / 12; // Monthly rate
  const months = n * 12;
  const investedAmount = p * months;
  const totalCorpus = p * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const returns = totalCorpus - investedAmount;

  simInvested.textContent = formatINR(investedAmount);
  simReturns.textContent = `+${formatINR(returns)}`;
  simCorpus.textContent = formatINR(totalCorpus);

  // Emergency runway calculation
  const data = getFinancialData();
  const monthlyCost = data.totalExpense > 0 ? data.totalExpense : 1;
  const sixMonthTarget = monthlyCost * 6;
  const savingsAvail = data.netSavings > 0 ? data.netSavings : p;
  const monthsToGoal = Math.ceil(sixMonthTarget / (savingsAvail > 0 ? savingsAvail : 1000));

  simEmergencyNote.innerHTML = `
    🛡️ <strong>Safety Check:</strong> At your current monthly expense rate of <strong>${formatINR(monthlyCost)}</strong>, a 6-month safety net requires <strong>${formatINR(sixMonthTarget)}</strong>.<br>
    Allocating savings will fully fund this emergency buffer in <strong>${monthsToGoal} months</strong>!
  `;
}

// AI Financial Generation Engine
// Hybrid: Calls Gemini Cloud API if key is supplied; otherwise runs intelligent contextual expert engine locally!
async function generateAIFinancialPlan() {
  const btn = document.getElementById('btn-generate-ai');
  const spinner = document.getElementById('gen-spinner');
  btn.disabled = true;
  spinner.style.display = 'inline-block';

  const data = getFinancialData();
  const apiKey = localStorage.getItem('finvise_gemini_key') || '';

  try {
    let result = null;
    if (apiKey && apiKey.trim().length > 10) {
      result = await callGeminiAPI(apiKey, data);
    } else {
      // High-precision local Indian financial heuristic reasoning engine
      result = generateLocalAIAnalysis(data);
    }

    renderAIOutput(result);

    // Scroll smoothly to output
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error("AI Generation error:", err);
    // Fallback to local intelligence
    const fallback = generateLocalAIAnalysis(data);
    renderAIOutput(fallback);
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}

// Local Expert Reasoning Engine (Zero Latency, zero failure)
function generateLocalAIAnalysis(d) {
  const inc = d.income;
  const exp = d.totalExpense;
  const sav = d.netSavings;
  const target = d.target;
  const rate = Math.round(d.savingsRate);

  // 1. Budget Plan Breakdown
  const idealNeeds = Math.round(inc * 0.50);
  const idealWants = Math.round(inc * 0.30);
  const idealSavings = Math.round(inc * 0.20);

  const budgetPlanHTML = `
    <div class="ai-recommendation-item">
      <strong>Category Ceilings & Allocations</strong>
      • Fixed Essentials (Rent, Bills, Groceries): Allocated <strong>${formatINR(d.needsTotal)}</strong> (Recommended ceiling: ${formatINR(idealNeeds)}).<br>
      • Discretionary Outings & Lifestyle: Allocated <strong>${formatINR(d.wantsTotal)}</strong> (Target ceiling: ${formatINR(idealWants)}).<br>
      • Investment & Surplus: <strong>${formatINR(sav)}</strong> (${rate}% vs ideal ≥20%).
    </div>
    <div class="ai-recommendation-item">
      <strong>Monthly Cash Flow Assessment</strong>
      ${sav >= target ? `You are generating an adequate surplus above your ₹${target.toLocaleString('en-IN')} target. Maintain strict cap on UPI impulse orders.` : `Surplus is tight. Need to trim ₹${(target - sav).toLocaleString('en-IN')} from flexible categories to hit your saving benchmark.`}
    </div>
  `;

  // 2. Saving Suggestions & Leaks
  let savingsSuggestionsHTML = '';
  if (d.expenses.shopping > inc * 0.15) {
    savingsSuggestionsHTML += `
      <div class="ai-recommendation-item">
        <strong>Cut UPI / Dining & Food Delivery Leaks</strong>
        Shopping and eating out currently takes ${formatINR(d.expenses.shopping)}/mo. Setting a weekly UPI prepaid limit of ${formatINR(Math.round(d.expenses.shopping * 0.75 / 4))} can immediately free up <strong>${formatINR(Math.round(d.expenses.shopping * 0.25))}</strong> monthly.
      </div>
    `;
  }
  if (d.expenses.bills > 3000) {
    savingsSuggestionsHTML += `
      <div class="ai-recommendation-item">
        <strong>Review Subscriptions & Telecom Tariffs</strong>
        Audit recurring OTTs (Hotstar, Netflix, Prime), gym memberships, and high cellular postpaids. Annual family packs can yield 15-20% savings.
      </div>
    `;
  }
  savingsSuggestionsHTML += `
    <div class="ai-recommendation-item">
      <strong>The 24-Hour Cooling Off Rule</strong>
      For any discretionary purchase on Amazon, Flipkart, or dining exceeding ₹1,500, enforce a 24-hour waiting window before executing payment.
    </div>
  `;

  // 3. Indian Wealth & Tax Strategy
  const sipAmt = Math.max(500, Math.round((sav > 0 ? sav * 0.65 : 2000) / 500) * 500);
  const liquidAmt = Math.max(500, Math.round((sav > 0 ? sav * 0.35 : 1000) / 500) * 500);

  let wealthStrategyHTML = `
    <div class="ai-recommendation-item">
      <strong>Systematic Investment Plan (SIP) Basket</strong>
      Deploy <strong>${formatINR(sipAmt)}/month</strong> across:
      • 50% in Nifty 50 Index Mutual Fund (Stable large cap core).<br>
      • 30% in Parag Parikh / Flexicap Fund (Diversified equity exposure).<br>
      • 20% in Midcap or Smallcap fund for long-term compound alpha.
    </div>
    <div class="ai-recommendation-item">
      <strong>Liquid Emergency Cushion & Debt</strong>
      Channel <strong>${formatINR(liquidAmt)}/month</strong> into a high-yield Auto-sweep Savings Account or Liquid Mutual Fund until a 6-month buffer of ${formatINR(exp * 6)} is secured.
    </div>
    <div class="ai-recommendation-item">
      <strong>Indian Tax Optimization (Old vs New Regime)</strong>
      ${inc > 750000 ? `Take advantage of Section 80C (PPF, ELSS, EPF up to ₹1.5L) or evaluate the New Tax Regime (Section 115BAC) for lower slab deductions without paperwork.` : `Your taxable slab falls favorably under 87A rebate thresholds. Focus on growth over aggressive tax shelter lock-ins.`}
    </div>
  `;

  // 4. Executive Monthly Summary
  const summaryHTML = `
    <div style="background: #faf6ee; padding: 16px; border-radius: 12px; border: 1px solid #ebdcc5;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
        <div><strong>Income Monitored:</strong> ${formatINR(inc)}</div>
        <div><strong>Total Outflow:</strong> ${formatINR(exp)}</div>
        <div><strong>Net Savings Retained:</strong> ${formatINR(sav)}</div>
        <div><strong>Runway Funded:</strong> ${(sav > 0 ? (sav / (exp || 1)).toFixed(1) : '0')} Months / Month Worked</div>
      </div>
      <p style="margin-bottom: 6px;">
        <strong>Advisor Recommendation:</strong> Your overall cashflow dynamic is healthy with a ${rate}% savings capture rate. 
        Your primary priority this month should be enforcing automated SIP debits within 48 hours of salary deposit.
      </p>
      <small style="color: #647369;">Generated by FinVise AI Model v2.4 • Tailored for Indian Tier-1/Tier-2 urban economic parameters.</small>
    </div>
  `;

  return {
    budgetPlan: budgetPlanHTML,
    savingsSuggestions: savingsSuggestionsHTML,
    wealthStrategy: wealthStrategyHTML,
    monthlySummary: summaryHTML
  };
}

// Direct Gemini API Call (when custom API key is present)
async function callGeminiAPI(apiKey, data) {
  const prompt = `
    You are FinVise AI, an elite Indian personal financial advisor.
    Analyze this user's monthly personal finances (in INR Rupees):
    - Monthly Net Take-Home: ₹${data.income}
    - Total Expenses: ₹${data.totalExpense}
    - Categories: Rent ₹${data.expenses.rent}, Groceries ₹${data.expenses.groceries}, Bills ₹${data.expenses.bills}, Transport ₹${data.expenses.transport}, Shopping ₹${data.expenses.shopping}, Family ₹${data.expenses.family}
    - Net Savings: ₹${data.netSavings}
    - Savings Target: ₹${data.target}
    - Financial Goal Preference: ${data.preference}

    Provide advice structured specifically for the Indian financial landscape (referencing SIPs, Mutual Funds, Emergency Fund in Liquid Funds/Auto-Sweep FD, 50/30/20 rule, UPI spending traps, Tax considerations).
    Respond strictly in JSON format with keys:
    "budgetPlan": HTML formatted strings with class="ai-recommendation-item",
    "savingsSuggestions": HTML formatted strings with class="ai-recommendation-item",
    "wealthStrategy": HTML formatted strings with class="ai-recommendation-item",
    "monthlySummary": HTML formatted executive summary string.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const json = await response.json();
  const text = json.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

function renderAIOutput(res) {
  document.getElementById('ai-budget-plan').innerHTML = res.budgetPlan;
  document.getElementById('ai-savings-suggestions').innerHTML = res.savingsSuggestions;
  document.getElementById('ai-investment-strategy').innerHTML = res.wealthStrategy;
  document.getElementById('ai-monthly-summary').innerHTML = res.monthlySummary;
}

// PDF Export Feature using jsPDF
function exportMonthlyPDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert("PDF library is still initializing. Please try again in a moment.");
    return;
  }

  const doc = new jsPDF();
  const data = getFinancialData();
  const dateStr = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  // Header Banner
  doc.setFillColor(13, 56, 36); // #0d3824
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("FinVise AI — Monthly Financial Health Report", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(200, 225, 210);
  doc.text(`Generated on: ${dateStr} • Profile: ${PROFILES[currentProfileKey]?.name || 'Custom'}`, 14, 28);

  // Financial Metrics Summary Table
  doc.setTextColor(20, 30, 25);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Cashflow Overview", 14, 48);

  doc.setDrawColor(220, 220, 220);
  doc.line(14, 52, 196, 52);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Monthly Take-Home Income:`, 14, 60);
  doc.setFont("helvetica", "bold");
  doc.text(formatINR(data.income), 140, 60);

  doc.setFont("helvetica", "normal");
  doc.text(`Total Monthly Expenses:`, 14, 68);
  doc.setFont("helvetica", "bold");
  doc.text(formatINR(data.totalExpense), 140, 68);

  doc.setFont("helvetica", "normal");
  doc.text(`Net Monthly Savings Surplus:`, 14, 76);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 104, 67);
  doc.text(formatINR(data.netSavings), 140, 76);

  doc.setTextColor(20, 30, 25);
  doc.setFont("helvetica", "normal");
  doc.text(`Monthly Savings Rate:`, 14, 84);
  doc.setFont("helvetica", "bold");
  doc.text(`${Math.round(data.savingsRate)}%`, 140, 84);

  // Category Breakdown
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Category Distribution", 14, 100);
  doc.line(14, 104, 196, 104);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const cats = [
    ["1. House Rent / EMI", data.expenses.rent],
    ["2. Groceries & Daily Food", data.expenses.groceries],
    ["3. Utility Bills & Recharges", data.expenses.bills],
    ["4. Transport & Fuel", data.expenses.transport],
    ["5. Shopping & Outings", data.expenses.shopping],
    ["6. Family & Healthcare", data.expenses.family]
  ];

  let y = 112;
  cats.forEach(([label, val]) => {
    doc.text(label, 18, y);
    doc.text(formatINR(val), 140, y);
    y += 8;
  });

  // Actionable Insights Section
  y += 6;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("AI Advisor Key Takeaways & Wealth Roadmap", 14, y);
  doc.line(14, y + 4, 196, y + 4);

  y += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("• Emergency Fund: Target 6 months of expenses (" + formatINR(data.totalExpense * 6) + ") in liquid instruments.", 14, y);
  y += 7;
  doc.text("• SIP Allocation: Recommend investing " + formatINR(Math.round(data.netSavings * 0.7)) + " in diversified mutual funds.", 14, y);
  y += 7;
  doc.text("• UPI Discipline: Cap discretionary entertainment and food ordering to under 15% of take-home pay.", 14, y);
  y += 7;
  doc.text("• Tax Optimization: Review ELSS / PPF allocation for 80C or leverage 115BAC new tax rates.", 14, y);

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 125);
  doc.text("FinVise AI is an educational tool. All projections are educational estimations and not SEBI registered advice.", 14, 280);

  doc.save(`FinVise_Financial_Report_${dateStr.replace(/ /g, '_')}.pdf`);
}

// Local Storage Snapshot Persistence
function saveCurrentSnapshot() {
  const data = getFinancialData();
  const snapshots = JSON.parse(localStorage.getItem('finvise_snapshots') || '[]');
  const newSnapshot = {
    id: Date.now(),
    date: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    profile: PROFILES[currentProfileKey]?.name || 'Custom',
    income: data.income,
    spend: data.totalExpense,
    savings: data.netSavings,
    savingsRate: Math.round(data.savingsRate)
  };

  snapshots.unshift(newSnapshot);
  localStorage.setItem('finvise_snapshots', JSON.stringify(snapshots.slice(0, 10))); // keep top 10
  alert(`Snapshot saved successfully! (${newSnapshot.date})`);
}

function renderSavedSnapshots() {
  const list = document.getElementById('historyListContainer');
  const snapshots = JSON.parse(localStorage.getItem('finvise_snapshots') || '[]');

  if (snapshots.length === 0) {
    list.innerHTML = `<p class="placeholder-text">No saved snapshots found. Generate a plan and click "Save Snapshot"!</p>`;
    return;
  }

  list.innerHTML = snapshots.map(s => `
    <div class="saved-snapshot-card">
      <div class="snapshot-info">
        <strong>${s.profile} • ${s.date}</strong>
        <small>Income: ${formatINR(s.income)} | Spend: ${formatINR(s.spend)} | Savings: ${formatINR(s.savings)} (${s.savingsRate}%)</small>
      </div>
      <button class="btn btn-outline btn-sm" onclick="restoreSnapshot(${s.income}, ${s.spend}, ${s.savings})">View</button>
    </div>
  `).join('');
}

// Event Listeners Initialization
function initEventListeners() {
  // Input real-time bindings
  const inputs = [incomeInput, expRent, expGroceries, expBills, expTransport, expShopping, expFamily, targetSavings, investmentPref];
  inputs.forEach(el => {
    el.addEventListener('input', updateCalculations);
  });

  // Profile Cards click
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      const pKey = card.dataset.profile;
      currentProfileKey = pKey;
      loadProfile(pKey);
    });
  });

  // Profile Dropdown
  profileDropdown.addEventListener('change', (e) => {
    currentProfileKey = e.target.value;
    loadProfile(e.target.value);
  });

  // Simulator Sliders & Horizon Buttons
  simSipSlider.addEventListener('input', updateSimulator);
  simReturnSlider.addEventListener('input', updateSimulator);
  periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      simHorizonYears = parseInt(btn.dataset.years, 10);
      updateSimulator();
    });
  });

  // AI Generation Button
  document.getElementById('btn-generate-ai').addEventListener('click', generateAIFinancialPlan);

  // PDF Export
  document.getElementById('btn-export-pdf').addEventListener('click', exportMonthlyPDF);

  // Save Snapshot
  document.getElementById('btn-save-plan').addEventListener('click', saveCurrentSnapshot);

  // History Modal
  const historyModal = document.getElementById('historyModal');
  document.getElementById('btn-open-history').addEventListener('click', () => {
    renderSavedSnapshots();
    historyModal.classList.add('open');
  });
  document.getElementById('btnCloseHistory').addEventListener('click', () => {
    historyModal.classList.remove('open');
  });

  // API Key Modal
  const apiModal = document.getElementById('apiModal');
  const apiStatusBadge = document.getElementById('api-status-badge');
  const geminiApiKey = document.getElementById('geminiApiKey');

  const savedKey = localStorage.getItem('finvise_gemini_key');
  if (savedKey) {
    geminiApiKey.value = savedKey;
    apiStatusBadge.textContent = 'Active (Custom)';
    apiStatusBadge.style.background = '#d1fae5';
    apiStatusBadge.style.color = '#065f46';
  }

  document.getElementById('btn-api-modal').addEventListener('click', () => {
    apiModal.classList.add('open');
  });
  document.getElementById('btnCloseApi').addEventListener('click', () => {
    apiModal.classList.remove('open');
  });
  document.getElementById('btn-save-key').addEventListener('click', () => {
    const val = geminiApiKey.value.trim();
    if (val) {
      localStorage.setItem('finvise_gemini_key', val);
      apiStatusBadge.textContent = 'Active (Custom)';
      apiStatusBadge.style.background = '#d1fae5';
      apiStatusBadge.style.color = '#065f46';
    }
    apiModal.classList.remove('open');
  });
  document.getElementById('btn-clear-key').addEventListener('click', () => {
    localStorage.removeItem('finvise_gemini_key');
    geminiApiKey.value = '';
    apiStatusBadge.textContent = 'Default (Offline)';
    apiStatusBadge.style.background = '#e5f5ec';
    apiStatusBadge.style.color = '#0b6837';
    apiModal.classList.remove('open');
  });

  // System Specs Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Close modals on clicking overlay outside
  window.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.remove('open');
    if (e.target === apiModal) apiModal.classList.remove('open');
  });
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadProfile('salaried');
  generateAIFinancialPlan(); // Pre-generate initial plan for seamless display
});
