const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const path = require("path");

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
  try {
    const { url } = req.body;
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);
    const scripts = $("script");

    let viewerData = null;

    scripts.each((i, script) => {
      const content = $(script).html();

      if (content && content.includes("window.viewer_data")) {
        const match = content.match(/window\.viewer_data\s*=\s*(\{[\s\S]*?\});/);

        if (match && match[1]) {
          try {
            viewerData = eval("(" + match[1] + ")");
          } catch (e) {
            console.error("Failed to parse data:", e);
          }
        }
      }
    });

    if (viewerData) {
      res.status(200).json({ viewerData });
    } else {
      res.status(404).json({ error: "data not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or parse page", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
