- [ ] Ajouter une légende qui permet d'afficher le détail des pictos : https://jsfiddle.net/TomazicM/rqu3nvLj/ (ou alors un onglet dédié ?)
- [x] Pouvoir se localiser sur la carte
- [ ] Rechercher une adresse
- [x] Attributions OSM
- [ ] Style mobile / RWD

# Calculateur d'itinéraire

- [ ] Routing avec zones d'exlusion (chercher de ce côté ? https://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) https://skedgo.github.io/tripkit-leaflet/


# Pouvoir contribuer à OSM / StreetComplete



# Re-dessiner champ de vision caméra selon murs batiments 

way["building"="yes"]({{bbox}});
node(w)->.b;
node["surveillance:type"="camera"]({{bbox}})->.t;
node.b.t;
out;

// Pour récupérer tous les points qui sont des caméras et qui appartiennent à un batiment.
// Voir pour aussi récupérer les caméra taguées comme ayant un mur comme support ?

# Improve field of view for cameras

Compute focus depending on the lens / type of camera.
- Wide-Angle Camera : Lens 2.8mm. Angle 110°. Distance 10m.
- Standard Camera : Lens 3.6mm. Angle 80°. Distance 15m.
- Narrow Camera : Lens 12mm. Angle 15-30°. Distance 50m.
- Some cameras can zoom ?

Ressources : 
- https://www.jvsg.com/calculators/cctv-lens-calculator/
- https://www.jvsg.com/cctv-field-of-view-calculation/
- http://artpictures.club/autumn-2023.html
- https://github.com/berkbavas/FovCalculator

