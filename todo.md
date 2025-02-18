- [ ] Add a legend enabling display of pictogram details : https://jsfiddle.net/TomazicM/rqu3nvLj/ (or a dedicated tab ?)
- [x] Enabling self-localisation on the map
- [ ] Search an address
- [x] OSM Attributions 
- [ ] Style for mobile / RWD
- [ ] Move front code to django app ?
- [ ] Remove "zoom min" frontend map popup ?

# Performances 

- [x] Handle results pagination support on frontend side
- [x] Handle tile requests on frontend side
- [ ] Set up server-side cache + invalidation mechanism during updates
- [ ] Nginx cache + gzip/brotli compression

# Transport route planner

- [ ] Routing with exclusion zones (search there ? https://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) https://skedgo.github.io/tripkit-leaflet/

# Enable contribution to OSM

## Create form

- [ ] Direction: draw arrow directly on the map, stop using the slider (similar to everydoor)
- [ ] Find better illustration images
- [ ] Adapt illustration images depending on previous responses (filter image with prior selection)

## Communication with OSM / Data display

- [ ] After an object creation, while it is not synchronized yet with backend, show a temporary pin on the map
- [ ] In no connection, keep data in the localStorage for future synchronization
- [ ] Showcase camera that need to be updated
- [ ] Enable camera "duplication" ?

# Field of vision calculation

## Redraw camera field of vision according to surrounding building walls

- [ ] Do not take into account "indoor" tagged cameras ? > Handled ? To check but should be ok. Check that filed of vision do not go out of buildings. 
- [x] Integrate multi-polygone n the database ("relation" osm) because it currently generated voids.
- [x] Take into account "roof" tag for some buildings to enable seeing throught them (tollgate example) https://wiki.openstreetmap.org/wiki/FR:Tag:building=roof?uselang=fr

# Improve field of view for cameras

- [ ] Do something with panning cameras
- [ ] Compute focus depending on the lens / type of camera.

- Wide-Angle Camera : Lens 2.8mm. Angle 110°. Distance 10m.
- Standard Camera : Lens 3.6mm. Angle 80°. Distance 15m.
- Narrow Camera : Lens 12mm. Angle 15-30°. Distance 50m.
- Some cameras can zoom ?

Ressources :

- https://www.jvsg.com/calculators/cctv-lens-calculator/
- https://www.jvsg.com/cctv-field-of-view-calculation/
- http://artpictures.club/autumn-2023.html
- https://github.com/berkbavas/FovCalculator

# Data

- [ ] Import all tags for "brut" object(to enable edition)
- [ ] Handle nodes containing several cameras (split by : or ;)

## Data import performance

- [x] How ot import a large amount of data ? Buffer when importing of all in databse ?
- [x] How to refresh data ? Frequency and process ? Clue : Use mechansim to generate a diff file with a command and apply it on the database ? https://docs.osmcode.org/pyosmium/latest/reference/Replication/#osmium.replication.ReplicationServer.collect_diffs

## Front-end performance

- [ ] Invalidate on-going requests before to deal with movement on the map
- [ ] Storage limit / Size of localStorage > store data via indexDb

## miscellaneous performance

- [ ] Optim front : Debounce : https://www.freecodecamp.org/news/javascript-debounce-example/
- [x] Optimize localstorage : do not store everything
- [x] When Z < 16 : don't send focus
- [x] Never send attributes except on click
- [x] Réduire la précision des geoms

( Back : d_within) > Non concluant

## Style

- [x] Improve dark mode map (https://github.com/openstreetmap/openstreetmap-website/issues/2332#issuecomment-867821340 // https://github.com/openstreetmap/openstreetmap-website/issues/2332#issuecomment-727266980)

## Create better configuration

- [x] Zoom initial de la carte et emplacement de départ
- [ ]
