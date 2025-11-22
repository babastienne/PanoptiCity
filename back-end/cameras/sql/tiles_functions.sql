-- To handle data, we store tiles and geom objects are associated to tiles
-- This way instead of querying all objects we only query those in the tiles covering the object
-- Very usefull for buildings in order to save comptation time for focus of cameras
-- We use the QuadTiles system. See https://wiki.openstreetmap.org/wiki/QuadTiles

-- Create a function to generate Quadkeys from Geometry
CREATE OR REPLACE FUNCTION geom_to_quadkey(geom geometry, zoom_level integer)
RETURNS text AS $$
DECLARE
  x float;
  y float;
  i integer;
  digit integer;
  quadkey text := '';
  mask integer;
BEGIN
  -- Project to Web Mercator (SRID 3857) if not already
  geom := ST_Centroid(ST_Transform(geom, 3857));
  
  -- Calculate tile coordinates (Standard Web Mercator logic)
  x := (ST_X(geom) + 20037508.34) / 40075016.68;
  y := 1.0 - ((ST_Y(geom) + 20037508.34) / 40075016.68);
  
  FOR i IN 1..zoom_level LOOP
    digit := 0;
    mask := 1 << (zoom_level - i);
    
    x := x * 2;
    y := y * 2;
    
    IF x >= 1 THEN
      digit := digit + 1;
      x := x - 1;
    END IF;
    
    IF y >= 1 THEN
      digit := digit + 2;
      y := y - 1;
    END IF;
    
    quadkey := quadkey || digit::text;
  END LOOP;
  
  RETURN quadkey;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- A generic function to generate the grid geometry from a Quadkey string
CREATE OR REPLACE FUNCTION quadkey_to_geom(qk text) 
RETURNS geometry AS $$
DECLARE
    zoom int := length(qk);
    x int := 0;
    y int := 0;
    i int;
    digit int;
BEGIN
    FOR i IN 1..zoom LOOP
        digit := substring(qk, i, 1)::int;
        x := x * 2 + (digit % 2);
        y := y * 2 + (digit / 2);
    END LOOP;
    -- ST_TileEnvelope(zoom, x, y) generates the square in WebMercator (SRID 3857)
    -- Transform the resulting geometry to WGS84 (SRID 4326)
    RETURN ST_Transform(ST_TileEnvelope(zoom, x, y), 4326);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE PROCEDURE generate_adaptive_tiles(max_rows int, min_z int, max_z int)
LANGUAGE plpgsql AS $$
DECLARE
    z int;
BEGIN
    -- Clear old tiles if exists
    TRUNCATE TABLE cameras_tile;

    -- Loop through zoom levels from bottom (Max Zoom) up to Min Zoom
    
    FOR z IN min_z..max_z LOOP
        RAISE NOTICE 'Processing Level %...', z;

        INSERT INTO cameras_tile (id, level, obj_count, geom)
        SELECT 
            substring(tile, 1, z) as qk, 
            z, 
            count(*),
            quadkey_to_geom(substring(tile, 1, z))
        FROM cameras_building
        WHERE 
            -- Optimization: Only look at areas not already covered by previous loops? 
            -- Actually, simpler approach:
            -- A tile is valid at Level Z if:
            -- 1. It has <= max_rows
            -- 2. OR it is at max_z (we force split to stop here)
            -- 3. AND its parent (Level Z-1) would have had > max_rows (otherwise parent would have covered it)
             1=1
        GROUP BY substring(tile, 1, z)
        HAVING 
            (count(*) <= max_rows OR z = max_z)
            -- Logic: If this tile is small enough, insert it.
            -- But we must ensure we don't insert a child if the parent was already small enough.
            -- To do that simply: We insert everything small enough, then delete children of existing tiles.
        ;
        
        COMMIT;
    END LOOP;

    -- CLEANUP: 
    -- If we inserted a Level 4 Tile (because it had 500 rows), 
    -- we might have also inserted its Level 5 children (which obviously also have < 500 rows).
    -- We want to keep the LARGEST tile that satisfies the condition.
    
    -- Delete any tile where a PARENT exists in the table
    DELETE FROM cameras_tile w1
    WHERE EXISTS (
        SELECT 1 FROM cameras_tile w2 
        WHERE w2.level < w1.level 
        AND w1.id LIKE w2.id || '%'
    );

    -- For each building, update its tile to the final tile covering it
    RAISE NOTICE 'Tiles updated. Updating building tiles...';
    UPDATE cameras_building cb
    SET tile = (
        SELECT ct.id
        FROM cameras_tile ct
        WHERE cb.tile LIKE ct.id || '%'
        ORDER BY ct.level DESC
        LIMIT 1
    );

END;
$$;

-- TODO: Do a comparison of performances for this other procedure implementation :

    -- -- Clear old tiles
    -- TRUNCATE TABLE cameras_tile;

    -- -- Build counts for all prefixes in a single aggregation (one pass)
    -- CREATE TEMP TABLE tmp_prefix_counts ON COMMIT DROP AS
    -- SELECT qk, level, count(*) AS cnt
    -- FROM (
    --   SELECT substring(cb.tile, 1, g) AS qk, g AS level
    --   FROM cameras_building cb
    --   CROSS JOIN generate_series(min_z, max_z) AS g
    --   WHERE length(cb.tile) >= g
    -- ) s
    -- GROUP BY qk, level
    -- HAVING (count(*) <= max_rows OR level = max_z);

    -- -- Insert candidate tiles (only those that satisfy the sizing condition)
    -- INSERT INTO cameras_tile (id, level, obj_count, geom)
    -- SELECT qk, level, cnt, quadkey_to_geom(qk)
    -- FROM tmp_prefix_counts;

    -- -- Remove any child tiles when a parent tile already exists (keep largest covering tiles)
    -- DELETE FROM cameras_tile w1
    -- WHERE EXISTS (
    --   SELECT 1 FROM cameras_tile w2
    --   WHERE w2.level < w1.level
    --     AND w1.id LIKE w2.id || '%'
    -- );

    -- -- Build mapping of each building -> best (deepest) tile using DISTINCT ON (fast single-shot)
    -- CREATE TEMP TABLE tmp_building_tile ON COMMIT DROP AS
    -- SELECT DISTINCT ON (cb.id)
    --   cb.id AS building_id,
    --   ct.id AS tile_id
    -- FROM cameras_building cb
    -- JOIN cameras_tile ct
    --   ON ct.id = substring(cb.tile, 1, ct.level)
    -- ORDER BY cb.id, ct.level DESC;

    -- -- Bulk update buildings using the mapping
    -- UPDATE cameras_building cb
    -- SET tile = t.tile_id
    -- FROM tmp_building_tile t
    -- WHERE cb.id = t.building_id;
