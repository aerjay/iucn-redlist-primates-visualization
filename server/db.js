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

module.exports = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug("executed query: " + text + " duration: " + duration + " row count: " + res.rowCount);
    return res;
  },

  // Double check
  async getAllPrimates() {
    const res = await this.query("SELECT * FROM primates");
    return res.rows;
  },

  async populateTable(tableName, columns, rows, primaryKeys) {
    const numOfCols = [...columns.keys()].map((i) => `\$${i + 1}`);
    const nonPrimaryCols = columns.filter((col) => !primaryKeys.includes(col)).map((col) => `${col}=EXCLUDED.${col}`);
    const strQuery = `INSERT INTO ${tableName}(${columns}) VALUES(${numOfCols})
                     ON CONFLICT (${primaryKeys}) DO UPDATE SET ${nonPrimaryCols}
                     RETURNING *`;

    const res = await this.query(strQuery, rows);
    return res.rows;
  },

  async populatePrimatesTable(
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
    const res = await this.populateTable("primates", columns, rows, ["name"]);
    return res;
  },

  async populateThreatsTable(name, code, title, timing, score) {
    const rows = [name, code, title, timing, score];
    const columns = ["name", "code", "title", "timing", "score"];
    const res = await this.populateTable("threats", columns, rows, ["name", "code"]);
    return res;
  },

  async populateConservationMeasuresTable(name, code, title) {
    const rows = [name, code, title];
    const columns = ["name", "code", "title"];
    const res = await this.populateTable("conservation_measures", columns, rows, ["name", "code"]);
    return res;
  },

  async populateAssessmentsTable(name, year, code, category) {
    const rows = [name, year, code, category];
    const columns = ["name", "year", "code", "category"];
    const res = await this.populateTable("assessments", columns, rows, ["name", "code"]);
    return res;
  },

  async populateCountriesTable(name, country, presence, origin) {
    const rows = [name, country, presence, origin];
    const columns = ["name", "country", "presence", "origin"];
    const res = await this.populateTable("countries", columns, rows, ["name", "country"]);
    return res;
  },

  async populateHabitatsTable(name, code, habitat) {
    const rows = [name, code, habitat];
    const columns = ["name", "code", "habitat"];
    const res = await this.populateTable("habitats", columns, rows, ["name", "code"]);
    return res;
  },

  async populateDescriptionsTable(
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
    const res = await this.populateTable("descriptions", columns, rows, ["name"]);
    return res;
  },
};
