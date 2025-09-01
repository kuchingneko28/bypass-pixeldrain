const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

const { fetchViewerData, parsePixeldrainUrl } = require("./utils/pixeldrainUtils");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

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
app.use(express.static(path.join(__dirname, "views")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/", async (req, res) => {
  const { url } = req.body || {};
  const parsed = parsePixeldrainUrl(url);
  if (!parsed) return res.status(400).json({ error: "Invalid Pixeldrain URL" });

  try {
    const result = await fetchViewerData(url);
    if (result?.viewerData) return res.json(result);
    res.status(404).json({ error: "Viewer data not found" });
  } catch (err) {
    console.error("Fetch error:", err.message);
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Failed to fetch Pixeldrain data", details: err.message });
  }
});

app.use((req, res) => res.redirect("/"));

app.listen(PORT, () => {
  console.log(`🚀 Listening on http://localhost:${PORT}`);
});

module.exports = app;
