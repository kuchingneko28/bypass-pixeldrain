const cheerio = require("cheerio");

function isValidPixeldrainUrl(url) {
  return /^https?:\/\/(www\.)?pixeldrain\.com\/[a-z]+\/\w+/i.test(url);
}

function extractViewerData(html) {
  const $ = cheerio.load(html);
  const scripts = $("script");

  for (let i = 0; i < scripts.length; i++) {
    const content = $(scripts[i]).html();
    if (content && content.includes("window.viewer_data")) {
      const match = content.match(/window\.viewer_data\s*=\s*(\{[\s\S]*?\});/);
      if (match && match[1]) {
        try {
          // Sanitize for parsing
          const cleaned = match[1].replace(/;\s*$/, "");
          return JSON.parse(cleaned);
        } catch (err) {
          console.error("Failed to parse viewer_data JSON", err);
          return null;
        }
      }
    }
  }

  return null;
}

module.exports = { extractViewerData, isValidPixeldrainUrl };
