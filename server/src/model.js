import * as db from "./db";
import { extend } from "got";
import { config } from "./config";
import { logger } from "./logger";
import { basename } from "path";

const SPECIES_PER_PAGE = 10000;
const fileName = basename(__filename);
const animalsData = extend({
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

async function getAnimalsData(link) {
  try {
    await delay();
    const res = await animalsData.get(link);
    return res;
  } catch (error) {
    logger.error({
      label: `${fileName}`,
      message: `API ERROR! LINK:[${link}]\nERROR: ${error.name} ${error.message} ${error.stack}`,
    });
  }
}

async function getAllPrimatesNames() {
  let primatesNames = [];
  const { count } = await getAnimalsData(`speciescount`);
  const maxPageNum = Math.ceil(count / SPECIES_PER_PAGE);

  logger.debug({
    label: `${fileName}`,
    message: `Total # animals:[${count}]`,
  });
  logger.debug({
    label: `${fileName}`,
    message: `Total # pages:[${maxPageNum}]`,
  });

  for (let i = 0; i <= maxPageNum; i++) {
    const { result } = await getAnimalsData(`species/page/${i}`);
    const primatesName = result
      .filter((animal) => animal.order_name === "PRIMATES")
      .map((primate) => primate.scientific_name);
    primatesNames = primatesNames.concat(primatesName);
  }

  logger.debug({
    label: `${fileName}`,
    message: `Primates:\n[${primatesNames}]`,
  });

  return primatesNames;
}

async function getPrimatesData(names, link) {
  let primatesData = [];

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const data = await getAnimalsData(`${link}/${name}`);
    primatesData = primatesData.concat(data);
  }

  logger.debug({
    label: `${fileName}`,
    message: `Data from ${link}:\n[${primatesData}]`,
  });

  return primatesData;
}

async function populateSpeciesTable(names) {
  const primatesSpeciesData = await getPrimatesData(names, `species`);
  let addedPrimates = [];

  for (let i = 0; i < primatesSpeciesData.length; i++) {
    const primate = primatesSpeciesData[i].result[0];
    const citation = await getAnimalsData(`species/citation/${primate.scientific_name}`);
    const res = await db.populateSpeciesTable(
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

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating species table`,
  });

  return addedPrimates;
}

async function populateThreatsTable(names) {
  const primatesThreatsData = await getPrimatesData(names, `threats/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < primatesThreatsData.length; i++) {
    const threats = primatesThreatsData[i].result;
    const primateName = primatesThreatsData[i].name;

    for (let y = 0; y < threats.length; y++) {
      const threat = threats[y];
      const res = await db.populateThreatsTable(primateName, threat.code, threat.title, threat.timing, threat.score);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating threats table`,
  });

  return addedPrimates;
}

async function populateConservationMeasuresTable(names) {
  const primatesConservationData = await getPrimatesData(names, `measures/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < primatesConservationData.length; i++) {
    const measures = primatesConservationData[i].result;
    const primateName = primatesConservationData[i].name;

    for (let y = 0; y < measures.length; y++) {
      const measure = measures[y];
      const res = await db.populateConservationMeasuresTable(primateName, measure.code, measure.title);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating conservation measures table`,
  });

  return addedPrimates;
}

async function populateAssessmentTable(names) {
  const primatesAssessmentData = await getPrimatesData(names, `species/history/name`);
  let addedPrimates = [];

  for (let i = 0; i < primatesAssessmentData.length; i++) {
    const assessments = primatesAssessmentData[i].result;
    const primateName = primatesAssessmentData[i].name;

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

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating assessment table`,
  });

  return addedPrimates;
}

async function populateCountriesTable(names) {
  const primatesCountriesData = await getPrimatesData(names, `species/countries/name`);
  let addedPrimates = [];

  for (let i = 0; i < primatesCountriesData.length; i++) {
    const countries = primatesCountriesData[i].result;
    const primateName = primatesCountriesData[i].name;

    for (let y = 0; y < countries.length; y++) {
      const country = countries[y];
      const res = await db.populateCountriesTable(primateName, country.country, country.presence, country.origin);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating countries table`,
  });

  return addedPrimates;
}

async function populateHabitatsTable(names) {
  const primatesHabitatsData = await getPrimatesData(names, `habitats/species/name`);
  let addedPrimates = [];

  for (let i = 0; i < primatesHabitatsData.length; i++) {
    const habitats = primatesHabitatsData[i].result;
    const primateName = primatesHabitatsData[i].name;

    for (let y = 0; y < habitats.length; y++) {
      const habitat = habitats[y];
      const res = await db.populateHabitatsTable(primateName, habitat.code, habitat.habitat);
      addedPrimates = addedPrimates.concat(res);
    }
  }

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating habitats table`,
  });

  return addedPrimates;
}

async function populateDescriptionTable(names) {
  const primatesDescriptionsData = await getPrimatesData(names, `species/narrative`);
  let addedPrimates = [];

  for (let i = 0; i < primatesDescriptionsData.length; i++) {
    const description = primatesDescriptionsData[i].result[0];
    const primateName = primatesDescriptionsData[i].name;
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

  logger.debug({
    label: `${fileName}`,
    message: `Finished populating descriptions table`,
  });

  return addedPrimates;
}

// TODO: Determine if we need to send information from all tables in db
export async function getAllPrimates() {
  let allPrimates = await db.getAllPrimates();
  if (allPrimates.length <= 0) {
    const names = await getAllPrimatesNames();
    allPrimates = await populateSpeciesTable(names);
  }
  return allPrimates;
}

// TODO: Determine if we need to send information after populating any tables in db
export async function updateAllPrimates() {
  const names = await getAllPrimatesNames();
  const allPrimates = await populateSpeciesTable(names);
  return allPrimates;
}
