// app.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const serverless = require("serverless-http");
const { isValidPixeldrainUrl, fetchViewerData } = require("./utils/pixeldrainUtils");

const app = express();

// trust proxy if behind edge / serverless
app.set("trust proxy", 1);

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// rate limit basic POSTs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/", limiter);

// static + index
app.use(express.static(path.join(__dirname, "views")));
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// API: accept { url } and return viewerData
app.post("/", async (req, res) => {
  const { url } = req.body || {};
  if (!url || !isValidPixeldrainUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing Pixeldrain URL" });
  }

  try {
    const payload = await fetchViewerData(url);
    if (payload && payload.viewerData) {
      return res.status(200).json(payload);
    }
    return res.status(404).json({ error: "Pixeldrain data not found" });
  } catch (err) {
    console.error("Bypass error:", err.message);
    if (err.response) {
      // Upstream error from Pixeldrain
      return res.status(err.response.status || 502).json({ error: "Upstream error", status: err.response.status, data: err.response.data });
    }
    if (err.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Pixeldrain API timeout" });
    }
    return res.status(500).json({ error: "Failed to process URL", details: err.message });
  }
});

// Fallbacks
app.use((req, res) => {
  if (req.method === "GET") return res.redirect("/");
  res.status(404).json({ error: "Not found" });
});

// Local run (optional)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
}

// Serverless export (optional)
module.exports = app;
module.exports.handler = serverless(app);
