CREATE UNLOGGED TABLE cameras_building_new (
    osm_id BIGINT NOT NULL,
    geom geometry(Polygon, 4326) NOT NULL,
    id SERIAL PRIMARY KEY,
    tile VARCHAR(15) NOT NULL
);
INSERT INTO cameras_building_new (id, osm_id, geom, tile)
SELECT 
    id, 
    osm_id, 
    geom, 
    geom_to_quadkey(geom, 14)
FROM cameras_building;

-- Reset the internal ID sequence
SELECT setval(
    pg_get_serial_sequence('public.cameras_building_new', 'id'), 
    COALESCE(MAX(id), 1)
) FROM cameras_building_new;

CREATE INDEX IF NOT EXISTS cameras_building_geom_idx ON cameras_building_new USING gist (geom);
CREATE UNIQUE INDEX IF NOT EXISTS cameras_building_pkey ON cameras_building_new USING btree (id);
CREATE INDEX IF NOT EXISTS cameras_building_tile_idx ON cameras_building_new USING btree (tile);
CREATE INDEX IF NOT EXISTS cameras_building_tile_idx_like ON cameras_building_new (tile varchar_pattern_ops);
ANALYZE cameras_building_new;

BEGIN;
DROP TABLE cameras_building;
ALTER TABLE cameras_building_new RENAME TO cameras_building;
COMMIT;

CREATE INDEX IF NOT EXISTS cameras_building_geom_idx ON cameras_building USING gist (geom);
CREATE UNIQUE INDEX IF NOT EXISTS cameras_building_pkey ON cameras_building USING btree (id);
CREATE INDEX IF NOT EXISTS cameras_building_tile_idx ON cameras_building USING btree (tile);
CREATE INDEX IF NOT EXISTS cameras_building_tile_idx_like ON cameras_building (tile varchar_pattern_ops);
ANALYZE cameras_building;
