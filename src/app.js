const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { isValidPixeldrainUrl, extractViewerData } = require("./utils/pixeldrainUtils");

const app = express();
const port = 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));
app.use("/", limiter);

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  const { url } = req.body;

  if (!url || !isValidPixeldrainUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing Pixeldrain URL" });
  }

  try {
    const { data: html } = await axios.get(url, { timeout: 5000 });

    const viewerData = extractViewerData(html);

    if (viewerData) {
      res.status(200).json({ viewerData });
    } else {
      res.status(404).json({ error: "Pixeldrain data not found" });
    }
  } catch (err) {
    console.error("Bypass error:", err.message);
    res.status(500).json({ error: "Failed to process URL", details: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
