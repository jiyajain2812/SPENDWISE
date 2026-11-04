
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "expenses.json");

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Read all saved expenses
  if (req.url === "/api/expenses" && req.method === "GET") {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: "Could not read expenses" }));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  // Save a submitted expense
  if (req.url === "/api/expenses" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
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

        fs.readFile(DATA_FILE, "utf8", (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end(JSON.stringify({ error: "Could not read expense file" }));
          }

          try {
            const savedData = JSON.parse(data || '{"expenses":[]}');
            if (!Array.isArray(savedData.expenses)) {
              throw new Error("Invalid expenses file");
            }

            const record = {
              id: Date.now().toString(),
              title: expense.title.trim(),
              amount,
              category: expense.category.trim(),
              date: expense.date
            };

            savedData.expenses.push(record);

            fs.writeFile(DATA_FILE, JSON.stringify(savedData, null, 2), writeErr => {
              if (writeErr) {
                res.writeHead(500);
                return res.end(JSON.stringify({ error: "Could not save expense" }));
              }

              res.writeHead(201, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Expense saved!", expense: record }));
            });
          } catch {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid expenses file" }));
          }
        });
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`SpendWise server running at http://localhost:${PORT}`);
});
