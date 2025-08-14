// utils/pixeldrainUtils.js
const axios = require("axios");

// Try both .com and .net (regional reliability)
const API_BASES = ["https://pixeldrain.com/api", "https://pixeldrain.net/api"];

// Parse and validate pixeldrain URLs: /u/:id (file) or /l/:id (list)
function parsePixeldrainUrl(input) {
  try {
    const u = new URL(input);
    if (!/^(?:www\.)?pixeldrain\.(?:com|net)$/i.test(u.hostname)) return null;

    const segs = u.pathname.split("/").filter(Boolean); // e.g. ["u", "abc123"]
    if (segs.length < 2) return null;

    const kind = segs[0].toLowerCase(); // "u" | "l"
    const id = segs[1];

    if (!["u", "l"].includes(kind)) return null;
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;

    return { kind: kind === "u" ? "file" : "list", id };
  } catch {
    return null;
  }
}

function isValidPixeldrainUrl(url) {
  return !!parsePixeldrainUrl(url);
}

/**
 * Calls Pixeldrain API and returns:
 * {
 *   viewerData: {
 *     type: "file" | "list",
 *     api_response: {...}
 *   }
 * }
 */
async function fetchViewerData(url) {
  const parsed = parsePixeldrainUrl(url);
  if (!parsed) return null;

  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

  let lastErr;
  for (const base of API_BASES) {
    try {
      if (parsed.kind === "file") {
        // GET /api/file/:id/info
        const { data } = await axios.get(`${base}/file/${parsed.id}/info`, {
          headers: { "User-Agent": ua, Accept: "application/json" },
          timeout: 8000,
          validateStatus: () => true,
        });

        if (data && data.id) {
          return {
            viewerData: {
              type: "file",
              api_response: {
                id: data.id,
                name: data.name,
                size: data.size,
                views: data.views,
                downloads: data.downloads,
              },
            },
          };
        }
      } else {
        // GET /api/list/:id
        const { data } = await axios.get(`${base}/list/${parsed.id}`, {
          headers: { "User-Agent": ua, Accept: "application/json" },
          timeout: 8000,
          validateStatus: () => true,
        });

        if (data && (Array.isArray(data.files) || data.id)) {
          const files = (data.files || []).map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            views: f.views,
            downloads: f.downloads,
          }));
          return {
            viewerData: {
              type: "list",
              api_response: {
                title: data.name || data.title || `List ${parsed.id}`,
                files,
              },
            },
          };
        }
      }
    } catch (e) {
      lastErr = e;
      // Try next base
    }
  }

  if (lastErr) throw lastErr;
  return null;
}

module.exports = { isValidPixeldrainUrl, fetchViewerData };
