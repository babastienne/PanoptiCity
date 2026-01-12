export const TRANSLATIONS = {
  en: {
    titleApp: "PanoptiCity",
    teaserApp: "A life under surveillance",
    burgerMenu: "Toggle side menu",
    toggleTheme: "Toggle theme",
    mapLocateButton: "Display my location",
    // Login / Logout
    authAccountTitle: "Account",
    authHelpNeeded: "Help us improve the database!",
    authLoginMsg: "Sign in securely with your OpenStreetMap account or create one in seconds.",
    authPrivacyNotice:
      "We respect your privacy. The connection happens directly between your browser and OpenStreetMap. No information goes through our server.",
    authConnectedAs: "You are connected as",
    authGoToProfile: "My OSM account",
    loginBtn: "Login",
    loginBtnTitle: "Login with your OpenStreetMap account",
    registerBtn: "Create account",
    logoutBtn: "Logout",
    // Other interface
    iDontKnowButton: "I don't know...",
    confirmButton: "Confirm",
    cancelButton: "Cancel",
    link: "Link",
    address: "Address",
    name: "Name",
    by: "By",
    identifier: "Identifier",
    source: "Source",
    operator: "Operator",
    addCameraButton: "Add a new camera",
    completeCameraButton: "Complete missing information",
    completeCameraErrorSnackbar: "An error occured while trying to connect with OpenStreetMap",
    tagsDetails: "Tags details",
    simulateFOV: "Field of vision simulation",
    bestScenario: "Conservative",
    meanScenario: "Standard",
    worstScenario: "High",
    noFOV:
      "Camera is missing some information to be able to display field of view. Feel free to contribute to improve the database.",
    // Camera creation fields and form
    cameraLocationQuestion: "Move the map to choose the position of the camera",
    cameraLocationName: "Location",
    cameraSurveillanceQuestion: "What type of surveillance is it ?",
    cameraSurveillanceName: "Surveillance",
    cameraSurveillancePublic: "Public",
    cameraSurveillanceOutdoor: "Outdoor (privately owned camera)",
    cameraSurveillanceIndoor: "Indoor",
    cameraSurveillanceTypeName: "Surveillance type",
    cameraSurveillanceTypeCamera: "Camera",
    cameraSurveillanceTypeALPR: "Automatic License Plate Recognition (ALPR)",
    cameraTypeQuestion: "What is the camera type ?",
    cameraTypeName: "Camera type",
    cameraTypeDome: "Dome",
    cameraTypeFixed: "Fixed",
    cameraTypePanning: "Panning",
    cameraMountQuestion: "How is the camera mounted ?",
    cameraMountName: "Support",
    cameraMountWall: "Wall",
    cameraMountPole: "Pole",
    cameraMountCeiling: "Ceiling",
    cameraMountStreetLamp: "Street lamp",
    cameraMountTrafficSignal: "Traffic signal",
    cameraMountDoorbell: "Doorbell",
    cameraMountAtm: "ATM",
    cameraDirectionQuestion: "Indicate the direction where the camera is pointed",
    cameraDirectionName: "Camera direction",
    cameraZoneQuestion: "What is the surveillance zone ?",
    cameraZoneName: "Surveillance zone",
    cameraZoneTraffic: "Traffic (highway)",
    cameraZoneTown: "Town",
    cameraZoneEntrance: "Building entrance",
    cameraZoneShop: "Shop",
    cameraZoneBank: "Bank",
    cameraZoneBuilding: "Building",
    cameraZoneParking: "Parking",
    cameraZonePublicTransportPlatform: "Public transport platform",
    cameraHeightQuestion: "What is the height of the camera ?",
    cameraHeightName: "Camera height",
    distanceUnit: "meter",
    distanceUnitPlural: "meters",
    cameraAngleQuestion: "What is the tilt angle of the camera ?",
    cameraAngleName: "Angle d'inclinaison de la caméra",
    cameracheckDateName: "Last verification",
    cameraWebcamName: "Webcam",
    // Camera creation snackbar
    successCreationCameraMsg: "Camera sucessfully created. It will appears on the map in few minutes ...",
    successUpdateCameraMsg: "Camera sucessfully updated. Map will be updated soon. Thanks for your help.",
    // Welcome popup
    welcomeTitle: "Welcome to PanoptiCity",
    welcomeDesc:
      "This interactive map reveals the scale of mass surveillance worldwide. Each marker represents a known camera location and it's estimated field of view. The map displays a tiny fraction of the reality as the majority of cameras as not been yet contributed.",
    welcomeStep1: "Zoom and pan to explore surveillance coverage",
    welcomeStep2: "Toggle between different range scenarios",
    welcomeStep3: "Sign in to contribute camera locations to OpenStreetMap",
    welcomeButton: "Let's explore the map",
    // Search placeholder
    searchPlaceholder: "Search location",
    // Log in popup
    inviteTitle: "Log in to contribute",
    inviteDesc:
      "Want to contribute? 🗺️ That's awesome!\n PanoptiCity is synchronized with OpenStreetMap. Just sign in with your OpenStreetMap account or create one in 30 seconds to start mapping! 🚀🙌",
    // Tooltips for lateral buttons
    tooltipLayers: "Layers",
    tooltipScenario: "Configure camera range",
    tooltipLegend: "Legend",
    // Modal legend
    legendLevelTitle: "Surveillance zones",
    legendIntro:
      "The displayed areas are the field of view calculated from each camera's technical specifications. The colors represent the surveillance level.",
    levelIdTitle: "Identification zone",
    levelIdDesc: "High detail: Faces and license plates are clearly identifiable by any human or algorithm.",
    levelRecTitle: "Recognition zone",
    levelRecDesc:
      "Good detail: Anyone seing the footage can recognize you. Sometimes not enough details to automatize the recognition.",
    levelObsTitle: "Observation zone",
    levelObsDesc: "Low detail: General monitoring of movement and crowds, not to identify details.",
    legendMoreLink: "More about camera's field of view",
    legendMarkerTitle: "Map Markers",
    legendMarkerIntro: "Icons indicate the equipment type. Their color represents the data completeness:",
    legendStatusNormal: "Normal: All technical attributes are present.",
    legendStatusIncomplete:
      "Contribution needed: Missing data (direction, camera type, etc.). No field of view can be displayed.",
    typeFixed: "Fixed camera",
    typePanning: "Panning camera",
    typeDome: "Dome camera",
    typeTraffic: "Traffic camera (ALPR / Radar)",
    // Modal switch scenario
    scenarioIntro:
      "This website simulate multiple scenarios to render the field of view coverage based on a statistic analysis of 15,000+ real-world camera models. <br/>You can switch between each scenario.",
    scenarioLowTitle: "Very conservative",
    scenarioLowDesc: "Minimum estimate: 90% of cameras on the market have a better range than this.",
    scenarioMidTitle: "Standard",
    scenarioMidDesc: "Average estimate: represents the current market median.",
    scenarioHighTitle: "High",
    scenarioHighDesc: "Large estimate: 10% of existing equipments can see this far or beyond.",
    scenarioMethodologyLink: "How are these scenarios built?",
    scenarioWhyLink: "Why can't we see the exact coverage of each camera?",
    // Layers
    layerStandard: "Standard",
    layerHot: "Humanitarian",
    layerSatellite: "Satellite",
    // Static content available from menu
    menuContent: {
      // About
      menuAbout: "About this site",
      aboutP1:
        "This project's purpose is to help display information about CCTV, cameras, to easily map where they are, what they can see, and get data about their usage in cities. The website also gives you an easy way to contribute into the OpenStreetMap database if you want to add cameras when you see some that are not already known or improve the attributes of existing ones.",
      aboutP2:
        "PanoptiCity is a way to act and try to raise awareness about mass surveillance in all cities, to make people realize the amount of cameras around us that they usually not even see. In a time were artifical intelligence is generalizing, it is more than ever the moment to ask ourselves, is it really the model of society we want to build collectively?",
      // Why this name
      menuWhy: "What is a PanoptiCity?",
      whyP1:
        "PanoptiCity is the contraction of Panopticon and City.<br/> A Panopticon is a type of architecture, designed for prisons, that try to create a situation where every convict can be seen by a guardian at all time. It is often represented with a central watch tower into a circular building so that it can maximize the number of prisonners seen by a minimum number of guardians.",
      whyP2:
        "This old concept (invented centuries ago) is nowadays sometimes used as a metaphor for modern surveillance, the idea being enforced by the fact that CCTV control centers looks a lot like panopticons control towers.<br/> This name is therefore a wordplay to denounce a world where, because of global surveillance with CCTV, an entire city is now becoming a panopticon.<br/> You can learn more about panopticons on <a href='https://en.wikipedia.org/wiki/Panopticon'>wikipedia</a>.",
      // External links
      menuDocumentation: "Technical documentation",
      menuSourceCode: "See the source code",
      // License
      menuLegal: "Legal notice",
      legalAttributionsTitle: "Attributions",
      legalAttributionsP1:
        "This project exists because others were created before it. This site relies on multiple tools, ideas, and knowledge shared freely. Thank you to all those people!",
      legalAttributionsButton: "List of projects used",
      legalLicenseTitle: "License",
      legalLicenseP1:
        "This project is under a Cooperative Non-Violent Non-AI Public Software license. In brief, you are free to use, modify, redistribute, commercialize and do pretty much everything you want with this software as long as:",
      legalLicenseB1:
        "It is not used to exerce any violent action or repression or discrimination against any person. This software can’t therefore be used by any law-enforcement administration or company ; (Non-Violent clause)",
      legalLicenseB2:
        "If a commercial usage is made of this software, the financial gains are equaly redistributed among workers ; (Cooperative or Anticapitalist clause)",
      legalLicenseB3:
        "The content of this project can’t be used to train any artificial intelligence model ; (Non-AI clause)",
      legalLicenseButton: "Check the complete license",
      // FOV Computation method
      menuFOVComputation: "Field of view computation",
      methFovTitle: "What is the field of view?",
      methFovIntro:
        "The field of view is the area visible/covered by a CCTV. the field of view of every camera depends on a lot of variables. The most important are :",
      methFovL1: "The height of the camera",
      methFovL2: "The direction in which the camera is pointed",
      methFovL3: "The angle (tilt) of the camera that indicated if it is pointed toward the horizon or the floor",
      methFovL4:
        "The <a href='https://en.wikipedia.org/wiki/Image_resolution'>resolution</a> of the lens of the camera. This gives the number of pixels (e.g: 1920x1080 ~= 2MP ; 2556x1440 ~= 4MP ; 3840x2160 ~= 8MP ; etc.).",
      methFovL5:
        "The <a href='https://en.wikipedia.org/wiki/Camera_lens#Aperture_and_focal_length'>focal lens</a> of the lens. This mainly impact the angle of view and allow some cameras to be wide-angle (low focal) or on the opposite to focus on specific details (high focal). The focal is expressed in mm (e.g: 8mm ; 12mm ; 75mm).",
      methFovL6:
        "The <a href='https://en.wikipedia.org/wiki/Image_sensor_format'>sensor format</a> which is the ratio that indicates the size of the image (usually expressed as 1/2.5\" ; 2/3\" ; etc.).",
      methFovPPM:
        'The combination of those last 3 parameters allow to determine the quality of an image for a specific distance. The quality is expressed in PPM (pixels per meters) representing the pixel density. For example for a camera of 1920x1080 resolution with a 25mm lens and a 1/3" format, the quality of the image of a person standing 10 meters away from the camera will be 998ppm.',
      methFovMatching:
        "By taking those elements in consideration, we can compute the field of view of camera in which a person can be identified, recognized, detected. We use this matching table to establish what quality corresponds to what level :",
      thColor: "Color",
      thLevel: "Level of surveillance",
      thQuality: "Image quality",
      tr1Level:
        "<strong>Identification</strong>: At this level a person can easily be identified by any human or automated program.",
      tr2Level:
        "<strong>Recognition</strong>: Some specific details can be seen. Sometimes not enough details to automatize the recognition but a targeted person can still be recognized by a human eye. This quality level can be used for forensic review.",
      tr3Level:
        "<strong>Observation</strong>: It is possible to detect persons, objects and movements but not to identify details. Usually for large non targeted observation.",
      tr4Level:
        "<strong>Not usable</strong>: At this level we consider the camera unable to detect anything and do not display any field of view anymore.",
      methDhsQuote:
        "The level of surveillance and corresponding qualities are inspired from this <a href='https://www.dhs.gov/sites/default/files/publications/VQiPS_Digital-Video-Quality-HB_UPDATED-180117-508.pdf'>Department of Homeland Security document about VideoSurveillance Quality</a>.",
      methPtzNote:
        "It is important to note that a lot of modern cameras have the ability to zoom and move. We talk about dome or PTZ cameras (Pan-Tilt-Zoom). It means that for a lot of devices the variables (particularly the focal) can change depending if the camera is zoomed or not. Public cameras can generally alternate between wide angle and zoomed views depending on the operator or detection algorythm behind.",
      methOsmTitle: "The lack of data in OpenStreetMap",
      methOsmP1:
        "Obvisouly for each camera the information about resolution, focal and sensor format are not in the OpenStreetMap database. First because it would be a pain to contribute but mainly because it is not possible to get this information even when on field.",
      methOsmP2:
        "The other variables (height, angle and direction) are more easy to declare in OpenStreetMap. Panopticity encourage users to declare the height of a camera every time as well as the direction and the angle when it's a fixed or panning camera.",
      methOsmQuestion:
        "<strong>If sometimes there is no data, how can we determine what are the values that should be used in Panopticity then ?</strong>",
      methOsmDefaultIntro:
        "For basic information, we use default values if they are not tagged in OSM. If they are presents we use them. Default values are:",
      thField: "Field",
      thDefault: "Default Value",
      fldHeight: "Height",
      valHeight: "5 meters",
      fldAngle: "Angle",
      valAngle: "15°",
      fldDirection: "Direction",
      valDirection: "No default value. If a fixed camera does not have direction, no field of view is displayed",
      methStatsP1:
        "For the other fields, to make an estimation, we compiled in a file the technnical information of more than 15200 models of CCTV cameras from 143 differents brands. This gave us a global view of the current technical level of the CCTV market as it is in 2026.",
      methStatsP2:
        "With those numbers we created multiple scenarios to help you simulate fields of view depending on the camera.",
      methStatsButton: "Understand the scenarios",
      methFixedAngleTitle: "Angle of vision for fixed cameras",
      methFixedAngleIntro:
        'For fixed cameras, we decided to use an angle for the width of view of 85°. Once again this angle depends a lot of the camera used and espacially its type (fisheye cameras for example, bullet cameras, etc.). <br/>Why 85° ? Our calculations showed that the average focal for fixed cameras in the best scenario (= first decile) is 2.8mm. From far the mains format of lenses are 1/3" and 1/2.7" (which corresponds respectively to 4.8mm and 5.37mm). With thoses informations we can estimate the angle of view of the majority of cameras:',
      methFixedAngleF1: "Angle of view (in radian) = 2 * ArcTan(Camera format in mm / 2 * Camera focal in mm)",
      methFixedAngleF2: "Conversion of radian in degrees: Degree = Radian * 180 / Pi",
      methFixedAngleResultIntro: "The results are:",
      methFixedAngleR1: 'For 1/3" lenses: 81.2°',
      methFixedAngleR2: 'for 1/2.7" lenses: 87.5°',
      methFixedAngleConclusion:
        "Therefore, to simplify we choose to use for all directed cameras an angle of view of ~85°.",
      methTiltTitle: "Tilt angle for fixed cameras",
      methTiltIntro:
        "While dome and PTZ cameras can usually change their tilt angle, it is not the case for fixed cameras. Therefore this data should be taken in consideration when computing the field of view of fixed cameras.",
      methTiltCalc:
        "At the moment the tilt angle is used to apply a computing coefficient. We consider the angle <= 17° being the same as 0° to compensate the vertical angle of vision that is at least 35° and because when aiming for a subject at the same level as the camera we tend to tilt it by 17°.",
      methTiltFuture:
        "This behavior can be improved to stop applying a coefficient and compute the real limit of field of view based on the camera height.",
      methExampleIdTitle: "Example of an Identification image (320 PPM)",
      methExampleIdDesc: '<img src="/images/menu/resolution/example320ppm.jpg" class="modal-rich-img">',
      methExampleRecTitle: "Example of a Recognition image (160 PPM)",
      methExampleRecDesc: '<img src="/images/menu/resolution/example160ppm.jpg" class="modal-rich-img"> <p>160 PPM</p>',
      methExampleObsTitle: " Example of an Observation image (40 PPM)",
      methExampleObsDesc: '<img src="/images/menu/resolution/example40ppm.jpg" class="modal-rich-img"> <p>40 PPM</p>',
      methExampleNoneTitle: "Example of an image not usable (20 PPM)",
      methExampleNoneDesc: '<img src="/images/menu/resolution/example20ppm.jpg" class="modal-rich-img"> <p>20 PPM</p>',
      menuContact: "Contact",
      contactIntro:
        "Whether you found a bug, have a suggestion, or just want to reach out, here are the best ways to get in touch.",
      contactGithubTitle: "Bugs & Feature Requests",
      contactGithubDesc: "The preferred way to signal an issue or suggest a new feature is via the GitHub repository.",
      contactGithubBtn: "Open an Issue on GitHub",
      contactEmailTitle: "Direct inquiries",
      contactEmailDesc: "For other inquiries, you can reach the maintainer via email",
      contactEmailDisplay: "panopticity [.] translate101 [at] passinbox [.] com",
      contactPgpDesc:
        "We highly recommend using PGP encryption to ensure privacy. Download our <a href='/static/panopticity.asc'>public PGP key</a>.",
    },
  },
  fr: {
    titleApp: "PanoptiCity",
    teaserApp: "Une vi(ll)e sous surveillance",
    burgerMenu: "Menu latéral",
    toggleTheme: "Changer de thème",
    mapLocateButton: "Afficher ma localisation",
    // Login / Logout
    authAccountTitle: "Compte",
    authHelpNeeded: "Aidez-nous à enrichir la base de données !",
    authLoginMsg:
      "Connectez-vous en toute sécurité avec votre compte OpenStreetMap ou créez-en un en quelques secondes.",
    authPrivacyNotice:
      "Nous respectons votre vie privée. La connexion s'établit directement entre votre navigateur et OpenStreetMap. Aucune information ne transite par notre serveur.",
    authConnectedAs: "Vous êtes connecté en tant que",
    authGoToProfile: "Mon compte OSM",
    loginBtn: "Se connecter",
    loginBtnTitle: "Connectez-vous avec votre compte OpenStreetMap",
    registerBtn: "Créer un compte",
    logoutBtn: "Se déconnecter",
    // Other interface
    iDontKnowButton: "Je ne sais pas ...",
    confirmButton: "Valider",
    cancelButton: "Annuler",
    link: "Lien",
    address: "Adresse",
    name: "Nom",
    by: "Par",
    source: "Source",
    operator: "Opérateur",
    identifier: "Identifiant",
    addCameraButton: "Ajouter une nouvelle caméra",
    completeCameraButton: "Compléter les informations manquantes",
    completeCameraErrorSnackbar: "Une erreur est survenue en essayant de joindre OpenStreetMap",
    tagsDetails: "Détail des attributs",
    simulateFOV: "Simulation du champ de vision",
    bestScenario: "Prudent",
    meanScenario: "Standard",
    worstScenario: "Élevé",
    noFOV:
      "Il manque des informations sur cette caméra pour pouvoir afficher son champ de vision. N'hésitez pas à contribuer pour enrichir la base de données.",
    // Camera creation fields and form
    cameraLocationQuestion: "Déplacez la carte pour choisir la position de la caméra",
    cameraLocationName: "Localisation",
    cameraSurveillanceQuestion: "Quel est le type de surveillance ?",
    cameraSurveillanceName: "Surveillance",
    cameraSurveillancePublic: "Espace public",
    cameraSurveillanceOutdoor: "Extérieur (caméra privée)",
    cameraSurveillanceIndoor: "Intérieur",
    cameraSurveillanceTypeName: "Type de surveillance",
    cameraSurveillanceTypeCamera: "Caméra",
    cameraSurveillanceTypeALPR: "Lecteur de plaque d'immatriculation automatique",
    cameraTypeQuestion: "Quel est le type de caméra ?",
    cameraTypeName: "Type de caméra",
    cameraTypeDome: "Dome",
    cameraTypeFixed: "Fixe",
    cameraTypePanning: "Panoramique (motorisée)",
    cameraMountQuestion: "Comment est montée la caméra ?",
    cameraMountName: "Support",
    cameraMountWall: "Mur",
    cameraMountPole: "Poteau",
    cameraMountCeiling: "Plafond",
    cameraMountStreetLamp: "Lampadaire",
    cameraMountTrafficSignal: "Feu de signalisation",
    cameraMountDoorbell: "Interphone",
    cameraMountAtm: "Distributeur",
    cameraDirectionQuestion: "Indiquez la direction vers laquelle la caméra est dirigée",
    cameraDirectionName: "Orientation de la camera",
    cameraZoneQuestion: "Quelle est la zone surveillée ?",
    cameraZoneName: "Zone surveillée",
    cameraZoneTraffic: "Traffic",
    cameraZoneTown: "Ville",
    cameraZoneEntrance: "Entrée/porte",
    cameraZoneShop: "Magasin",
    cameraZoneBank: "Banque",
    cameraZoneBuilding: "Batiment",
    cameraZoneParking: "Parking",
    cameraZonePublicTransportPlatform: "Station de transport",
    cameraHeightQuestion: "Quelle est la hauteur de la caméra ?",
    cameraHeightName: "Hauteur de la caméra",
    distanceUnit: "mètre",
    distanceUnitPlural: "mètres",
    cameraAngleQuestion: "Quel est l'inclinaison de la caméra ?",
    cameraAngleName: "Angle d'inclinaison de la caméra",
    cameracheckDateName: "Dernière verification",
    cameraWebcamName: "Webcam",
    // Camera creation snackbar
    successCreationCameraMsg: "Camera créée. La carte sera mise à jour dans quelques minutes ...",
    successUpdateCameraMsg: "Camera mise à jour. La carte sera rafraichie bientôt. Merci pour votre aide.",
    // Welcome popup
    welcomeTitle: "Bienvenue sur PanoptiCity",
    welcomeDesc:
      "Cette carte interactive révèle l'ampleur de la surveillance de masse à l'échelle mondiale. Chaque marqueur représente l'emplacement connu d'une caméra et son champ de vision estimé. La carte n'affiche qu'une infime partie de la réalité, car la majorité des caméras n'ont pas encore été répertoriées.",
    welcomeStep1: "Zoomez et déplacez la carte pour parcourir les données.",
    welcomeStep2: "Basculez entre plusieurs scénarios de simulation des champs de vision",
    welcomeStep3: "Contribuez à OpenStreetMap en répertoriant de nouvelles caméras",
    welcomeButton: "Explorer la carte",
    // Search placeholder
    searchPlaceholder: "Rechercher un lieu...",
    // Log in popup
    inviteTitle: "Connectez-vous pour contribuer",
    inviteDesc:
      "Vous souhaitez participer à l'enrichissement de cette carte ? 🗺️ C'est génial !\n PanoptiCity est synchronisé avec OpenStreetMap. Il vous suffit de vous connecter avec votre compte OpenStreetMap ou d'en créer un en 30 secondes pour commencer à cartographier ! 🚀🙌",
    // Tooltips for lateral buttons
    tooltipLayers: "Style de carte",
    tooltipScenario: "Configurer la portée des caméras",
    tooltipLegend: "Légende",
    // Modal legend
    legendLevelTitle: "Zones de surveillance",
    legendIntro:
      "Les zones affichées correspondent au champ de vision calculé selon les caractéristiques techniques de chaque caméra. Les couleurs indiquent le niveau de surveillance.",
    levelIdTitle: "Zone d'identification",
    levelIdDesc:
      "Détails élevés : les visages et les plaques d'immatriculation sont clairement identifiables par un humain ou un algorithme.",
    levelRecTitle: "Zone de reconnaissance",
    levelRecDesc:
      "Détails satisfaisants : toute personne visionnant les images peut vous reconnaître. Parfois insuffisant pour automatiser la reconnaissance.",
    levelObsTitle: "Zone d'observation",
    levelObsDesc:
      "Faibles détails : surveillance générale des mouvements et des foules, ne permet pas d'identifier de détails précis.",
    legendMoreLink: "En savoir plus sur le champ de vision des caméras",
    legendMarkerTitle: "Pictogrammes",
    legendMarkerIntro: "Les icônes indiquent le type d'équipement. La couleur représente l'état des données :",
    legendStatusNormal: "Normal : Tous les attributs techniques sont renseignés.",
    legendStatusIncomplete:
      "Contribution requise : Données manquantes (direction, type de caméra, etc.). Le champ de vision ne peut pas être calculé.",
    typeFixed: "Caméra fixe",
    typePanning: "Caméra motorisée",
    typeDome: "Caméra dôme",
    typeTraffic: "Caméra routière (Lecteur de plaque / Radar)",
    // Modal switch scenario
    scenarioIntro:
      "Ce site modélise plusieurs scénarios pour afficher la couverture des champs de vision, basée sur une analyse statistique de plus de 15 000 modèles de caméras sur le marché. <br/>Vous pouvez basculer entre chaque scénario.",
    scenarioLowTitle: "Très prudent",
    scenarioLowDesc: "Estimation minimale : 90 % des caméras du marché ont une meilleure portée.",
    scenarioMidTitle: "Standard",
    scenarioMidDesc: "Estimation moyenne : représente la médiane du marché actuel.",
    scenarioHighTitle: "Élevé",
    scenarioHighDesc: "Estimation haute : 10 % des équipements existants peuvent voir aussi loin ou au-delà.",
    scenarioMethodologyLink: "Comment ces scénarios sont-ils construits ?",
    scenarioWhyLink: "Pourquoi ne peut-on pas voir la couverture exacte de chaque caméra ?",
    // Layers
    layerStandard: "Standard",
    layerHot: "Humanitaire",
    layerSatellite: "Satellite",
    // Static content available from menu
    menuContent: {
      // About
      menuAbout: "À propos de ce site",
      aboutP1:
        "L'objectif de ce projet est de simplifier l'affichage d'informations autour des caméras de surveillance, afin de les cartographier, savoir ce qu'elles peuvent voir, et avoir des informations à propos de leur usage en ville. Ce site internet offre également un moyen simple pour contribuer des informations dans la base de données d'OpenStreetMap si vous souhaitez ajouter des caméras quand vous en voyez qui ne sont pas sur la plateforme ou si vous souhaitez enrichir leurs attributs.",
      aboutP2:
        "PanoptiCity est une manière d'agir et d'essayer de sensibiliser à propos de la surveillance de masse dans toutes les villes, pour que les gens réalisent le volume de caméras autour d'eux qu'on ne voit plus. Dans une ère où l'intelligence artificielle se généralise, c'est plus que jamais le moment de nous demander, si c'est bien ce modèle de société que nous souhaitons construire collectivement ?",
      // Why this name
      menuWhy: "Qu'est-ce qu'une PanoptiCity ?",
      whyP1:
        "PanoptiCity est la contraction de Panoptique et Cité.<br/> Un Panoptique est un type d'architecture carcérale, qui essaye de créer une situation ou chaque condamné peut être vu par un guardien à chaque instant. Cette architecture est souvent représentée avec une tour de surveillance centrale dans un batiment circulaire, afin de maximiser le nombre de prisonniers pour un minimum de guardiens.",
      whyP2:
        "Ce vieux concept (inventé il y a plusieurs siècles) est de nos jours parfois utilisé comme une métaphore pour parler de surveillance moderne, l'idée étant renforcée par le fait que les centres de contrôle de caméras ressemblent fortement à des tours de contrôle panoptiques.<br/> Le nom de ce site est un jeu de mot pour dénoncer un monde où, du fait d'une surveillance vidéo globalisée, une ville complète peut devenir panoptique faisant des citoyen·ne·s des prisonniers modernes perpétuellement observés.<br/> Vous pouvez en apprendre plus sur le panoptique sur <a href='https://en.wikipedia.org/wiki/Panopticon'>wikipedia</a>.",
      // External links
      menuDocumentation: "Documentation technique",
      menuSourceCode: "Voir le code source",
      // License
      menuLegal: "Mentions légales",
      legalAttributionsTitle: "Attributions",
      legalAttributionsP1:
        "Ce projet existe parce que d'autres ont été créés avant. Ce site repose sur de multiples outils, idées et connaissances partagées librement. Merci à toutes ces personnes !",
      legalAttributionsButton: "Liste des projets utilisés",
      legalLicenseTitle: "License",
      legalLicenseP1:
        "Ce projet est sous license Publique Coopérative, Non Violente, Non-IA. En bref vous êtes libres d'utiliser, modifier, exploiter, redistribuer et commercialiser le site internet tant que :",
      legalLicenseB1:
        "Ce n'est pas utilisé pour exercer quelque action qui serait violente, répressive ou discriminante envers des personnes (clause Non Violente)",
      legalLicenseB2:
        "Si un usage commercial est effectué du logiciel, les gains financiers sont redistribués équitablements entre l'ensemble des travailleurs (clause Coopérative)",
      legalLicenseB3:
        "Le contenu de ce projet n'est pas utilisé pour entrainer un modèle d'intelligence artificielle (clause Non-IA)",
      legalLicenseButton: "Lire la license en intégralité",
      // FOV Computation method
      menuFOVComputation: "Calcul des champs de vision",
      methFovTitle: "Qu'est-ce que le champ de vision ?",
      methFovIntro:
        "Le champ de vision est la zone visible ou couverte par une caméra de vidéosurveillance. Le champ de vision de chaque caméra dépend de nombreuses variables. Les plus importantes sont :",
      methFovL1: "La hauteur de la caméra",
      methFovL2: "La direction vers laquelle la caméra est pointée",
      methFovL3:
        "L'angle (inclinaison / tilt) de la caméra qui indique si elle est pointée vers l'horizon ou vers le sol",
      methFovL4:
        "La <a href='https://en.wikipedia.org/wiki/Image_resolution'>résolution</a> de l'objectif de la caméra. Cela donne le nombre de pixels (ex : 1920x1080 ~= 2MP ; 2556x1440 ~= 4MP ; 3840x2160 ~= 8MP ; etc.).",
      methFovL5:
        "La <a href='https://en.wikipedia.org/wiki/Camera_lens#Aperture_and_focal_length'>distance focale</a> de l'objectif. Cela impacte principalement l'angle de vue et permet à certaines caméras d'être grand-angle (focale basse) ou au contraire de se concentrer sur des détails précis (focale haute). La focale est exprimée en mm (ex : 8mm ; 12mm ; 75mm).",
      methFovL6:
        "Le <a href='https://en.wikipedia.org/wiki/Image_sensor_format'>format du capteur</a> qui est le ratio indiquant la taille de l'image (généralement exprimé en 1/2.5\" ; 2/3\" ; etc.).",
      methFovPPM:
        "La combinaison de ces 3 derniers paramètres permet de déterminer la qualité d'une image pour une distance donnée. La qualité est exprimée en PPM (pixels par mètre) représentant la densité de pixels. Par exemple, pour une caméra de résolution 1920x1080 avec un objectif de 25 mm et un format 1/3\", la qualité de l'image d'une personne située à 10 mètres de la caméra sera de 998 ppm.",
      methFovMatching:
        "En prenant ces éléments en considération, nous pouvons calculer le champ de vision d'une caméra dans lequel une personne peut être identifiée, reconnue ou détectée. Nous utilisons ce tableau de correspondance pour établir quelle qualité correspond à quel niveau :",
      thColor: "Couleur",
      thLevel: "Niveau de surveillance",
      thQuality: "Qualité d'image",
      tr1Level:
        "<strong>Identification</strong> : À ce niveau, une personne peut facilement être identifiée par un humain ou un programme automatisé.",
      tr2Level:
        "<strong>Reconnaissance</strong> : Certains détails spécifiques sont visibles. Parfois pas assez de détails pour automatiser la reconnaissance, mais une personne ciblée peut toujours être reconnue par l'œil humain. Ce niveau de qualité peut être utilisé pour un examen médico-légal (forensic).",
      tr3Level:
        "<strong>Observation</strong> : Il est possible de détecter des personnes, des objets et des mouvements, mais pas d'identifier des détails. Généralement pour de l'observation large non ciblée.",
      tr4Level:
        "<strong>Inexploitable</strong> : À ce niveau, nous considérons que la caméra est incapable de détecter quoi que ce soit et n'affichons plus de champ de vision.",
      methDhsQuote:
        "Le niveau de surveillance et les qualités correspondantes sont inspirés de ce <a href='https://www.dhs.gov/sites/default/files/publications/VQiPS_Digital-Video-Quality-HB_UPDATED-180117-508.pdf'>document du Département de la Sécurité Intérieure des États-Unis (DHS) sur la qualité de la vidéosurveillance</a>.",
      methPtzNote:
        "Il est important de noter que de nombreuses caméras modernes ont la capacité de zoomer et de bouger. On parle de caméras dômes ou PTZ (Pan-Tilt-Zoom). Cela signifie que pour de nombreux appareils, les variables (particulièrement la focale) peuvent changer selon que la caméra zoom ou non. Les caméras publiques peuvent généralement alterner entre grand-angle et vues zoomées selon l'opérateur ou l'algorithme de détection sous-jacent.",
      methOsmTitle: "Le manque de données dans OpenStreetMap",
      methOsmP1:
        "Évidemment, pour chaque caméra, les informations de résolution, de focale et de format de capteur ne sont pas présentes dans la base de données OpenStreetMap. D'abord parce qu'il serait fastidieux de les contribuer, mais surtout parce qu'il est impossible d'obtenir ces informations, même sur le terrain.",
      methOsmP2:
        "Les autres variables (hauteur, inclinaison et direction) sont plus faciles à déclarer dans OpenStreetMap. PanoptiCity encourage les utilisateurs à déclarer systématiquement la hauteur d'une caméra, ainsi que sa direction et l'inclinaison lorsqu'il s'agit d'une caméra fixe ou panoramique (panning).",
      methOsmQuestion:
        "<strong>S'il n'y a parfois aucune donnée, comment déterminer les valeurs à utiliser dans PanoptiCity ?</strong>",
      methOsmDefaultIntro:
        "Pour les informations de base, nous utilisons des valeurs par défaut si elles ne sont pas renseignées dans OSM. Si elles sont présentes, nous les utilisons. Les valeurs par défaut sont :",
      thField: "Champ",
      thDefault: "Valeur par défaut",
      fldHeight: "Hauteur",
      valHeight: "5 mètres",
      fldAngle: "Inclinaison",
      valAngle: "15°",
      fldDirection: "Direction",
      valDirection:
        "Aucune valeur par défaut. Si une caméra fixe n'a pas de direction, aucun champ de vision n'est affiché",
      methStatsP1:
        "Pour les autres champs, afin de faire une estimation, nous avons compilé dans un fichier les informations techniques de plus de 15 200 modèles de caméras de vidéosurveillance provenant de 143 marques différentes. Cela nous a donné une vue d'ensemble du niveau technique actuel du marché de la vidéosurveillance en 2026.",
      methStatsP2:
        "Avec ces chiffres, nous avons créé plusieurs scénarios pour vous aider à simuler les champs de vision en fonction de la caméra.",
      methStatsButton: "Comprendre les scénarios",
      methFixedAngleTitle: "Angle de vision pour les caméras fixes",
      methFixedAngleIntro:
        "Pour les caméras fixes, nous avons décidé d'utiliser un angle de vue horizontal de 85°. Encore une fois, cet angle dépend beaucoup de la caméra utilisée et surtout de son type (caméras fisheye par exemple, caméras tubes/bullet, etc.). <br/>Pourquoi 85° ? Nos calculs ont montré que la focale moyenne des caméras fixes dans le meilleur scénario (= premier décile) est de 2,8 mm. De loin, les principaux formats de capteurs sont 1/3\" et 1/2.7\" (ce qui correspond respectivement à 4,8 mm et 5,37 mm). Avec ces informations, nous pouvons estimer l'angle de vue de la majorité des caméras :",
      methFixedAngleF1:
        "Angle de vue (en radian) = 2 * ArcTan(Format du capteur en mm / 2 * Focale de la caméra en mm)",
      methFixedAngleF2: "Conversion des radians en degrés : Degré = Radian * 180 / Pi",
      methFixedAngleResultIntro: "Les résultats sont :",
      methFixedAngleR1: 'Pour les objectifs 1/3" : 81,2°',
      methFixedAngleR2: 'Pour les objectifs 1/2.7" : 87,5°',
      methFixedAngleConclusion:
        "Par conséquent, pour simplifier, nous avons choisi d'utiliser pour toutes les caméras dirigées un angle de vue d'environ 85°.",
      methTiltTitle: "Angle d'inclinaison pour les caméras fixes",
      methTiltIntro:
        "Alors que les caméras dômes et PTZ peuvent généralement changer leur angle d'inclinaison (tilt), ce n'est pas le cas des caméras fixes. Par conséquent, cette donnée doit être prise en compte lors du calcul du champ de vision des caméras fixes.",
      methTiltCalc:
        "Actuellement, l'angle d'inclinaison est utilisé pour appliquer un coefficient de calcul. Nous considérons qu'un angle <= 17° est identique à 0° pour compenser l'angle de vision vertical qui est d'au moins 35°, et parce que lorsque l'on vise un sujet au même niveau que la caméra, on a tendance à l'incliner de 17°.",
      methTiltFuture:
        "Ce comportement peut être amélioré pour ne plus appliquer de coefficient et calculer la limite réelle du champ de vision en se basant sur la hauteur de la caméra.",
      methExampleIdTitle: "Exemple d'une image d'identification (320 PPM)",
      methExampleIdDesc: '<img src="/images/menu/resolution/example320ppm.jpg" class="modal-rich-img">',
      methExampleRecTitle: "Exemple d'une image de reconnaissance (160 PPM)",
      methExampleRecDesc: '<img src="/images/menu/resolution/example160ppm.jpg" class="modal-rich-img"> <p>160 PPM</p>',
      methExampleObsTitle: "Exemple d'une image d'observation (40 PPM)",
      methExampleObsDesc: '<img src="/images/menu/resolution/example40ppm.jpg" class="modal-rich-img"> <p>40 PPM</p>',
      methExampleNoneTitle: "Exemple d'une image inexploitable (20 PPM)",
      methExampleNoneDesc: '<img src="/images/menu/resolution/example20ppm.jpg" class="modal-rich-img"> <p>20 PPM</p>',
      menuContact: "Contact",
      contactIntro:
        "Que vous ayez trouvé un bug, une suggestion ou que vous souhaitiez simplement nous joindre, voici les meilleurs moyens de nous contacter.",
      contactGithubTitle: "Bugs et suggestions",
      contactGithubDesc:
        "Le moyen privilégié pour signaler un problème ou suggérer une nouvelle fonctionnalité est de passer par le dépôt GitHub.",
      contactGithubBtn: "Ouvrir un ticket sur GitHub",
      contactEmailTitle: "Demandes directes",
      contactEmailDesc: "Pour toute autre demande, vous pouvez contacter le mainteneur par e-mail.",
      contactEmailDisplay: "panopticity [.] translate101 [at] passinbox [.] com",
      contactPgpDesc:
        "Nous recommandons vivement l'utilisation du chiffrement PGP pour garantir la confidentialité. Téléchargez notre <a href='/static/panopticity.asc'>clé publique PGP</a>.",
    },
  },
};
