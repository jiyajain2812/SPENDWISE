const http = require("http");
const fs = require("fs");
const path = require("path");
const { expenseRoutes } = require("./routes/expenseRoutes");
const { investmentRoutes } = require("./routes/investmentRoutes");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css":  "text/css; charset=UTF-8",
  ".js":   "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico":  "image/x-icon",
};

const VIEW_MAP = {
  "/": "login.html",
  "/login": "login.html",
  "/login.html": "login.html",
  "/views/login.html": "login.html",
  "/dashboard": "dashboard.html",
  "/dashboard.html": "dashboard.html",
  "/views/dashboard.html": "dashboard.html",
  "/academy": "academy.html",
  "/academy.html": "academy.html",
  "/views/academy.html": "academy.html",
  "/money-management": "money-management.html",
  "/money-management.html": "money-management.html",
  "/views/money-management.html": "money-management.html",
  "/money-upi": "money-upi.html",
  "/money-upi.html": "money-upi.html",
  "/views/money-upi.html": "money-upi.html",
};

function serveFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return false;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function handleStatic(req, res) {
  const urlPath = req.url.split("?")[0].replace(/\\/g, "/");

  // 1. Direct view route matches
  if (VIEW_MAP[urlPath]) {
    const targetFile = path.join(__dirname, "views", VIEW_MAP[urlPath]);
    return serveFile(res, targetFile);
  }

  // 2. Views folder requests (/views/xyz.html)
  if (urlPath.startsWith("/views/")) {
    const filename = urlPath.replace("/views/", "");
    const viewPath = path.join(__dirname, "views", filename);
    if (serveFile(res, viewPath)) return true;
  }

  // 3. Public asset requests (/public/...)
  if (urlPath.startsWith("/public/")) {
    const rel = urlPath.replace("/public/", "");
    const publicPath = path.join(__dirname, "public", rel);
    if (serveFile(res, publicPath)) return true;
  }

  // 4. Relative paths fallback (/css/..., /js/..., /images/...)
  if (urlPath.startsWith("/css/") || urlPath.startsWith("/js/") || urlPath.startsWith("/images/")) {
    const fallbackPath = path.join(__dirname, "public", urlPath.replace(/^\//, ""));
    if (serveFile(res, fallbackPath)) return true;
  }

  // 5. Root file fallback (e.g. index.html)
  const rootPath = path.join(__dirname, urlPath.replace(/^[/\\]+/, ""));
  if (rootPath.startsWith(__dirname) && serveFile(res, rootPath)) {
    return true;
  }

  return false;
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // 1. API routes (Expenses & Investments)
  if (expenseRoutes(req, res) !== false) return;
  if (investmentRoutes(req, res) !== false) return;

  // 2. Static files & Views
  if (req.method === "GET" && handleStatic(req, res)) return;

  // 3. 404 fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, async () => {
  console.log(`SpendWise server running at http://localhost:${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    // Error logged in connectDB
  }
});
