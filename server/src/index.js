const express = require("express");
const app = express();
const cors = require("cors");
const model = require("./model");
const config = require("./config");
const logger = require("./logger");
const path = require("path");
const fileName = path.basename(__filename);

// Third-party middleware
app.use(cors());

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/primates", async (_req, res, next) => {
  const primatesData = await model.getAllPrimates().catch((error) => next(new Error(error)));
  return res.json(primatesData);
});

app.put("/primates", async (_req, res, next) => {
  const primatesData = await model.updateAllPrimates().catch((error) => next(new Error(error)));
  return res.json(primatesData);
});

app.get("*", function (req, _res, next) {
  const error = new Error(`${req.ip} tried to access ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Application-level middleware
app.use((error, _req, res, _next) => {
  error.statusCode = error.statusCode || 500;
  logger.error({
    label: `${fileName}`,
    message: `ERROR: ${error.name} ${error.statusCode} ${error.message} ${error.stack}`,
  });
  return res.status(error.statusCode).json({ error: error.toString() });
});

// Start
app.listen(config.app.port, () => {
  logger.info({ label: `${fileName}`, message: `Server has started on port ${config.app.port}` });
  logger.debug({ label: `${fileName}`, message: `\nConfig:\n${JSON.stringify(config, null, 1)}` });
});
