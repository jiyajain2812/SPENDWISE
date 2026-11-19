const { getAllExpenses, saveExpense } = require("../models/expenseModel");

function getExpenses(req, res) {
  getAllExpenses((err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Could not read expenses" }));
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  });
}

function createExpense(req, res) {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 10000) req.destroy();
  });

  req.on("end", () => {
    try {
      const expense = JSON.parse(body);
      const amount = Number(expense.amount);

      if (
        typeof expense.title !== "string" ||
        !expense.title.trim() ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000000 ||
        typeof expense.category !== "string" ||
        !expense.category.trim() ||
        typeof expense.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(expense.date)
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Please provide valid expense details" }));
      }

      saveExpense(expense, (err, record) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Could not save expense" }));
        }
        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Expense saved!", expense: record }));
      });
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });
}

module.exports = { getExpenses, createExpense };
