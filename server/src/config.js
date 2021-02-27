const dotenv = require("dotenv");
const logger = require("./logger");
const getenv = require("getenv");
const path = require("path");

const env = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

if (env.error)
  logger.error({
    label: `${path.basename(__filename)}`,
    message: `CONFIG ERROR! PATH=[.env.${process.env.NODE_ENV}]\nERROR: ${env.error}`,
  });

const config = {
  app: {
    port: getenv.int("APP_PORT"),
  },
  psql: {
    host: getenv("DATABASE_HOST"),
    port: getenv.int("DATABASE_PORT"),
    username: getenv("DATABASE_USERNAME"),
    password: getenv("DATABASE_PASSWORD"),
    database: getenv("DATABASE_NAME"),
  },
  api: {
    token: getenv("RED_LIST_API_TOKEN"),
    url: getenv("RED_LIST_API_URL"),
  },
};

module.exports = config;
