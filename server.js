
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "transactions.json");

app.use(express.json());
app.use(express.static(__dirname));

// Read transactions from JSON file
async function readTransactions() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf8");
        const transactions = JSON.parse(data);

        return Array.isArray(transactions) ? transactions : [];
    } catch (error) {
        if (error.code === "ENOENT") {
            await fs.writeFile(DATA_FILE, "[]", "utf8");
            return [];
        }

        throw error;
    }
}

// Save transactions to JSON file
async function writeTransactions(transactions) {
    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(transactions, null, 2),
        "utf8"
    );
}

// Create and validate a transaction
function makeTransaction(body, id) {
    const title = String(
        body.title || body.name || ""
    ).trim();

    const rawAmount = body.amount;

    const amount = Number(
        typeof rawAmount === "string"
            ? rawAmount.replace(/[₹,\s]/g, "")
            : rawAmount
    );

    if (
        !title ||
        rawAmount === "" ||
        rawAmount === null ||
        rawAmount === undefined ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return null;
    }

    return {
        id: String(id),
        title: title,
        amount: amount,
        category: body.category || "Other",
        type: body.type || "expense",
        date: body.date ||
            new Date().toISOString().slice(0, 10)
    };
}

// GET: Load all transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await readTransactions();
        res.json(transactions);
    } catch (error) {
        console.error("Read error:", error);
        res.status(500).json({
            error: "Could not load transactions."
        });
    }
});

// POST: Add a new transaction
app.post("/api/transactions", async (req, res) => {
    try {
        console.log("New transaction received:", req.body);

        const transactions = await readTransactions();

        const transaction = makeTransaction(
            req.body,
            Date.now().toString()
        );

        if (!transaction) {
            return res.status(400).json({
                error: "Please enter a valid transaction name and amount.",
                received: req.body
            });
        }

        transactions.push(transaction);

        await writeTransactions(transactions);

        console.log("Transaction saved:", transaction);

        res.status(201).json(transaction);
    } catch (error) {
        console.error("Save error:", error);

        res.status(500).json({
            error: "Could not save transaction."
        });
    }
});

// PUT: Update an existing transaction
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const transactions = await readTransactions();

        const index = transactions.findIndex(
            item => String(item.id) === String(req.params.id)
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Transaction not found."
            });
        }

        const updatedTransaction = makeTransaction(
            req.body,
            req.params.id
        );

        if (!updatedTransaction) {
            return res.status(400).json({
                error: "Please enter a valid transaction name and amount.",
                received: req.body
            });
        }

        transactions[index] = updatedTransaction;

        await writeTransactions(transactions);

        res.json(updatedTransaction);
    } catch (error) {
        console.error("Update error:", error);

        res.status(500).json({
            error: "Could not update transaction."
        });
    }
});

// DELETE: Remove a transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const transactions = await readTransactions();

        const updatedTransactions = transactions.filter(
            item => String(item.id) !== String(req.params.id)
        );

        if (updatedTransactions.length === transactions.length) {
            return res.status(404).json({
                error: "Transaction not found."
            });
        }

        await writeTransactions(updatedTransactions);

        res.json({
            message: "Transaction deleted successfully."
        });
    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            error: "Could not delete transaction."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(
        `SpendWise server running at http://localhost:${PORT}`
    );
});
