- [ ] Ajouter une légende qui permet d'afficher le détail des pictos : https://jsfiddle.net/TomazicM/rqu3nvLj/ (ou alors un onglet dédié ?)
- [x] Pouvoir se localiser sur la carte
- [ ] Rechercher une adresse
- [x] Attributions OSM
- [ ] Style mobile / RWD
- [ ] Déplacer code front dans app django ?

# Performances utilisation

- [x] Gérer support de la pagination des résultats côté front-end.
- [x] Gérer requêtes tuilées côté front-end
- [ ] Mettre en place cache côté serveur + mécanisme invalidation du cache lors des mises à jours
- [ ] Cache nginx + compression gzip/brotli

# Calculateur d'itinéraire

- [ ] Routing avec zones d'exlusion (chercher de ce côté ? https://www.liedman.net/leaflet-routing-machine/tutorials/alternative-routers/) https://skedgo.github.io/tripkit-leaflet/

# Pouvoir contribuer à OSM / StreetComplete

# Re-dessiner champ de vision caméra selon murs batiments

- [ ] Ne pas compter les caméras marquée comme "indoor" > Géré ? A Vérifier mais normalement c'est bon
- [x] Intégrer dans la base les multi-polygones ("relation" osm) car actuellement cela fait des vides
- [x] Prise en compte du tag "roof" pour certains batiments pour permettre de voir à travers (exemple péages) https://wiki.openstreetmap.org/wiki/FR:Tag:building=roof?uselang=fr

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

# Données

- [ ] Importer tous les tags des objets "brut" (pour permettre l'édition)
- [ ] Gérer le cas des noeuds qui comportent plusieurs caméras (séparées par : ou ;)

## Performances d'import des données

- [x] Comment importer un grand volume de données ? Buffer lors de l'import ou tout en base ?
- [x] Comment tenir à jour la donnée ? Fréquence et procédure ? Piste : Utiliser le mécanisme de diff pour générer un fichier de diff via une commande et l'appliquer sur la base ? https://docs.osmcode.org/pyosmium/latest/reference/Replication/#osmium.replication.ReplicationServer.collect_diffs

## Performances front-end

- [ ] Invalider les requêtes en cours avant pour gérer le cas de mouvements sur la carte
- [ ] Limite de stockage / Size of localStorage

## Divers performance

- Optim front : Debounce : https://www.freecodecamp.org/news/javascript-debounce-example/
- [x] Optimize localstorage : do not store everything
- [x] When Z < 16 : don't send focus
- [x] Never send attributes except on click
- [x] Réduire la précision des geoms

( Back : d_within) > Non concluant
