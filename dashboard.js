
const API_URL = "http://localhost:3000/api/expenses";

const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("expenseTitle");
const amountInput = document.getElementById("expenseAmount");
const categoryInput = document.getElementById("expenseCategory");
const dateInput = document.getElementById("expenseDate");
const message = document.getElementById("expenseMessage");
const expenseList = document.getElementById("expenseList");
const expenseCount = document.getElementById("expenseCount");
const submitButton = document.getElementById("expenseSubmit");

const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

if (dateInput) {
  dateInput.value = localToday;
  dateInput.max = localToday;
}

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `expense-message ${type}`;
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount));
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function renderExpenses(expenses) {
  if (!expenseList || !expenseCount) return;

  expenseCount.textContent =
    `${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`;

  expenseList.replaceChildren();

  if (expenses.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "expense-empty";
    emptyMessage.textContent = "No expenses yet. Add your first expense!";
    expenseList.appendChild(emptyMessage);
    return;
  }

  const sortedExpenses = [...expenses].sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  sortedExpenses.forEach((expense) => {
    const item = document.createElement("div");
    item.className = "expense-item";

    const details = document.createElement("div");
    details.className = "expense-details";

    const title = document.createElement("h4");
    title.textContent = expense.title;

    const info = document.createElement("p");
    info.textContent =
      `${expense.category} · ${formatDate(expense.date)}`;

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = `− ${formatAmount(expense.amount)}`;

    details.append(title, info);
    item.append(details, amount);
    expenseList.appendChild(item);
  });
}

async function loadExpenses() {
  if (!expenseList) return;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load expenses.");
    }

    const data = await response.json();
    const expenses = Array.isArray(data)
      ? data
      : data.expenses;

    renderExpenses(Array.isArray(expenses) ? expenses : []);
  } catch (error) {
    expenseList.replaceChildren();

    const errorMessage = document.createElement("p");
    errorMessage.className = "expense-empty";
    errorMessage.textContent =
      "Unable to load expenses. Check that the backend server is running.";
    expenseList.appendChild(errorMessage);

    console.error("Loading expenses failed:", error);
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title) {
      showMessage("Please enter an expense name.", "error");
      titleInput.focus();
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
      showMessage("Enter a valid positive amount.", "error");
      amountInput.focus();
      return;
    }

    if (!category) {
      showMessage("Please choose a category.", "error");
      categoryInput.focus();
      return;
    }

    if (!date || date > localToday) {
      showMessage("Please select a valid date, not in the future.", "error");
      dateInput.focus();
      return;
    }

    submitButton.disabled = true;
    showMessage("Saving expense...", "info");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, amount, category, date })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save the expense.");
      }

      showMessage("Expense added successfully!", "success");
      form.reset();

      dateInput.value = localToday;
      dateInput.max = localToday;

      await loadExpenses();
    } catch (error) {
      showMessage(
        `${error.message} Make sure the backend server is running.`,
        "error"
      );
      console.error("Saving expense failed:", error);
    } finally {
      submitButton.disabled = false;
    }
  });
}

loadExpenses();

const instrumentSearch = document.getElementById("instrumentSearch");

if (instrumentSearch) {
  const instrumentList = document.querySelector(".node-593");

  const searchableItems = [
    {
      element: document.querySelector(".container-595"),
      badge: document.querySelector(".background-border-603")
    },
    {
      element: document.querySelector(".node-605")
    },
    {
      element: document.querySelector(".node-617")
    },
    {
      element: document.querySelector(".node-547")
    },
    {
      element: document.querySelector(".node-629")
    }
  ].filter((item) => item.element);

  instrumentSearch.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    searchableItems.forEach(({ element, badge }) => {
      const matches = element.textContent.toLowerCase().includes(query);

      element.style.display = matches ? "" : "none";

      if (badge) {
        badge.style.display = matches ? "" : "none";
      }
    });
  });
}

