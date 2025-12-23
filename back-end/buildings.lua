local tiles = osm2pgsql.define_locator({ name = 'tiles' })
tiles:add_from_db("SELECT id, geom FROM cameras_tile")

local cameras = osm2pgsql.define_locator({ name = 'cameras' })
cameras:add_from_db("SELECT id, geom from cameras_camerafocus as cf where cf.scenario = 'worst' and cf.level = 'observation'")

local buildings = osm2pgsql.define_table({
    name = 'cameras_building',
    ids = {
        type = 'area',
        id_column = 'osm_id'
    },
    columns = {
        {
            column = 'geom',
            type = 'polygon',
            not_null = true,
            projection = 4326
        },
        {
            column = 'id',
            sql_type = 'serial',
            create_only = true
        },
        {
            column = 'tile',
            sql_type = 'varchar(15)',
            not_null = true
        }
    },
    indexes = {
        {
            column = 'id',
            name = 'cameras_building_pkey',
            method = 'btree',
            unique = true
        },
        {
            column = 'geom',
            method = 'gist'
        },
        {
            column = 'tile',
            name = 'cameras_building_tile_idx',
            method = 'btree'
        },
        {
            expression = 'tile varchar_pattern_ops',
            name = 'cameras_building_tile_idx_like',
            method = 'btree'
        }
    }
})

function osm2pgsql.process_way(object)
    if object.is_closed and object.tags.building and object.tags.building ~= 'roof' then
        if cameras:first_intersecting(object:as_polygon()) then
            buildings:insert({
                geom = object:as_polygon(),
                tile = tiles:first_intersecting(object:as_polygon())
            })
        end
    end
end

function osm2pgsql.process_relation(object)
    if object.tags.type == 'multipolygon' and object.tags.building then
        -- From the relation we get multipolygons...
        local mp = object:as_multipolygon()
        if cameras:first_intersecting(mp) then
            -- ...and split them into polygons which we insert into the table
            for geom in mp:geometries() do
                if object.tags.building ~= 'roof' then
                    buildings:insert({
                        geom = geom,
                        tile = tiles:first_intersecting(geom)
                    })
                end
            end
        end
    end
end
