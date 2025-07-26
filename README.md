# 🚀 Pixeldrain Link Bypasser

A simple tool to bypass Pixeldrain file and folder links and extract direct download URLs with metadata. Built using **Node.js**, **Express**, **TailwindCSS**, and deployed serverlessly using **Vercel**.

---

## 🚀 Features

* 🔗 Accepts one or multiple Pixeldrain file or folder links
* 📄 Parses `window.viewer_data` to extract file metadata
* 📦 Supports both single files and folder listings
* 🌚 Dark mode toggle
* ✨ Loading spinner and user feedback
* 📥 Clean UI with direct download buttons and file info
* ☁️ Serverless-ready with Vercel

---

## 💡 Tech Stack

* **Frontend**: HTML, TailwindCSS, Lucide Icons
* **Backend**: Node.js, Express, Axios, Cheerio
* **Deployment**: Vercel (Serverless)

---

## 💪 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pixeldrain-bypasser.git
cd pixeldrain-bypasser
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Locally

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploying to Vercel

This app is built serverless-ready using `serverless-http`. Here's the `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/app.js"
    }
  ]
}
```

Ensure `index.html` is placed inside `src/views/`.

---

## 📂 Project Structure

```
.
├── src/
│   ├── app.js              # Express app with serverless export
│   ├── dev.js              # Development entry point
│   ├── utils/
│   │   └── pixeldrainUtils.js
│   └── views/
│       └── index.html      # Static HTML UI
├── vercel.json
├── package.json
└── README.md
```

---

## 📊 Utility Functions

In `src/utils/pixeldrainUtils.js`:

* `isValidPixeldrainUrl(url)` – Validates input URLs
* `extractViewerData(html)` – Parses and extracts viewer data JSON

---

## 🛡️ Rate Limiting

Using `express-rate-limit`:

* Max 100 requests per 15 minutes per IP
* Prevents abuse and protects API limits

---

## 📃 License

MIT License — Free to use and modify.


