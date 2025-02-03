- [ ] Ajouter une légende qui permet d'afficher le détail des pictos : https://jsfiddle.net/TomazicM/rqu3nvLj/ (ou alors un onglet dédié ?)
- [x] Pouvoir se localiser sur la carte
- [ ] Rechercher une adresse
- [x] Attributions OSM
- [ ] Style mobile / RWD
- [x] Gérer support de la pagination des résultats côté front-end.
- [x] Gérer requêtes tuilées côté front-end

# Calculateur d'itinéraire

- [ ] Routing avec zones d'exlusion (chercher de ce côté ? https://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) https://skedgo.github.io/tripkit-leaflet/


# Pouvoir contribuer à OSM / StreetComplete



# Re-dessiner champ de vision caméra selon murs batiments 
- [ ] Ne pas compter les caméras marquée comme "indoor" > Géré ? A Vérifier mais normalement c'est bon
- [ ] Intégrer dans la base les multi-polygones ("relation" osm) car actuellement cela fait des vides
- [x] Prise en compte du tag "roof" pour certains batiments pour permettre de voir à travers (exemple péages) https://wiki.openstreetmap.org/wiki/FR:Tag:building=roof?uselang=fr


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

# Performances d'import des données ??!!

