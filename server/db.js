const Pool = require("pg").Pool;
const config = require("./config");
const logger = require("./logger");

const pool = new Pool({
  user: config.psql.username,
  password: config.psql.password,
  host: config.psql.host,
  port: config.psql.port,
  database: config.psql.database,
});

pool.on("error", (error, _client) => {
  logger.error(error.name + error.message + error.stack);
  process.exit(-1);
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug("executed query", { text, duration, rows: res.rowCount });
  return res;
}

// Double check
export async function getAllPrimates() {
  const res = await query("SELECT * FROM primates");
  return res.rows;
}

export async function populateTable(tableName, columns, rows, primaryKey) {
  const numOfCols = [...columns.keys()].map((i) => `\$${i + 1}`);
  const nonPrimaryCols = columns.filter((col) => col === primaryKey).map((col) => `${col}=EXCLUDED.${col}`);
  const strQuery = `INSERT INTO ${tableName}(${columns}) VALUES(${numOfCols})
                     ON CONFLICT (${primaryKey}) DO UPDATE SET ${nonPrimaryCols}
                     RETURNING *`;

  const res = await query(strQuery, rows);
  return res.rows;
}

export async function populatePrimatesTable(
  name,
  family,
  genus,
  category,
  common_name,
  published_year,
  assessment_date,
  criteria,
  population_trend,
  marine_system,
  freshwater_system,
  terrestrial_system,
  citation
) {
  const rows = [
    name,
    family,
    genus,
    category,
    common_name,
    published_year,
    assessment_date,
    criteria,
    population_trend,
    marine_system,
    freshwater_system,
    terrestrial_system,
    citation,
  ];
  const columns = [
    "name",
    "family",
    "genus",
    "category",
    "common_name",
    "published_year",
    "assessment_date",
    "criteria",
    "population_trend",
    "marine_system",
    "freshwater_system",
    "terrestrial_system",
    "citation",
  ];
  const res = await populateTable("primates", columns, rows, "name");
  return res;
}

export async function populateThreatsTable(name, code, title, timing, score) {
  const rows = [name, code, title, timing, score];
  const columns = ["name", "code", "title", "timing", "score"];
  const res = await populateTable("threats", columns, rows, "name");
  return res;
}

export async function populateConservationMeasuresTable(name, code, title) {
  const rows = [name, code, title];
  const columns = ["name", "code", "title"];
  const res = await populateTable("conservation_measures", columns, rows, "name");
  return res;
}

export async function populateAssessmentsTable(name, year, code, category) {
  const rows = [name, year, code, category];
  const columns = ["name", "year", "code", "category"];
  const res = await populateTable("assessments", columns, rows, "name");
  return res;
}

export async function populateCountriesTable(name, country, presence, origin) {
  const rows = [name, country, presence, origin];
  const columns = ["name", "country", "presence", "origin"];
  const res = await populateTable("countries", columns, rows, "name");
  return res;
}

export async function populateHabitatsTable(name, code, habitat) {
  const rows = [name, code, habitat];
  const columns = ["name", "code", "habitat"];
  const res = await populateTable("habitats", columns, rows, "name");
  return res;
}

export async function populateDescriptionsTable(
  name,
  taxonomicnotes,
  rationale,
  geographicrange,
  population,
  habitat,
  threats,
  conservationmeasures,
  usetrade
) {
  const rows = [
    name,
    taxonomicnotes,
    rationale,
    geographicrange,
    population,
    habitat,
    threats,
    conservationmeasures,
    usetrade,
  ];
  const columns = [
    "name",
    "taxonomicnotes",
    "rationale",
    "geographicrange",
    "population",
    "habitat",
    "threats",
    "conservationmeasures",
    "usetrade",
  ];
  const res = await populateTable("descriptions", columns, rows, "name");
  return res;
}
