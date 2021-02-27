import * as dotnev from "dotenv";
import { logger } from "./logger";
import { int, string } from "getenv";
import { basename } from "path";

const env = dotnev.config({ path: `.env.${process.env.NODE_ENV}` });

if (env.error)
  logger.error({
    label: `${basename(__filename)}`,
    message: `CONFIG ERROR! PATH=[.env.${process.env.NODE_ENV}]\nERROR: ${env.error}`,
  });

export const config = {
  app: {
    port: int("APP_PORT"),
  },
  psql: {
    host: string("DATABASE_HOST"),
    port: int("DATABASE_PORT"),
    username: string("DATABASE_USERNAME"),
    password: string("DATABASE_PASSWORD"),
    database: string("DATABASE_NAME"),
  },
  api: {
    token: string("RED_LIST_API_TOKEN"),
    url: string("RED_LIST_API_URL"),
  },
};
