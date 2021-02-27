CREATE DATABASE primates;

CREATE TABLE species(
  name TEXT PRIMARY KEY,
  family TEXT NOT NULL,
  genus TEXT NOT NULL,
  category TEXT NOT NULL,
  common_name TEXT,
  published_year SMALLINT,
  assessment_date DATE,
  criteria TEXT,
  population_trend TEXT,
  marine_system BOOLEAN DEFAULT false,
  freshwater_system BOOLEAN DEFAULT false,
  terrestrial_system BOOLEAN DEFAULT false,
  citation TEXT,
  updated_at DATE NOT NULL DEFAULT NOW()
);

CREATE TABLE threats(
  name TEXT REFERENCES primates (name) ON UPDATE cascade,
  code TEXT,
  title TEXT,
  timing TEXT,
  score TEXT,
  updated_at DATE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (name, code)
);

CREATE TABLE conservation_measures(
  name TEXT REFERENCES primates (name) ON UPDATE cascade,
  code TEXT,
  title TEXT,
  updated_at DATE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (name, code)
);

CREATE TABLE assessments(
  name TEXT REFERENCES primates (name) ON UPDATE cascade,
  year SMALLINT,
  code TEXT,
  category TEXT,
  updated_at DATE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (name, code)
);

CREATE TABLE countries(
  name TEXT REFERENCES primates (name) ON UPDATE cascade,
  country TEXT,
  presence TEXT,
  origin TEXT,
  updated_at DATE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (name, country)
);

CREATE TABLE habitats(
  name TEXT REFERENCES primates (name) ON UPDATE cascade,
  code TEXT,
  habitat TEXT,
  updated_at DATE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (name, code)
);

CREATE TABLE descriptions(
  name TEXT PRIMARY KEY REFERENCES primates (name) ON UPDATE cascade,
  taxonomicnotes TEXT,
  rationale TEXT,
  geographicrange TEXT,
  population TEXT,
  habitat TEXT,
  threats TEXT,
  conservationmeasures TEXT,
  usetrade TEXT,
  updated_at DATE NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM   information_schema.tables
        WHERE  table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER set_timestamp
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE FUNCTION trigger_set_timestamp();',t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;