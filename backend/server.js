require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const linksRouter = require("./routes/links");
const Link = require("./models/Link");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TinyLink API is running.");
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection middleware error:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/links", linksRouter);

app.get("/:shortCode", async (req, res) => {
  try {
    const link = await Link.findOne({ shortCode: req.params.shortCode });

    if (!link) {
      return res.status(404).send("Short link not found");
    }

    link.clicks.push({
      timestamp: new Date(),
      referrer: req.get("referer") || "direct",
    });

    await link.save();

    res.redirect(link.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB, server not started:", err.message);
      process.exit(1);
    });
}