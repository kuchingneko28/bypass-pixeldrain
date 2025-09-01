const axios = require("axios");

const API_BASES = ["https://pixeldrain.com/api", "https://pixeldrain.net/api"];

function parsePixeldrainUrl(input) {
  try {
    const u = new URL(input);
    const host = u.hostname.replace(/^www\./, "");
    if (!/^pixeldrain\.(com|net)$/.test(host)) return null;

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const kind = parts[0].toLowerCase();
    const id = parts[1];
    if (!["u", "l"].includes(kind) || !/^[\w-]+$/.test(id)) return null;

    return { kind: kind === "u" ? "file" : "list", id };
  } catch {
    return null;
  }
}

async function fetchViewerData(url) {
  const parsed = parsePixeldrainUrl(url);
  if (!parsed) return null;

  const headers = {
    "User-Agent": "Mozilla/5.0",
    Accept: "application/json",
  };

  for (const base of API_BASES) {
    const endpoint = parsed.kind === "file" ? `${base}/file/${parsed.id}/info` : `${base}/list/${parsed.id}`;

    try {
      const { data } = await axios.get(endpoint, {
        headers,
        timeout: 8000,
        validateStatus: () => true,
      });

      if (parsed.kind === "file" && data?.id) {
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

      if (parsed.kind === "list" && Array.isArray(data.files)) {
        const files = data.files.map((f) => ({
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
    } catch (err) {
      console.log(err.message);
    }
  }

  return null;
}

module.exports = {
  parsePixeldrainUrl,
  fetchViewerData,
};
