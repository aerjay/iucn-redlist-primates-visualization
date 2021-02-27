import express, { json, urlencoded } from "express";
import cors from "cors";
import { getAllPrimates, updateAllPrimates } from "./model";
import { config } from "./config";
import { logger } from "./logger";
import { basename } from "path";

const app = express();
const fileName = basename(__filename);

// Third-party middleware
app.use(cors());

// Built-in middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.get("/primates", async (_req, res, next) => {
  const primatesData = await getAllPrimates().catch((error) => next(new Error(error)));
  return res.json(primatesData);
});

app.put("/primates", async (_req, res, next) => {
  const primatesData = await updateAllPrimates().catch((error) => next(new Error(error)));
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
