const { getSips, saveSip, exportSips } = require("../controllers/investmentController");

function investmentRoutes(req, res) {
  const urlPath = req.url.split("?")[0];

  if (urlPath === "/api/investments/sip" && req.method === "GET") {
    getSips(req, res);
    return true;
  }

  if (urlPath === "/api/investments/sip" && req.method === "POST") {
    saveSip(req, res);
    return true;
  }

  if (urlPath === "/api/investments/export" && req.method === "GET") {
    exportSips(req, res);
    return true;
  }

  return false;
}

module.exports = { investmentRoutes };
