-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installations
SELECT 'PostGIS version: ' || PostGIS_Version();
SELECT 'pgvector installed successfully';
