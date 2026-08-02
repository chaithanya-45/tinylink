const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: "direct" },
});

const linkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: [clickSchema], default: [] },
});

module.exports = mongoose.model("Link", linkSchema);
