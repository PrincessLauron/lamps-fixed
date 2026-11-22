const stateService = require("../services/stateService");

async function summary(req, res, next) {
  try {
    const { state } = stateService.load();
    if (!state) return res.status(409).json({ error: "No LAMS data is available yet." });
    const baseUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/analytics/summary`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: `Python analytics service returned ${response.status}: ${detail.slice(0, 300)}` });
    }
    res.json(await response.json());
  } catch (error) {
    if (error.name === "TimeoutError" || error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "Python analytics service is unavailable. Start the Python service and try again." });
    }
    next(error);
  }
}

module.exports = { summary };
