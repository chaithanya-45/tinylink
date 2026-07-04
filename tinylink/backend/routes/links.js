const express = require("express");
const router = express.Router();
const { nanoid } = require("nanoid");
const Link = require("../models/Link");

// Basic URL validation
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// POST /api/links  -> create a short link
router.post("/", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({ error: "Please provide a valid URL (include https://)" });
    }

    // Base62-style short code using nanoid's URL-safe alphabet
    let shortCode;
    let exists = true;
    while (exists) {
      shortCode = nanoid(7);
      exists = await Link.findOne({ shortCode });
    }

    const link = await Link.create({ originalUrl, shortCode });
    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating link" });
  }
});

// GET /api/links -> list all links (for dashboard)
router.get("/", async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching links" });
  }
});

// GET /api/links/:shortCode/stats -> analytics for one link
router.get("/:shortCode/stats", async (req, res) => {
  try {
    const link = await Link.findOne({ shortCode: req.params.shortCode });
    if (!link) return res.status(404).json({ error: "Link not found" });
    res.json({
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      totalClicks: link.clicks.length,
      clicks: link.clicks,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching stats" });
  }
});

module.exports = router;
