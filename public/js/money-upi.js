const searchInput = document.querySelector('.instrument-search');
const filterButtons = document.querySelectorAll('[data-holding-filter]');
let activeFilter = 'all';

const holdings = [
  {
    element: document.querySelector('.holding-1-890'),
    name: 'Reliance Industries Ltd.',
    category: 'equities'
  },
  {
    element: document.querySelector('.holding-2-906'),
    name: 'Sovereign Digital Gold Node',
    category: 'gold'
  },
  {
    element: document.querySelector('.holding-3-922'),
    name: 'SBI Bluechip Largecap Fund',
    category: 'equities'
  },
  {
    element: document.querySelector('.holding-4-938'),
    name: 'HDFC Bank Ltd.',
    category: 'equities'
  }
];

function updateVisibleHoldings() {
  const searchText = searchInput.value.trim().toLowerCase();
  holdings.forEach(function (holding) {
    const matchesSearch = holding.name.toLowerCase().includes(searchText);
    const matchesFilter = activeFilter === 'all' || holding.category === activeFilter;
    holding.element.hidden = !matchesSearch || !matchesFilter;
  });
}

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    activeFilter = this.dataset.holdingFilter;
    filterButtons.forEach(function (filterButton) {
      filterButton.setAttribute('aria-pressed', String(filterButton === button));
    });
    updateVisibleHoldings();
  });
});

searchInput.addEventListener('input', updateVisibleHoldings);
updateVisibleHoldings();

const sipInputs = [
  document.querySelector('#sip-monthly-investment'),
  document.querySelector('#sip-annual-return'),
  document.querySelector('#sip-duration')
];
const sipError = document.querySelector('.sip-error');
const futureValueOutput = document.querySelector('#sip-future-value');
const investedAmountOutput = document.querySelector('#sip-invested-amount');
const estimatedReturnsOutput = document.querySelector('#sip-estimated-returns');
const sipSaveButton = document.querySelector('#sip-save-entry');
const sipExportButton = document.querySelector('#sip-export-entries');
const sipSaveStatus = document.querySelector('#sip-save-status');
const sipSavedList = document.querySelector('#sip-saved-list');
const entryStorageKey = 'spendwise.entries.v1';
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
let latestSipCalculation = null;

function showSipSaveStatus(message, isError) {
  sipSaveStatus.textContent = message;
  sipSaveStatus.classList.toggle('sip-save-status-error', Boolean(isError));
}

function renderSavedSipCalculations(entries) {
  sipSavedList.replaceChildren();
  const calculations = (entries || []).filter(function (entry) {
    return entry && entry.entryKind === 'sip-calculation';
  });

  if (calculations.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'sip-saved-empty';
    emptyMessage.textContent = 'No SIP calculations saved yet.';
    sipSavedList.append(emptyMessage);
    return;
  }

  calculations.forEach(function (calculation) {
    const item = document.createElement('article');
    item.className = 'sip-saved-item';
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${inrFormatter.format(calculation.monthlyInvestment)} / month · ${calculation.annualReturn}% · ${calculation.durationYears} years`;
    const summary = document.createElement('p');
    summary.textContent = `${calculation.date} · Future value ${inrFormatter.format(calculation.futureValue)}`;
    details.append(title, summary);
    item.append(details);
    sipSavedList.append(item);
  });
}

function readLocalFallback() {
  try {
    const stored = localStorage.getItem(entryStorageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function loadAndRenderSipCalculations() {
  try {
    const response = await fetch('/api/investments/sip');
    if (!response.ok) throw new Error('API unavailable');
    const data = await response.json();
    renderSavedSipCalculations(data);
    localStorage.setItem(entryStorageKey, JSON.stringify(data));
  } catch {
    renderSavedSipCalculations(readLocalFallback());
  }
}

function calculateSip() {
  const values = sipInputs.map(function (input) {
    return input.valueAsNumber;
  });
  const isValid = sipInputs.every(function (input, index) {
    return input.validity.valid && Number.isFinite(values[index]);
  });

  sipError.hidden = isValid;
  if (!isValid) {
    futureValueOutput.textContent = '—';
    investedAmountOutput.textContent = '—';
    estimatedReturnsOutput.textContent = '—';
    latestSipCalculation = null;
    return null;
  }

  const monthlyInvestment = values[0];
  const monthlyRate = values[1] / 100 / 12;
  const months = values[2] * 12;
  const investedAmount = monthlyInvestment * months;
  const futureValue = monthlyRate === 0
    ? investedAmount
    : monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const estimatedReturns = futureValue - investedAmount;

  futureValueOutput.textContent = inrFormatter.format(futureValue);
  investedAmountOutput.textContent = inrFormatter.format(investedAmount);
  estimatedReturnsOutput.textContent = inrFormatter.format(estimatedReturns);
  latestSipCalculation = {
    monthlyInvestment: monthlyInvestment,
    annualReturn: values[1],
    durationYears: values[2],
    investedAmount: investedAmount,
    estimatedReturns: estimatedReturns,
    futureValue: futureValue
  };
  return latestSipCalculation;
}

sipInputs.forEach(function (input) {
  input.addEventListener('input', calculateSip);
});
calculateSip();
loadAndRenderSipCalculations();

sipSaveButton.addEventListener('click', async function () {
  const calculation = calculateSip();
  if (!calculation) {
    showSipSaveStatus('Correct the calculator values before saving.', true);
    return;
  }

  sipSaveButton.disabled = true;
  showSipSaveStatus('Saving calculation to MongoDB...', false);

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const entry = {
    id: `sip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    description: 'SIP investment plan',
    amount: calculation.monthlyInvestment,
    type: 'expense',
    category: 'SIP Investment',
    date: date,
    entryKind: 'sip-calculation',
    monthlyInvestment: calculation.monthlyInvestment,
    annualReturn: calculation.annualReturn,
    durationYears: calculation.durationYears,
    investedAmount: calculation.investedAmount,
    estimatedReturns: calculation.estimatedReturns,
    futureValue: calculation.futureValue
  };

  try {
    const res = await fetch('/api/investments/sip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Database save failed');
    }

    showSipSaveStatus('SIP calculation saved to database!', false);
    await loadAndRenderSipCalculations();
  } catch (err) {
    try {
      const local = [entry].concat(readLocalFallback());
      localStorage.setItem(entryStorageKey, JSON.stringify(local));
      renderSavedSipCalculations(local);
      showSipSaveStatus(`Saved locally (${err.message})`, false);
    } catch (fallbackErr) {
      showSipSaveStatus(`Could not save: ${err.message}`, true);
    }
  } finally {
    sipSaveButton.disabled = false;
  }
});

sipExportButton.addEventListener('click', async function () {
  showSipSaveStatus('Exporting entries from MongoDB...', false);
  try {
    const response = await fetch('/api/investments/export');
    if (!response.ok) throw new Error('Export endpoint error');

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'spendwise-entries.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    showSipSaveStatus('All entries exported from database to spendwise-entries.json.', false);
  } catch (err) {
    try {
      const entries = readLocalFallback();
      const file = new Blob([JSON.stringify({ version: 1, source: 'local-fallback', entries: entries }, null, 2)], {
        type: 'application/json'
      });
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'spendwise-entries.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      showSipSaveStatus('Exported cached entries to spendwise-entries.json.', false);
    } catch (fallbackErr) {
      showSipSaveStatus(`Could not export entries: ${err.message}`, true);
    }
  }
});
