export const TRANSLATIONS = {
  en: {
    titleApp: "PanoptiCity",
    appDescription:
      "Explore a real-time map of surveillance cameras (CCTV) and their field of view. Contribute data to OpenStreetMap through a simplified interface.",
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
    // Layers
    layerStandard: "Standard",
    layerHot: "Humanitarian",
    layerSatellite: "Satellite",
    // Static content available from menu
    menuContent: {
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
      menuScenarioComputation: "Scenarios computation",
      scenTitle: "Calculation methods for scenarios",
      scenIntro:
        "To make an estimation of the potential value for missing fields needed to compute field of view (resolution, format, focal), we compiled in a file the technical information of more than 15,200 models of CCTV cameras from 143 different brands. This gave us a global view of the current technical level of the CCTV market as it is in 2025. Keep in mind that new camera models are released every week so depending when you read this lines the numbers can be differents today.",
      scenDataLinks:
        "The numbers used can be seen in the <a href='/static/AllCamerasList.ods'>AllCameraList.ods</a> file (or in JSON format in <a href='/static/camerasList.json'>camerasList.json</a>).",
      scenModelsIntro:
        "With those numbers, we sorted every variable and were able to determine statistics about quality of cameras. Depending of the camera type (fixed or dome/PTZ cameras), we created three models to help us determine the quality of cameras (and therefore their field of view):",

      thScen: "Scenario",
      thDesc: "Description",
      thFixedVal: "Fixed cameras",
      thDomeVal: "Dome/PTZ cameras",
      trBestTitle: "Conservative",
      trBestDesc: "First decile: 90% of cameras on the market have better quality than this.",
      trMeanTitle: "Standard",
      trMeanDesc: "Default scenario: The market median.",
      trWorstTitle: "High",
      trWorstDesc: "Last decile: Only the top 10% of the market can reach this quality.",

      scenImprovement:
        "<strong>How it could be improved:</strong> One good way to improve this models would be to create a correlation between every camera model and their sales numbers to ponderate the weight of each camera in the model computation. However thoses numbers can't be easily found.",

      statsTitle: "Statistic analysis of technical data",
      statsIntro:
        "The following sections compile some graphical analysis that display trends of repartition for multiple technical features depending of cameras category (fixed or dome/ptz).",
      statsLimitsTitle: "Limits of the dataset",
      statsLimits:
        "Some specific cameras as been removed from dataset analysis, especially thermal or industrial cameras. Eyeball or fisheye cameras were categorized as Dome cameras for this analysis. This is a known limitation that could be improved by a better sub-type categorization in the future.",

      statsChartsTitle: "View statistical charts",
      chartFormatTitle: "Format lens repartition",
      chartFormatContent:
        '<img src="/images/stats/data-format.png" class="modal-rich-img"><img src="/images/stats/data-format-log.png" class="modal-rich-img">',
      chartResTitle: "Resolution repartition",
      chartResContent: '<img src="/images/stats/data-resolution.png" class="modal-rich-img">',
      chartFocalMinTitle: "Minimum focal repartition",
      chartFocalMinContent:
        '<strong>Fixed:</strong><img src="/images/stats/data-min-focal-fixed.png" class="modal-rich-img"><strong>Dome/PTZ:</strong><img src="/images/stats/data-min-focal-domeptz.png" class="modal-rich-img">',
      chartFocalAvgTitle: "Average focal repartition",
      chartFocalAvgContent:
        '<strong>Fixed:</strong><img src="/images/stats/data-average-focal-fixed.png" class="modal-rich-img"><strong>Dome/PTZ:</strong><img src="/images/stats/data-average-focal-domeptz.png" class="modal-rich-img">',
      chartFocalMaxTitle: "Maximum focal repartition",
      chartFocalMaxContent:
        '<strong>Fixed:</strong><img src="/images/stats/data-max-focal-fixed.png" class="modal-rich-img"><strong>Dome/PTZ:</strong><img src="/images/stats/data-max-focal-domeptz.png" class="modal-rich-img">',
      // Resources page
      menuResources: "Resources",
      resLearnTitle: "Resources to learn more",
      resLangEn: "English",
      resLangFr: "French",
      resLearnEnL1: "<a href='https://bigbrotherwatch.org.uk/' target='_blank'>Big Brother Watch</a>",
      resLearnEnL2:
        "<a href='https://www.tandfonline.com/doi/full/10.1080/14794713.2015.1084797' target='_blank'>Outperforming activism: reflections on the demise of the surveillance camera players</a>",
      resLearnEnL3:
        "<a href='https://en.wikipedia.org/wiki/The_Age_of_Surveillance_Capitalism' target='_blank'>The Age of Surveillance Capitalism</a>",
      resLearnEnL4:
        "<a href='https://en.wikipedia.org/wiki/Nothing_to_hide_argument' target='_blank'>Nothing to hide argument</a>",
      resLearnEnL5:
        "<a href='https://banthescan.amnesty.org/index.html' target='_blank'>Amnesty International: Ban the scan</a>",
      resLearnEnL6:
        "<a href='https://privacyinternational.org/learn/mass-surveillance' target='_blank'>Privacy International</a>",
      resLearnEnL7: "<a href='https://deflock.me/' target='_blank'>Deflock (against ALPR)</a>",
      resLearnEnL8: "<a href='https://www.notrace.how/' target='_blank'>No trace project</a>",
      resLearnEnL9:
        "<a href='https://www.notrace.how/resources/download/pas-vue-pas-prise/you-cant-catch-what-you-cant-see-read.pdf' target='_blank'>You can't catch what you can't see</a>",
      resLearnFrL1: "<a href='https://technopolice.fr/' target='_blank'>TechnoPolice</a>",
      resLearnFrL2:
        "<a href='https://editions-terresdefeu.com/catalogue-8' target='_blank'>Caméras sous surveillance</a>",
      resLearnFrL3: "<a href='https://reclaimyourface.eu/fr/' target='_blank'>Reclaim your face</a>",
      resLearnFrL4: "<a href='https://www.sous-surveillance.net/' target='_blank'>Sous surveillance</a>",
      resLearnFrL5:
        "<a href='https://www.notrace.how/resources/download/pas-vue-pas-prise/pas-vue-pas-prise.pdf' target='_blank'>Pas vue pas prise (No Trace Project)</a>",
      resProtectTitle: "Ideas to protect yourself",
      resProtectIRTitle: "<strong>Anonymize yourself with IR LEDs:</strong>",
      resProtectIRL1:
        "<a href='https://www.macpierce.com/the-camera-shy-hoodie' target='_blank'>The camera Shy Hoodie</a>",
      resProtectIRL2: "<a href='https://urbanarmor.org/portfolio/miss-my-face/' target='_blank'>Miss my face</a>",
      resProtectAntiTitle: "<strong>Anti-recognition systems:</strong>",
      resProtectAntiL1:
        "<a href='https://www.ft.com/content/a0f8d8c5-ee5c-4618-bfbd-6bfb383b803e' target='_blank'>Meet the activists perfecting the craft of anti-surveillance</a>",
      resProtectAntiL2:
        "<a href='https://www.nylon.com/beauty/on-anti-surveillance-makeup-and-just-how-effective-it-really-is' target='_blank'>Anti-Surveillance Makeup</a>",
      resProtectAntiL3:
        "<a href='https://yr.media/tech/guide-to-anti-surveillance-fashion/' target='_blank'>Clothes, masks, makeup and more</a>",
      resProtectDisableTitle: "<strong>Disable cameras:</strong>",
      resProtectDisableL1: "<a href='http://www.naimark.net/projects/zap/howto.html' target='_blank'>With lasers</a>",
      resProtectDisableL2: "Or physically (paint, stickers, rocks... be creative)",
      resProtectAction: "Help us map the surveillance network by adding cameras you spot in your daily life!",
      resProtectBtn: "Contribute to OpenStreetMap",
      resInspoTitle: "Inspirations & Credits",
      resInspoP1:
        "One major inspiration for this project has been <a href='https://sunders.uber.space/' target='_blank'>SunderS</a>. Information used is from the awesome <a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a> database. Other attributions and projects used for this application can be found on our <a href='https://babastienne.github.io/PanoptiCity/license.html#attribution'>dedicated page</a>.",
      // Core Values Page
      menuValues: "About this site",
      valTitle: "Core values of this website",
      valIntro1:
        "This project was born in 2025. The initial idea was to create a map displaying CCTV cameras and their fields of view to raise awareness about mass surveillance and urban coverage. Inspired by <a href='https://sunders.uber.space/' target='_blank'>SunderS</a>, it was motivated by the proliferation of cameras and the total lack of transparency regarding their locations and capabilities.",
      valIntro2:
        'The deployment of CCTV and Algorithmic Video Surveillance (AVS) is often presented as a neutral technical evolution. However, these "eyes in the city" carry profound implications for our democracy and fundamental freedoms.',
      valConcernsTitle: "Concerns about CCTV and Algorithmic Video Surveillance (AVS)",
      valSumInnocence: "Suspect by default: ending presumption of innocence",
      valDetInnocence:
        'Mass surveillance operates on the assumption that all data is potentially useful to address a hypothetical future threat. This flips the legal pillar of "innocent until proven guilty".<br/><br/>When a city is saturated with cameras, you are no longer a citizen moving freely: you are a "data point" being scrutinized for "abnormality". We move from a society where the police need reasonable suspicion to track someone, to one where the act of being in public is itself a reason for being watched.',
      valSumAi: "The AI panopticon: automation of social control",
      valDetAi:
        'Modern CCTV is no longer just a "dumb" recorder: it is increasingly powered by Algorithmic Video Surveillance (VSA) and Facial Recognition.<br/><br/>Even without facial regnition, algorithms are used already to analyze behavior in real-time:<ul><li>If you\'re in a car and stop for an "abnormal" time in an intersection or park outside a parking spot, CCTV can automatically detect it, zoom onto your license plate and sometimes (depending on your location), verbalize you.</li><li>If you\'re walking in the streets, cameras are programmed to detect "suspicious" patterns and zoom automatically onto your face, alerting an agent if needed. For example if you stop in a crowd to tie your shoes, if you change direction or start to run, thoses are behavior that can be automatically detected.</li></ul>Facial recognition is just the last step of a completely automated workflow, and the perfect start for social control.<br/><br/>AI doesn\'t just watch; it categorizes. It detects "suspicious gait", "unusual loitering", or "crowd movements". This removes the human element from policing and replaces it with mathematical authoritarianism. If an algorithm flags you as "suspicious", you have no way to argue with the machine\'s "objective" logic.<br/><br/>La Quadrature du Net (and the awesome <a href=\'https://technopolice.fr/blog/the-technopolice-manifesto-resisting-the-total-surveillance-of-our-cities-and-of-our-lives/\' target=\'_blank\'>Technopolice Project</a>) documents how "safe cities" projects transform urban centers into experiments for automated behavior modification, especially usefull to target vulnerable groups and activists.',
      valSumFascism: "Techno-fascism and the centralization of power",
      valDetFascism:
        'Techno-fascism is the use of advanced technology to centralize power, suppress opposition and civil liberties with the argument of efficiency.<br/><br/>With CCTV, total visibility leads to total control. When the state (or any group) knows every meeting you attend, every person you talk to, and every path you take, the "checks and balances" of democracy disappear. Surveillance technology is a danger at any time: even if today’s government is "good", the infrastructure remains for a future authoritarian leader to use at the push of a button.',
      valSumChilling: "The chilling effect, how to change our behavior without noticing",
      valDetChilling:
        "<a href='https://privacyinternational.org/learn/mass-surveillance' target='_blank'>Surveillance changes how people act</a>, even when they have done nothing wrong. This is the <a href='https://en.wikipedia.org/wiki/Chilling_effect' target='_blank'>chilling effect</a>.<br/><br/>When people know they are being watched, they self-censor. They stop attending protests, avoid \"controversial\" books and conform to the \"average\" to avoid being flagged by an AI. The result is a sterile, stagnant society where the creative \"deviance\" necessary for social progress is extinguished.<br/><br/>Amnesty International (see <a href='https://banthescan.amnesty.org/index.html' target='_blank'>ban the scan</a>) has documented how the only presence of facial-recognition-capable cameras in New York or London has a chilling effect on the right to peaceful assembly and protest.",
      valSumProtection: 'From surveillance to "protection"',
      valDetProtection:
        'In political discourse, the word "surveillance" is increasingly replaced by "protection", "safety", or "video-protection". This is exactly what George Orwell described as <a href=\'https://en.wikipedia.org/wiki/Newspeak\' target=\'_blank\'>newspeak</a>: the use of language to limit the range of thought and change the perception of an action.<br/><br/>By labeling intrusive monitoring as "protection", authorities bypass the critical debate on the loss of privacy. <strong>"Protection" implies a service / "Surveillance" implies control.</strong><br/><br/>In reality, it is obvious to say that a camera cannot protect you...',
      valSumHide: '"I have nothing to hide"',
      valDetHide:
        "One frequent argument in defense of surveillance is: \"If you have nothing to hide, you have nothing to fear\".<br/><br/>This argument misinterprets the nature of privacy. Privacy is not about hiding \"wrong\" things, it is about the right to an autonomous life. We have blinds on our windows and doors on our bathrooms not because we are criminals, but because we require an intimate space to exist as individuals.<br/><br/><blockquote>\"Arguing that you don't care about the right to privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say.\" ~ Edward Snowden</blockquote><br/><br/>This argument is so common that there is a <a href='https://en.wikipedia.org/wiki/Nothing_to_hide_argument' target='_blank'>dedicated wikipedia page</a> about it.",
      valSumExpansion: "Technology never stops",
      valDetExpansion:
        "Security technology is rarely settled, it always expands.<br/><br/>Cameras installed to \"stop terrorism\" are quickly used to fine people for littering, then to track political activists, then to monetize foot-traffic data, etc.<br/><br/>With technologies and surveillance, the argument to make it acceptable is always one that cannot be objected: fighting terrorism for CCTV, finding pedophiles for <a href='https://fightchatcontrol.eu/' target='_blank'>chat control</a>, etc. In the end it always expands and is used against the population.<br/><br/>Moreover, there is a massive global lobby of security companies that profits from fear. These companies sell \"solutions\" to cities for problems that often require social, not technological, interventions.",
      valSumEffectiveness: "CCTV Effectiveness",
      valDetEffectiveness:
        "<a href='https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=cctv+effectiveness&btnG=&oq=cctv' target='_blank'>Multiple studies</a> has been conducted to measure effectiveness of CCTV in public areas. It usually shows relative effectiveness but not in the spots we could imagine: in car parkings and residential areas ... so not really in public spaces and city centers. It has <strong>zero impact on violent crime</strong> (crimes of passion or impulse). In most cases, it simply displaces crime to the next street over, rather than preventing it.<br/><br/>Also, <a href='https://academicworks.cuny.edu/cgi/viewcontent.cgi?article=1275&context=jj_pubs' target='_blank'>field studies</a> in cities have shown that video surveillance does not significantly help to solve investigations, nor does it reduce the number of violent crimes, drug-related offences or public order disturbances in cities. There are a number of reasons for this ineffectiveness: lack of coordination between security forces (private, state, municipal), poor quality images, misdirected or dirty cameras, etc. But the major problem is the staggering number of video streams compared with the small number of officers who are supposed to be using them.",
      valSumCost: "The true economic cost",
      valDetCost:
        'Installing and maintaining a network of cameras is immensely expensive.<br/><br/>Every euro or dollar spent on a camera is a not spent on social workers, youth centers, street lighting, or mental health services—measures that are statistically proven to reduce crime more effectively than surveillance.<br/><br/>Furthermore, cameras have a short lifespan (around 5 years) and require constant, expensive software updates, creating a "subscription to surveillance" for the taxpayer.<br/><br/>There is no official data about the cost of video-surveillance but estimations of the global worldwide market can vary between 50 to 130 billions dollars per year.',
      valSumHack: "Hackable cities",
      valDetHack:
        'A city of cameras is a city of "digital backdoors".<br/><br/>By creating a massive network of connected cameras, cities create a massive attack surface for hackers or foreign actors. If a city’s camera grid is compromised, a malicious actor can track the movements of police, politicians, or any citizen in real-time. Surveillance infrastructure intended for "security" often becomes the greatest security vulnerability.<br/><br/>A recent example is <a href=\'https://www.theverge.com/2021/3/9/22322122/verkada-hack-150000-security-cameras-tesla-factory-cloudflare-jails-hospitals\' target=\'_blank\'>the "Verkada" hack</a>, where hackers gained access to 150 000 live camera feeds (including hospitals, police stations, and prisons).',
      valSumEcology: "Environmental impact",
      valDetEcology:
        'Surveillance is an ecological issue.<br/><br/>The "cloud" isn\'t invisible. Storing petabytes of high-definition video 24/7 requires massive data centers that consume enormous amounts of electricity and water for cooling. Furthermore, the production of millions of electronic devices obviously contributes to the global e-waste crisis.<br/><br/><a href=\'https://theshiftproject.org/app/uploads/2025/02/Deploying-digital-sobriety_TSP_2020_final.pdf\' target=\'_blank\'>"Digital Sobriety" is incompatible with the "Smart City" model</a>, which relies on constant, energy-intensive data streaming.',
      valSumBias: "Algorithmic bias",
      valDetBias:
        'Surveillance, as well a algorithms and AI are not "objective". They are biased by the people who build it, by the data used for training.<br/><br/>AI and facial recognition are notoriously bad at identifying people of color, women, and non-binary individuals. This leads to <a href=\'https://www.ssoar.info/ssoar/handle/document/20067\' target=\'_blank\'>"automated racial profiling"</a>, where certain demographics are flagged more often by "suspicion algorithms" simply because of the data used to train the AI.',
      valObjTitle: "What should we do ? The objective behind PanoptiCity",
      valObjP1:
        'PanoptiCity does not exist to tell you that cameras are "evil". <strong>It exists to make the invisible visible</strong>.',
      valObjP2:
        'For too long, the deployment of mass surveillance has happened in the shadows, voted on in small committees, funded by opaque grants, and marketed as "innovation". Politicians often trust the lobisters because they\'re not familiar with the subject and the reality of the statistics, because it looks like a miracle solution.',
      valObjHighlight1: "We believe that the architecture of our cities is a <strong>democratic choice</strong>.",
      valObjQIntro: "Some questions we must ask ourselves are:",
      valObjQ1: "<strong>Do we want a society built on trust?</strong>",
      valObjQ2: "<strong>Do we want to give up our privacy for a so call security?</strong>",
      valObjQ3: "<strong>Do this really bring more security?</strong>",
      valObjQ4:
        "<strong>Who can see and control thoses images, and if the argument is transparency (nothing to hide) why the images are not public?</strong>",
      valObjQ5: "<strong>Do we want those images to be automatically analyzed by algorithms?</strong>",
      valObjQ6: "<strong>How much did it really costs to my city?</strong>",
      valObjHighlight2:
        'Whether you are "pro-camera" for security or "anti-camera" for liberty, you cannot have a balanced opinion if you do not know where the eyes are. <strong>PanoptiCity provides the map: the conversation is up to you.</strong>',
    },
  },
  fr: {
    titleApp: "PanoptiCity",
    appDescription:
      "Naviguez sur une carte en temps réel des caméras de surveillance et de leur champ de vision. Contribuez à OpenStreetMap en fournissant des données via une interface simplifiée.",
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
    // Layers
    layerStandard: "Standard",
    layerHot: "Humanitaire",
    layerSatellite: "Satellite",
    // Static content available from menu
    menuContent: {
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
      menuScenarioComputation: "Calcul des scénarios",
      scenTitle: "Méthodes de calcul des scénarios",
      scenIntro:
        "Pour estimer la valeur potentielle des attributs manquants nécessaires au calcul du champ de vision des caméras (résolution, format, focale), nous avons compilé dans un fichier les informations techniques de plus de 15 200 modèles de caméras de vidéosurveillance provenant de 143 marques différentes. Cela nous a permis d'obtenir une vision globale du niveau technique actuel du marché de la vidéosurveillance tel qu'il est en 2025. Gardez à l'esprit que de nouveaux modèles de caméras sortent chaque semaine ; selon le moment où vous lisez ces lignes, les chiffres peuvent donc être différents aujourd'hui.",
      scenDataLinks:
        "Les chiffres utilisés peuvent être consultés dans le fichier <a href='/static/AllCamerasList.ods'>AllCameraList.ods</a> (ou au format JSON dans <a href='/static/camerasList.json'>camerasList.json</a>).",
      scenModelsIntro:
        "À partir de ces chiffres, nous avons trié chaque variable et avons pu déterminer des statistiques sur la qualité des caméras. Selon le type de caméra (fixes ou dômes/PTZ), nous avons créé trois modèles pour nous aider à déterminer la qualité des caméras (et par conséquent leur champ de vision) :",

      thScen: "Scénario",
      thDesc: "Description",
      thFixedVal: "Caméras fixes",
      thDomeVal: "Caméras dômes/PTZ",
      trBestTitle: "Conservateur",
      trBestDesc: "Premier décile : 90 % des caméras du marché ont une meilleure qualité que celle-ci.",
      trMeanTitle: "Standard",
      trMeanDesc: "Scénario par défaut : La médiane du marché.",
      trWorstTitle: "Élevé",
      trWorstDesc: "Dernier décile : Seul le top 10 % du marché peut atteindre cette qualité.",

      scenImprovement:
        "<strong>Comment cela pourrait être amélioré :</strong> Une bonne façon d'améliorer ces modèles serait de créer une corrélation entre chaque modèle de caméra et ses chiffres de vente afin de pondérer le poids de chaque caméra dans le calcul du modèle. Cependant, ces chiffres ne sont pas facilement accessibles.",

      statsTitle: "Analyse statistique des données techniques",
      statsIntro:
        "Les sections suivantes compilent des analyses graphiques présentant les tendances de répartition de plusieurs caractéristiques techniques selon la catégorie des caméras (fixes ou dômes/PTZ).",
      statsLimitsTitle: "Limites du jeu de données",
      statsLimits:
        "Certaines caméras spécifiques ont été retirées de l'analyse, notamment les caméras thermiques ou industrielles. Les caméras de type 'globe' ou 'fisheye' ont été catégorisées comme caméras dômes pour cette analyse. Il s'agit d'une limitation connue qui pourrait être améliorée par une meilleure catégorisation des sous-types à l'avenir.",

      statsChartsTitle: "Voir les graphiques statistiques",
      chartFormatTitle: "Répartition du format de l'objectif",
      chartFormatContent:
        '<img src="/images/stats/data-format.png" class="modal-rich-img"><img src="/images/stats/data-format-log.png" class="modal-rich-img">',
      chartResTitle: "Répartition de la résolution",
      chartResContent: '<img src="/images/stats/data-resolution.png" class="modal-rich-img">',
      chartFocalMinTitle: "Répartition de la focale minimale",
      chartFocalMinContent:
        '<strong>Fixes :</strong><img src="/images/stats/data-min-focal-fixed.png" class="modal-rich-img"><strong>Dômes/PTZ :</strong><img src="/images/stats/data-min-focal-domeptz.png" class="modal-rich-img">',
      chartFocalAvgTitle: "Répartition de la focale moyenne",
      chartFocalAvgContent:
        '<strong>Fixes :</strong><img src="/images/stats/data-average-focal-fixed.png" class="modal-rich-img"><strong>Dômes/PTZ :</strong><img src="/images/stats/data-average-focal-domeptz.png" class="modal-rich-img">',
      chartFocalMaxTitle: "Répartition de la focale maximale",
      chartFocalMaxContent:
        '<strong>Fixes :</strong><img src="/images/stats/data-max-focal-fixed.png" class="modal-rich-img"><strong>Dômes/PTZ :</strong><img src="/images/stats/data-max-focal-domeptz.png" class="modal-rich-img">',
      // Resources page
      menuResources: "Ressources",
      resLearnTitle: "Ressources pour aller plus loin",
      resLangEn: "Anglais",
      resLangFr: "Français",
      resLearnEnL1: "<a href='https://bigbrotherwatch.org.uk/' target='_blank'>Big Brother Watch</a>",
      resLearnEnL2:
        "<a href='https://www.tandfonline.com/doi/full/10.1080/14794713.2015.1084797' target='_blank'>Outperforming activism: reflections on the demise of the surveillance camera players</a>",
      resLearnEnL3:
        "<a href='https://en.wikipedia.org/wiki/The_Age_of_Surveillance_Capitalism' target='_blank'>L'Âge du capitalisme de surveillance</a> (Shoshana Zuboff)",
      resLearnEnL4:
        "<a href='https://fr.wikipedia.org/wiki/Rien_%C3%A0_cacher_(argument)' target='_blank'>L'argument du « rien à cacher » (wikipedia)</a>",
      resLearnEnL5:
        "<a href='https://banthescan.amnesty.org/index.html' target='_blank'>Amnesty International : Ban the scan</a>",
      resLearnEnL6:
        "<a href='https://privacyinternational.org/learn/mass-surveillance' target='_blank'>Privacy International</a>",
      resLearnEnL7: "<a href='https://deflock.me/' target='_blank'>Deflock (contre les lecteurs de plaque)</a>",
      resLearnEnL8: "<a href='https://www.notrace.how/' target='_blank'>No Trace Project</a>",
      resLearnEnL9:
        "<a href='https://www.notrace.how/resources/download/pas-vue-pas-prise/you-cant-catch-what-you-cant-see-read.pdf' target='_blank'>You can't catch what you can't see</a>",
      resLearnFrL1: "<a href='https://technopolice.fr/' target='_blank'>TechnoPolice</a> par La Quadrature Du Net",
      resLearnFrL2:
        "<a href='https://editions-terresdefeu.com/catalogue-8' target='_blank'>Caméras sous surveillance</a> (Éditions Terres de Feu)",
      resLearnFrL3: "<a href='https://reclaimyourface.eu/fr/' target='_blank'>Reclaim Your Face</a>",
      resLearnFrL4: "<a href='https://www.sous-surveillance.net/' target='_blank'>Sous surveillance</a>",
      resLearnFrL5:
        "<a href='https://www.notrace.how/resources/download/pas-vue-pas-prise/pas-vue-pas-prise.pdf' target='_blank'>Pas vue pas prise (No Trace Project)</a>",
      resProtectTitle: "Idées pour se protéger",
      resProtectIRTitle: "<strong>S'anonymiser avec des LEDs infrarouges (IR) :</strong>",
      resProtectIRL1:
        "<a href='https://www.macpierce.com/the-camera-shy-hoodie' target='_blank'>The Camera Shy Hoodie</a>",
      resProtectIRL2: "<a href='https://urbanarmor.org/portfolio/miss-my-face/' target='_blank'>Miss my face</a>",
      resProtectAntiTitle: "<strong>Systèmes anti-reconnaissance :</strong>",
      resProtectAntiL1:
        "<a href='https://www.ft.com/content/a0f8d8c5-ee5c-4618-bfbd-6bfb383b803e' target='_blank'>Rencontre avec les activistes qui perfectionnent l'art de l'anti-surveillance</a>",
      resProtectAntiL2:
        "<a href='https://www.nylon.com/beauty/on-anti-surveillance-makeup-and-just-how-effective-it-really-is' target='_blank'>Maquillage anti-surveillance</a>",
      resProtectAntiL3:
        "<a href='https://yr.media/tech/guide-to-anti-surveillance-fashion/' target='_blank'>Vêtements, masques, maquillage et plus encore</a>",
      resProtectDisableTitle: "<strong>Neutraliser des caméras :</strong>",
      resProtectDisableL1:
        "<a href='http://www.naimark.net/projects/zap/howto.html' target='_blank'>Avec des lasers</a>",
      resProtectDisableL2: "Ou physiquement (peinture, autocollants, cailloux... soyez créatifs)",
      resProtectAction:
        "Aidez-nous à cartographier le réseau de surveillance en ajoutant les caméras que vous croisez au quotidien !",
      resProtectBtn: "Contribuer à OpenStreetMap",
      resInspoTitle: "Inspirations & Crédits",
      resInspoP1:
        "L'une des inspirations majeures de ce projet est le site <a href='https://sunders.uber.space/' target='_blank'>SunderS</a>. Les informations utilisées proviennent de la base de données <a href='https://www.openstreetmap.org/' target='_blank'>OpenStreetMap</a>. Les autres attributions et projets utilisés pour cette application sont listés sur notre <a href='https://babastienne.github.io/PanoptiCity/license.html#attribution'>page dédiée</a>.",
      // Core Values Page
      // Page des Valeurs Fondamentales
      menuValues: "À propos de ce site",
      valTitle: "Valeurs fondamentales de ce site",
      valIntro1:
        "Ce projet est né en 2025. L'idée initiale était de créer une carte affichant les caméras de vidéosurveillance et leur champ de vision afin de sensibiliser à la surveillance de masse et à la couverture urbaine. Inspiré par <a href='https://sunders.uber.space/' target='_blank'>SunderS</a>, il a été motivé par la prolifération des caméras et l'absence totale de transparence concernant leurs emplacements et leurs capacités.",
      valIntro2:
        'Le déploiement généralisé des caméras et de la Vidéosurveillance Algorithmique (VSA) est souvent présenté comme une évolution technique neutre de la gestion urbaine. Cependant, ces "yeux dans la ville" portent des implications profondes pour notre démocratie et nos libertés fondamentales.',
      valConcernsTitle: "Inquiétudes concernant les caméras et la surveillance algorithmique (VSA)",
      valSumInnocence: "Suspect par défaut : la fin de la présomption d'innocence",
      valDetInnocence:
        "La surveillance de masse repose sur l'hypothèse que toutes les données sont potentiellement utiles pour répondre à une hypothétique menace future. Cela inverse le pilier juridique de la \"présomption d'innocence\".<br/><br/>Lorsqu'une ville est saturée de caméras, vous n'êtes plus un citoyen circulant librement : vous êtes un \"point de donnée\" scruté à la recherche d'une \"anomalie\". Nous passons d'une société où la police a besoin de soupçons raisonnables pour suivre quelqu'un, à une société où le simple fait d'être dans l'espace public est une raison suffisante pour être surveillé.",
      valSumAi: "Le panoptique dopé à l'IA : l'automatisation du contrôle social",
      valDetAi:
        'La vidéosurveillance moderne n\'est plus un simple enregistreur passif : elle est de plus en plus couplée à la Vidéosurveillance Algorithmique (VSA) et à la reconnaissance faciale.<br/><br/>Même sans reconnaissance faciale, des algorithmes sont déjà utilisés pour analyser les comportements en temps réel :<ul><li>Si vous êtes en voiture et que vous vous arrêtez un temps "anormal" à une intersection ou que vous vous garez hors d\'une place, la caméra peut le détecter automatiquement, zoomer sur votre plaque et parfois (selon la ville), déclencher une verbalisation.</li><li>Si vous marchez dans la rue, les caméras sont programmées pour détecter des schémas "suspects" et zoomer automatiquement sur votre visage, alertant un agent si nécessaire. Par exemple, si vous vous arrêtez dans une foule pour lacer vos chaussures, si vous changez brusquement de direction ou si vous vous mettez à courir.</li></ul>La reconnaissance faciale n\'est que la dernière étape d\'un flux de travail complètement automatisé, et le point de départ idéal pour un contrôle social total.<br/><br/>L\'IA ne se contente pas de regarder ; elle catégorise. Elle détecte une "démarche suspecte", une "errance inhabituelle" ou des "mouvements de foule". Cela supprime l\'élément humain du maintien de l\'ordre pour le remplacer par un autoritarisme mathématique. Si un algorithme vous identifie comme "suspect", vous n\'avez aucun moyen de contester la logique "objective" de la machine.<br/><br/>La Quadrature du Net (et l\'excellent <a href=\'https://technopolice.fr/\' target=\'_blank\'>Projet Technopolice</a>) documente comment les projets de "Safe Cities" transforment les centres urbains en laboratoires de modification comportementale automatisée, particulièrement utiles pour cibler les groupes vulnérables et les activistes.',
      valSumFascism: "Techno-fascisme et centralisation du pouvoir",
      valDetFascism:
        "Le techno-fascisme est l'utilisation de technologies avancées pour centraliser le pouvoir, supprimer l'opposition et les libertés civiles sous couvert d'efficacité.<br/><br/>Avec la vidéosurveillance, la visibilité totale mène au contrôle total. Lorsque l'État (ou n'importe quel groupe) connaît chaque réunion à laquelle vous assistez, chaque personne à qui vous parlez et chaque chemin que vous empruntez, les contre-pouvoirs démocratiques disparaissent. La technologie de surveillance est un danger permanent : même si le gouvernement actuel est \"bienveillant\", l'infrastructure reste en place pour qu'un futur leader autoritaire puisse l'utiliser d'une simple pression sur un bouton.",
      valSumChilling: "Le chilling effect : changer de comportement sans s'en rendre compte",
      valDetChilling:
        "<a href='https://privacyinternational.org/learn/mass-surveillance' target='_blank'>La surveillance modifie la façon dont les gens agissent</a>, même lorsqu'ils n'ont rien fait de mal. C'est ce qu'on appelle <a href='https://en.wikipedia.org/wiki/Chilling_effect' target='_blank'>l'effet de gel ou chilling effect</a>.<br/><br/>Lorsque les gens se savent observés, ils s'autocensurent. Ils cessent de participer à des manifestations, évitent les livres \"controversés\" et se conforment à la \"moyenne\" pour éviter d'être signalés par une IA. Le résultat est une société stérile et stagnante où la \"déviance\" créative, nécessaire au progrès social, est étouffée.<br/><br/>Amnesty International (voir <a href='https://banthescan.amnesty.org/' target='_blank'>Ban the Scan</a>) a documenté comment la seule présence de caméras capables de reconnaissance faciale à New York ou Londres a un effet dissuasif sur le droit de réunion et de manifestation pacifique.",
      valSumProtection: 'De la surveillance à la "protection"',
      valDetProtection:
        'Dans le discours politique, le mot "surveillance" est de plus en plus remplacé par "protection", "sûreté" ou "vidéoprotection". C\'est précisément ce que George Orwell décrivait comme la <a href=\'https://fr.wikipedia.org/wiki/N%C3%A9oparler\' target=\'_blank\'>novlangue</a> : l\'utilisation du langage pour limiter la portée de la pensée et modifier la perception d\'une action.<br/><br/>En qualifiant une surveillance intrusive de "protection", les autorités contournent le débat critique sur la perte de vie privée. <strong>La "protection" implique un service, là où la "surveillance" implique un contrôle.</strong><br/><br/>En réalité, il est évident qu\'une caméra ne peut pas vous protéger physiquement...',
      valSumHide: '"Je n\'ai rien à cacher"',
      valDetHide:
        "Un argument fréquent en défense de la surveillance est : \"Si vous n'avez rien à cacher, vous n'avez rien à craindre\".<br/><br/>Cet argument interprète mal la nature de la vie privée. La vie privée ne consiste pas à cacher des choses \"mal\", elle concerne le droit à une vie autonome. Nous avons des stores à nos fenêtres et des verrous sur nos portes de salle de bain non pas parce que nous sommes des criminels, mais parce que nous avons besoin d'un espace intime pour exister en tant qu'individus.<br/><br/><blockquote>\"Dire que votre droit à la vie privée ne vous importe pas parce que vous n'avez rien à cacher, c'est comme dire que votre droit à la liberté d'expression ne vous importe pas parce que vous n'avez rien à dire.\" ~ Edward Snowden</blockquote><br/><br/>Cet argument est si commun qu'il existe une <a href='https://fr.wikipedia.org/wiki/Rien_%C3%A0_cacher_(argument)' target='_blank'>page Wikipédia dédiée</a> à ce sujet.",
      valSumExpansion: "La technologie ne s'arrête jamais",
      valDetExpansion:
        "La technologie sécuritaire n'est jamais figée, elle s'étend toujours.<br/><br/>Des caméras installées pour \"lutter contre le terrorisme\" sont rapidement utilisées pour amender les dépôts sauvages de déchets, puis pour suivre des militants politiques, puis pour monétiser les données de flux piétons, etc.<br/><br/>Avec les technologies de surveillance, l'argument pour les rendre acceptables est toujours celui auquel on ne peut s'opposer : la lutte contre le terrorisme pour les caméras, la recherche de pédophiles pour le <a href='https://fightchatcontrol.eu/' target='_blank'>Chat Control</a>, etc. Au final, l'usage s'étend toujours et finit par être utilisé contre la population.<br/><br/>De plus, il existe un lobby mondial massif d'entreprises de sécurité qui profite de la peur. Ces entreprises vendent des \"solutions\" technologiques à des problèmes qui nécessitent souvent des interventions sociales et non techniques.",
      valSumEffectiveness: "Efficacité de la vidéosurveillance",
      valDetEffectiveness:
        "<a href='https://scholar.google.com/scholar?hl=fr&q=cctv+effectiveness' target='_blank'>De multiples études</a> ont été menées pour mesurer l'efficacité de la vidéosurveillance dans les espaces publics. Elles montrent généralement une efficacité relative, mais pas là où on l'imagine : dans les parkings fermés et les zones résidentielles... mais pas réellement dans les centres-villes. Elle a un <strong>impact nul sur les crimes violents</strong> (crimes passionnels ou d'impulsion). Dans la plupart des cas, elle déplace simplement la criminalité vers la rue suivante.<br/><br/>De plus, des <a href='https://academicworks.cuny.edu/cgi/viewcontent.cgi?article=1275&context=jj_pubs' target='_blank'>études de terrain</a> ont montré que la vidéosurveillance n'aide pas significativement à résoudre les enquêtes, ni ne réduit les délits liés à la drogue ou les troubles à l'ordre public. Plusieurs raisons expliquent cette inefficacité : manque de coordination entre les forces de sécurité, mauvaise qualité des images, caméras sales ou mal orientées... Mais le problème majeur est le nombre ahurissant de flux vidéo par rapport au faible nombre d'agents censés les visionner.",
      valSumCost: "Le véritable coût économique",
      valDetCost:
        "L'installation et l'entretien d'un réseau de caméras coûtent extrêmement cher.<br/><br/>Chaque euro dépensé dans une caméra est un euro qui n'est pas investi dans des travailleurs sociaux, des centres de jeunesse, l'éclairage public ou les services de santé mentale — des mesures statistiquement prouvées comme étant plus efficaces pour réduire la criminalité.<br/><br/>Par ailleurs, les caméras ont une durée de vie courte (environ 5 ans) et nécessitent des mises à jour logicielles constantes et onéreuses, créant un \"abonnement à la surveillance\" pour le contribuable.<br/><br/>Il n'existe pas de données officielles consolidées sur le coût total, mais le marché mondial de la vidéosurveillance est estimé entre 50 et 130 milliards de dollars par an.",
      valSumHack: "Villes piratables",
      valDetHack:
        "Une ville truffée de caméras est une ville pleine de \"portes dérobées numériques\".<br/><br/>En créant un réseau massif de caméras connectées, les villes créent une surface d'attaque immense pour des hackers ou des acteurs étrangers. Si le réseau est compromis, un acteur malveillant peut suivre les mouvements de la police, des élus ou de n'importe quel citoyen en temps réel.<br/><br/>Un exemple récent est le <a href='https://www.theverge.com/2021/3/9/22322122/verkada-hack-150000-security-cameras-tesla-factory-cloudflare-jails-hospitals' target='_blank'>piratage de \"Verkada\"</a>, où des hackers ont accédé à 150 000 flux en direct (hôpitaux, commissariats et prisons).",
      valSumEcology: "Impact environnemental",
      valDetEcology:
        "La surveillance est aussi un enjeu écologique.<br/><br/>Le \"cloud\" n'est pas invisible. Stocker des pétaoctets de vidéo haute définition 24h/24 nécessite des centres de données massifs qui consomment d'énormes quantités d'électricité et d'eau pour le refroidissement. De plus, la production de millions d'appareils électroniques contribue à la crise mondiale des déchets électroniques.<br/><br/>La <a href='https://theshiftproject.org/article/deployer-la-sobriete-numerique-rapport-shift/' target='_blank'>\"sobriété numérique\" est incompatible avec le modèle de la \"Smart City\"</a>, qui repose sur un streaming de données constant et énergivore.",
      valSumBias: "Biais algorithmiques",
      valDetBias:
        "La surveillance, tout comme les algorithmes et l'IA, n'est pas \"objective\". Elle est biaisée par les personnes qui la conçoivent et par les données utilisées pour l'entraînement.<br/><br/>L'IA et la reconnaissance faciale sont notoirement moins performantes pour identifier les personnes racisées, les femmes et les individus non-binaires. Cela mène à un <a href='https://www.ssoar.info/ssoar/handle/document/20067' target='_blank'>\"profilage racial automatisé\"</a>, où certaines catégories de population sont signalées plus souvent par les algorithmes simplement à cause des biais des données d'entraînement.",
      valObjTitle: "Que faire ? L'objectif derrière PanoptiCity",
      valObjP1:
        "PanoptiCity n'existe pas pour vous dire que les caméras sont \"le mal\". <strong>Il existe pour rendre l'invisible visible</strong>.",
      valObjP2:
        "Pendant trop longtemps, le déploiement de la surveillance de masse s'est fait dans l'ombre, voté en petits comités, financé par des subventions opaques et commercialisé sous le nom d'\"innovation\". Les décideurs politiques font souvent confiance aux lobbyistes car ils ne sont pas familiers avec le sujet et la réalité des statistiques, et parce que cela ressemble à une solution miracle.",
      valObjHighlight1: "Nous pensons que l'architecture de nos villes est un <strong>choix démocratique</strong>.",
      valObjQIntro: "Voici quelques questions que nous devons nous poser :",
      valObjQ1: "<strong>Voulons-nous une société bâtie sur la confiance ?</strong>",
      valObjQ2: "<strong>Voulons-nous renoncer à notre vie privée pour une prétendue sécurité ?</strong>",
      valObjQ3: "<strong>Cela apporte-t-il réellement plus de sécurité ?</strong>",
      valObjQ4:
        "<strong>Qui peut voir et contrôler ces images ? Si l'argument est la transparence (rien à cacher), pourquoi ces images ne sont-elles pas publiques ?</strong>",
      valObjQ5: "<strong>Voulons-nous que nos images soient analysées automatiquement par des algorithmes ?</strong>",
      valObjQ6: "<strong>Combien cela coûte-t-il réellement à ma ville ?</strong>",
      valObjHighlight2:
        'Que vous soyez "pro-caméra" pour la sécurité ou "anti-caméra" pour la liberté, vous ne pouvez pas avoir une opinion éclairée si vous ne savez pas où se trouvent les yeux. <strong>PanoptiCity fournit la carte : la conversation vous appartient.</strong>',
    },
  },
};
