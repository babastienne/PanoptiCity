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
        }
    }
})

function osm2pgsql.process_way(object)
    if object.is_closed and object.tags.building and object.tags.building ~= 'roof' then
        buildings:insert({
            geom = object:as_polygon()
        })
    end
end

function osm2pgsql.process_relation(object)
    if object.tags.type == 'multipolygon' and object.tags.building then
        -- From the relation we get multipolygons...
        local mp = object:as_multipolygon()
        -- ...and split them into polygons which we insert into the table
        for geom in mp:geometries() do
            buildings:insert({
                geom = geom
            })
        end
    end
end
