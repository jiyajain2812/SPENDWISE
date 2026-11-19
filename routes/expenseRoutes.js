const { getExpenses, createExpense } = require("../controllers/expenseController");

function expenseRoutes(req, res) {
  if (req.url === "/api/expenses" && req.method === "GET") {
    return getExpenses(req, res);
  }

  if (req.url === "/api/expenses" && req.method === "POST") {
    return createExpense(req, res);
  }

  return false; // route not matched
}

module.exports = { expenseRoutes };
