const express = require("express");
const app = express();
const cors = require("cors");
const data = require("./primatesData");
const config = require("./config");
const logger = require("./logger");

// Third-party middleware
app.use(cors());

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/primates", async (_req, res, next) => {
  const allPrimates = await data.getAllPrimates().catch((error) => next(new Error(error)));
  logger.debug("Sending all primates data to client.");
  return res.json(allPrimates);
});

app.put("/primates", async (_req, res, next) => {
  const updateAllPrimates = await data.updateAllPrimates().catch((error) => next(new Error(error)));
  logger.debug("Sending all updated primates data to client.");
  return res.json(updateAllPrimates);
});

app.get("*", function (req, _res, next) {
  const error = new Error(`${req.ip} tried to access ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Application-level middleware
app.use((error, _req, res, _next) => {
  error.statusCode = error.statusCode || 500;
  logger.error(error.name + error.statusCode + error.message + error.stack);
  return res.status(error.statusCode).json({ error: error.toString() });
});

// Start
app.listen(config.app.port, () => {
  logger.info(`server has started on port ${config.app.port}`);
});

// TEST
(async () => {
  try {
    logger.debug(config);
  } catch (error) {
    logger.error(error);
  }
})();
