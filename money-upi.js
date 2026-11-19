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
let entryStorageReady = true;

function isValidSavedEntry(entry) {
  return entry !== null &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    typeof entry.description === 'string' &&
    typeof entry.amount === 'number' &&
    Number.isFinite(entry.amount) &&
    (entry.type === 'income' || entry.type === 'expense') &&
    typeof entry.category === 'string' &&
    typeof entry.date === 'string';
}

function readSavedEntries() {
  const storedEntries = localStorage.getItem(entryStorageKey);
  if (storedEntries === null) {
    return [];
  }

  const parsedEntries = JSON.parse(storedEntries);
  if (!Array.isArray(parsedEntries) || !parsedEntries.every(isValidSavedEntry)) {
    throw new Error('Saved entry data is not in the expected format.');
  }
  return parsedEntries;
}

function showSipSaveStatus(message, isError) {
  sipSaveStatus.textContent = message;
  sipSaveStatus.classList.toggle('sip-save-status-error', Boolean(isError));
}

function renderSavedSipCalculations(entries) {
  sipSavedList.replaceChildren();
  const calculations = entries.filter(function (entry) {
    return entry.entryKind === 'sip-calculation';
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

function saveAllEntries(entries) {
  localStorage.setItem(entryStorageKey, JSON.stringify(entries));
}

function exportAllEntries() {
  const entries = readSavedEntries();
  const file = new Blob([JSON.stringify({ version: 1, entries: entries }, null, 2)], {
    type: 'application/json'
  });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'spendwise-entries.json';
  link.click();
  setTimeout(function () {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
  showSipSaveStatus('All entries were exported to spendwise-entries.json.', false);
}

try {
  renderSavedSipCalculations(readSavedEntries());
} catch (error) {
  entryStorageReady = false;
  sipSaveButton.disabled = true;
  sipExportButton.disabled = true;
  showSipSaveStatus(`Could not load saved entries: ${error.message}`, true);
}

function calculateSip() {
  // Read the three user inputs and check both the HTML limits and numeric values.
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
  // Convert the annual percentage return to a decimal monthly rate.
  const monthlyRate = values[1] / 100 / 12;
  // There are 12 monthly SIP payments in each investment year.
  const months = values[2] * 12;
  // The amount invested is the monthly payment multiplied by the number of payments.
  const investedAmount = monthlyInvestment * months;
  // Future value of monthly payments, assuming each payment is made at the
  // beginning of the month. When the return is 0%, the value is just the total invested.
  const futureValue = monthlyRate === 0
    ? investedAmount
    : monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  // The growth earned is the future value minus the money contributed.
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

sipSaveButton.addEventListener('click', function () {
  if (!entryStorageReady) {
    showSipSaveStatus('Entries cannot be saved until browser storage is available.', true);
    return;
  }

  const calculation = calculateSip();
  if (!calculation) {
    showSipSaveStatus('Correct the calculator values before saving.', true);
    return;
  }

  try {
    const entries = readSavedEntries();
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
    const updatedEntries = [entry].concat(entries);
    saveAllEntries(updatedEntries);
    renderSavedSipCalculations(updatedEntries);
    showSipSaveStatus('SIP calculation saved with your other SpendWise entries.', false);
  } catch (error) {
    showSipSaveStatus(`Could not save this SIP calculation: ${error.message}`, true);
  }
});

sipExportButton.addEventListener('click', function () {
  if (!entryStorageReady) {
    showSipSaveStatus('Entries cannot be exported until browser storage is available.', true);
    return;
  }

  try {
    exportAllEntries();
  } catch (error) {
    showSipSaveStatus(`Could not export entries: ${error.message}`, true);
  }
});

window.addEventListener('storage', function (event) {
  if (event.key !== entryStorageKey) {
    return;
  }
  try {
    renderSavedSipCalculations(readSavedEntries());
  } catch (error) {
    entryStorageReady = false;
    sipSaveButton.disabled = true;
    sipExportButton.disabled = true;
    showSipSaveStatus(`Could not refresh saved entries: ${error.message}`, true);
  }
});
