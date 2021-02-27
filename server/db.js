const Pool = require("pg").Pool;
const config = require("./config");
const logger = require("./logger");
const path = require("path");
const fileName = path.basename(__filename);

const pool = new Pool({
  user: config.psql.username,
  password: config.psql.password,
  host: config.psql.host,
  port: config.psql.port,
  database: config.psql.database,
});

pool.on("error", (error, _client) => {
  logger.error({
    label: `${fileName}`,
    message: `DATABASE ERROR!\nERROR: ${error.name} ${error.message} ${error.stack}`,
  });
});

module.exports = {
  async query(text, params) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug({
        label: `${fileName}`,
        message: `Database Query:[${text}] Params:[${params ?? "none"}] Duration:[${duration}] #Rows:[${res.rowCount}]`,
      });

      return res;
    } catch (error) {
      logger.error({
        label: `${fileName}`,
        message: `DATABASE ERROR! QUERY:[${text}] PARAMS:[${params ?? "none"}]\nERROR: ${error.name} ${error.message} ${
          error.stack
        }`,
      });
    }
  },

  // TODO: Determine if we need to send information from all tables in db
  async getAllPrimates() {
    const res = await this.query("SELECT * FROM species");
    return res.rows;
  },

  // TODO: Determine if we need to send information after populating any tables in db
  async populateTable(tableName, columns, rows, primaryKeys) {
    const numOfCols = [...columns.keys()].map((i) => `\$${i + 1}`);
    const nonPrimaryCols = columns.filter((col) => !primaryKeys.includes(col)).map((col) => `${col}=EXCLUDED.${col}`);
    const strQuery = `INSERT INTO ${tableName}(${columns}) VALUES(${numOfCols})
                     ON CONFLICT (${primaryKeys}) DO UPDATE SET ${nonPrimaryCols}
                     RETURNING *`;

    const res = await this.query(strQuery, rows);
    return res.rows;
  },

  async populateSpeciesTable(
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
    const res = await this.populateTable("species", columns, rows, ["name"]);
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
