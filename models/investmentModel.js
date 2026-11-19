const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    description: { type: String, default: "SIP investment plan" },
    amount: { type: Number, required: true },
    type: { type: String, default: "expense" },
    category: { type: String, default: "SIP Investment" },
    date: { type: String, required: true },
    entryKind: { type: String, default: "sip-calculation" },
    monthlyInvestment: { type: Number, required: true },
    annualReturn: { type: Number, required: true },
    durationYears: { type: Number, required: true },
    investedAmount: { type: Number, required: true },
    estimatedReturns: { type: Number, required: true },
    futureValue: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Investment || mongoose.model("Investment", investmentSchema);
