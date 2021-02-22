const dotenv = require("dotenv");
const logger = require("./logger");
const getenv = require("getenv");

let nodeEnv = process.env.NODE_ENV;
if (nodeEnv !== "production") {
  // Development will use .env, anything else will use .env.<NODE_ENV>
  if (nodeEnv === "development") nodeEnv = "";

  const path = `.env${nodeEnv ? `.${nodeEnv}` : ""}`;
  env = dotenv.config({ path });
  if (env.error) logger.error(`Loading config file from ${path} failed. ` + env.error);
}

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
