const db = require("./db");
const got = require("got");
const config = require("./config");
const logger = require("./logger");
const SPECIES_PER_PAGE = 10000;

const animalsData = got.extend({
  prefixUrl: config.api.url,
  responseType: "json",
  resolveBodyOnly: true,
  searchParams: {
    token: config.api.token,
  },
});

function delay() {
  return new Promise(function (resolve, _reject) {
    setTimeout(function () {
      resolve();
    }, 1500);
  });
}

async function getAllPrimatesName() {
  let allPrimatesName = [];
  const { count } = await animalsData.get(`speciescount`);
  const maxPageNum = Math.ceil(count / SPECIES_PER_PAGE);
  logger.debug(`Total # of animals: ${count}`);
  logger.debug(`Total # of pages to iterate: ${maxPageNum}`);

  for (let i = 0; i <= maxPageNum; i++) {
    await delay();
    const { result } = await animalsData.get(`species/page/${i}`);
    const primatesName = result
      .filter((animal) => animal.order_name === "PRIMATES")
      .map((primate) => primate.scientific_name);
    allPrimatesName = allPrimatesName.concat(primatesName);
  }

  logger.debug(`Primates name: ${allPrimatesName.toString()}`);
  return allPrimatesName;
}

async function getAllSpeciesData(names, link) {
  let allPrimatesData = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    await delay();
    const result = await animalsData.get(`${link}/${name}`);
    allPrimatesData = allPrimatesData.concat(result);
  }

  logger.debug(`Primates data: ${JSON.stringify(allPrimatesData)}`);
  return allPrimatesData;
}

async function populatePrimatesTable(names) {
  const speciesData = await getAllSpeciesData(names, `species`);
  let addedPrimates = [];

  for (let i = 0; i < speciesData.length; i++) {
    const primate = speciesData[i].result[0];
    await delay();
    const citation = await animalsData.get(`species/citation/${primate.scientific_name}`);
    const res = await db.populatePrimatesTable(
      primate.scientific_name,
      primate.family,
      primate.genus,
      primate.category,
      primate.main_common_name,
      parseInt(primate.published_year),
      primate.assessment_date,
      primate.criteria,
      primate.population_trend,
      primate.marine_system,
      primate.freshwater_system,
      primate.terrestrial_system,
      citation.result.citation
    );
    addedPrimates = addedPrimates.concat(res);
  }

  return addedPrimates;
}

async function populateThreatsTable(names) {
  const allPrimates = await getAllSpeciesData(names, `threats/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const threats = allPrimates[i].result;
    const primateName = allPrimates[i].name;

    for (let y = 0; y < threats.length; y++) {
      const threat = threats[y];
      const res = await db.populateThreatsTable(primateName, threat.code, threat.title, threat.timing, threat.score);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  return addedPrimates;
}

async function populateConservationMeasuresTable(names) {
  const allPrimates = await getAllSpeciesData(names, `measures/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const measures = allPrimates[i].result;
    const primateName = allPrimates[i].name;

    for (let y = 0; y < measures.length; y++) {
      const measure = measures[y];
      const res = await db.populateConservationMeasuresTable(primateName, measure.code, measure.title);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  return addedPrimates;
}

async function populateAssessmentTable(names) {
  const allPrimates = await getAllSpeciesData(names, `species/history/name`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const assessments = allPrimates[i].result;
    const primateName = allPrimates[i].name;

    for (let y = 0; y < assessments.length; y++) {
      const assessment = assessments[y];
      const res = await db.populateAssessmentsTable(
        primateName,
        parseInt(assessment.year),
        assessment.code,
        assessment.category
      );
      addedPrimates = addedPrimates.concat(res);
    }
  }

  return addedPrimates;
}

async function populateCountriesTable(names) {
  const allPrimates = await getAllSpeciesData(names, `species/countries/name`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const countries = allPrimates[i].result;
    const primateName = allPrimates[i].name;

    for (let y = 0; y < countries.length; y++) {
      const country = countries[y];
      const res = await db.populateCountriesTable(primateName, country.country, country.presence, country.origin);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  return addedPrimates;
}

async function populateHabitatsTable(names) {
  const allPrimates = await getAllSpeciesData(names, `habitats/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const habitats = allPrimates[i].result;
    const primateName = allPrimates[i].name;

    for (let y = 0; y < habitats.length; y++) {
      const habitat = habitats[y];
      const res = await db.populateHabitatsTable(primateName, habitat.code, habitat.habitat);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  return addedPrimates;
}

async function populateDescriptionTable(names) {
  const allPrimates = await getAllSpeciesData(names, `species/narrative`);
  let addedPrimates = [];

  for (let i = 0; i < allPrimates.length; i++) {
    const description = allPrimates[i].result[0];
    const primateName = allPrimates[i].name;
    const res = await db.populateDescriptionsTable(
      primateName,
      description.taxonomicnotes,
      description.rationale,
      description.geographicrange,
      description.population,
      description.habitat,
      description.threats,
      description.conservationmeasures,
      description.usetrade
    );
    addedPrimates = addedPrimates.concat(res);
  }

  return addedPrimates;
}

module.exports = {
  async getAllPrimates() {
    let allPrimates = await db.getAllPrimates();
    if (allPrimates.length <= 0) {
      const names = await getAllPrimatesName();
      allPrimates = await populatePrimatesTable(names);
    }
    return allPrimates;
  },

  async updateAllPrimates() {
    const names = await getAllPrimatesName();
    const allPrimates = await populatePrimatesTable(names);
    return allPrimates;
  },
};
