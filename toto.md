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