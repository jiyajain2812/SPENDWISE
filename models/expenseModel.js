const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/expenses.json");

function getAllExpenses(callback) {
  fs.readFile(DATA_FILE, "utf8", (err, data) => {
    if (err) return callback(err, null);
    try {
      const parsed = JSON.parse(data || '{"expenses":[]}');
      callback(null, parsed);
    } catch (parseErr) {
      callback(parseErr, null);
    }
  });
}

function saveExpense(expense, callback) {
  getAllExpenses((err, savedData) => {
    if (err) return callback(err, null);

    if (!Array.isArray(savedData.expenses)) {
      return callback(new Error("Invalid expenses file"), null);
    }

    const record = {
      id: Date.now().toString(),
      title: expense.title.trim(),
      amount: Number(expense.amount),
      category: expense.category.trim(),
      date: expense.date,
    };

    savedData.expenses.push(record);

    fs.writeFile(DATA_FILE, JSON.stringify(savedData, null, 2), (writeErr) => {
      if (writeErr) return callback(writeErr, null);
      callback(null, record);
    });
  });
}

module.exports = { getAllExpenses, saveExpense };
