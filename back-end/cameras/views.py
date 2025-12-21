# views.py
from django.db import connection
from django.http import Http404, HttpResponse


def fov_tile_view(request, z, x, y, scenario):
    if z not in [14, 15, 16]:
        raise Http404(
            "Only tiles for zoom 14 to 16 are served. Use over-zooming on client.")

    with connection.cursor() as cursor:
        cursor.execute("""
            WITH 
            -- 1. Define the tile boundaries
            bounds AS (
                SELECT ST_TileEnvelope(%s, %s, %s) AS geom_3857
            ),
            -- 2. Grab and union all FOV of the same type in this tile
            unioned AS (
                SELECT ST_Union(geom) as geom, level
                FROM cameras_camerafocus, bounds
                WHERE scenario = %s 
                  AND with_intersection = true
                  AND geom && ST_Transform(bounds.geom_3857, 4326)
                GROUP BY level
            ),
            -- 3. Create difference of levels so they don't overlap
            final_geoms AS (
                -- Level 1: Identification - remains as is
                SELECT geom, 1 as type FROM unioned WHERE level = 'identification'
                UNION ALL
                -- Level 2: Recognition minus Identification
                SELECT ST_MakeValid(ST_Difference(u2.geom, COALESCE((SELECT geom FROM unioned WHERE level = 'identification'), 'SRID=4326;POLYGON EMPTY'::geometry))) as geom, 2 as type
                FROM unioned u2 WHERE level = 'recognition'
                UNION ALL
                -- Level 3: Observation minus Recognition
                SELECT ST_MakeValid(ST_Difference(u3.geom, COALESCE((SELECT ST_Union(geom) FROM unioned WHERE level IN ('recognition', 'identification')), 'SRID=4326;POLYGON EMPTY'::geometry))) as geom, 3 as type
                FROM unioned u3 WHERE level = 'observation'
            ),
            -- 4. Convert to MVT coordinate system
            mvt_features AS (
                SELECT ST_AsMVTGeom(ST_Transform(f.geom, 3857), b.geom_3857) as geom, f.type
                FROM final_geoms f, bounds b
                WHERE f.geom IS NOT NULL AND NOT ST_IsEmpty(f.geom)
            )
            -- 5. Package as MVT
            SELECT ST_AsMVT(mvt_features.*, 'fov_layer') FROM mvt_features;
        """, [z, x, y, scenario])

        row = cursor.fetchone()
        if not row or not row[0]:
            return HttpResponse(status=204)  # Empty tile

        return HttpResponse(row[0], content_type="application/vnd.mapbox-vector-tile")
