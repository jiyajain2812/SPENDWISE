const { connectDB } = require("../config/db");
const Investment = require("../models/investmentModel");

async function getSips(req, res) {
  try {
    await connectDB();
    const entries = await Investment.find({}).sort({ createdAt: -1 }).lean();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(entries));
  } catch (error) {
    console.error("Error fetching SIP entries:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch SIP entries from database" }));
  }
}

async function saveSip(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 20000) req.destroy();
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body);
      const monthlyInvestment = Number(data.monthlyInvestment);
      const annualReturn = Number(data.annualReturn);
      const durationYears = Number(data.durationYears);

      if (
        !Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0 ||
        !Number.isFinite(annualReturn) || annualReturn < 0 ||
        !Number.isFinite(durationYears) || durationYears <= 0
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid numeric parameters for SIP calculation" }));
      }

      await connectDB();

      const newRecord = {
        id: data.id || `sip-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        description: data.description || "SIP investment plan",
        amount: monthlyInvestment,
        type: "expense",
        category: "SIP Investment",
        date: data.date || new Date().toISOString().slice(0, 10),
        entryKind: "sip-calculation",
        monthlyInvestment,
        annualReturn,
        durationYears,
        investedAmount: Number(data.investedAmount) || 0,
        estimatedReturns: Number(data.estimatedReturns) || 0,
        futureValue: Number(data.futureValue) || 0,
      };

      const saved = await Investment.create(newRecord);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "SIP calculation saved to database!", entry: saved }));
    } catch (error) {
      console.error("Error saving SIP entry:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to save SIP entry to database" }));
    }
  });
}

async function exportSips(req, res) {
  try {
    await connectDB();
    const entries = await Investment.find({}).sort({ createdAt: -1 }).lean();

    const exportPayload = {
      version: 1,
      source: "mongodb",
      exportedAt: new Date().toISOString(),
      entries: entries.map((doc) => ({
        id: doc.id,
        description: doc.description,
        amount: doc.amount,
        type: doc.type,
        category: doc.category,
        date: doc.date,
        entryKind: doc.entryKind,
        monthlyInvestment: doc.monthlyInvestment,
        annualReturn: doc.annualReturn,
        durationYears: doc.durationYears,
        investedAmount: doc.investedAmount,
        estimatedReturns: doc.estimatedReturns,
        futureValue: doc.futureValue,
      })),
    };

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="spendwise-entries.json"',
    });
    res.end(JSON.stringify(exportPayload, null, 2));
  } catch (error) {
    console.error("Error exporting SIP entries:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to export data from database" }));
  }
}

module.exports = { getSips, saveSip, exportSips };
