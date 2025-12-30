import { TEXTS } from "./language.js";

export const levelsCameraConfiguration = {
  identification: {
    color: "red",
    weight: 0,
    fill: 0.5,
  },
  recognition: {
    color: "orange",
    weight: 0,
    fill: 0.5,
  },
  observation: {
    color: "green",
    weight: 0,
    fill: 0.5,
  },
};

export const choicesCameraType = {
  title: TEXTS.cameraTypeQuestion,
  name: TEXTS.cameraTypeName,
  display: true,
  tagName: "camera:type",
  options: {
    dome: {
      name: TEXTS.cameraTypeDome,
      picture: "images/contrib/type-dome.svg",
    },
    fixed: {
      name: TEXTS.cameraTypeFixed,
      picture: "images/contrib/type-fixed.svg",
    },
    panning: {
      name: TEXTS.cameraTypePanning,
      picture: "images/contrib/type-panning-arrow.svg",
    },
  },
};

export const choicesSurveillanceType = {
  title: TEXTS.cameraSurveillanceQuestion,
  name: TEXTS.cameraSurveillanceName,
  display: true,
  tagName: "surveillance",
  options: {
    public: {
      name: TEXTS.cameraSurveillancePublic,
      picture: "images/contrib/type-public.svg",
    },
    outdoor: {
      name: TEXTS.cameraSurveillanceOutdoor,
      picture: "images/contrib/type-outdoor.svg",
    },
    indoor: {
      name: TEXTS.cameraSurveillanceIndoor,
      picture: "images/contrib/type-indoor.svg",
    },
  },
};

export const choicesCameraMount = {
  title: TEXTS.cameraMountQuestion,
  name: TEXTS.cameraMountName,
  display: true,
  tagName: "camera:mount",
  options: {
    wall: {
      name: TEXTS.cameraMountWall,
      picture: "images/contrib/mount-wall.jpg",
    },
    pole: {
      name: TEXTS.cameraMountPole,
      picture: "images/contrib/mount-pole.jpg",
    },
    ceiling: {
      name: TEXTS.cameraMountCeiling,
      picture: "images/contrib/mount-ceiling.jpg",
    },
    street_lamp: {
      name: TEXTS.cameraMountStreetLamp,
      picture: "images/contrib/mount-streetlamp.jpg",
    },
    traffic_signals: {
      name: TEXTS.cameraMountTrafficSignal,
      picture: "images/contrib/mount-trafficlights.jpg",
    },
    doorbell: {
      name: TEXTS.cameraMountDoorbell,
      picture: "images/contrib/type-fixed.svg",
    },
    atm: {
      name: TEXTS.cameraMountAtm,
      picture: "images/contrib/type-fixed.svg",
    },
  },
};

export const choicesCameraZone = {
  title: TEXTS.cameraZoneQuestion,
  name: TEXTS.cameraZoneName,
  display: true,
  tagName: "surveillance:zone",
  options: {
    traffic: {
      name: TEXTS.cameraZoneTraffic,
      picture: "images/contrib/zone-traffic.svg",
    },
    town: {
      name: TEXTS.cameraZoneTown,
      picture: "images/contrib/zone-city.jpg",
    },
    entrance: {
      name: TEXTS.cameraZoneEntrance,
      picture: "images/contrib/zone-entrance.png",
    },
    shop: {
      name: TEXTS.cameraZoneShop,
      picture: "images/contrib/zone-store.jpg",
    },
    bank: {
      name: TEXTS.cameraZoneBank,
      picture: "images/contrib/zone-bank2.svg",
    },
    building: {
      name: TEXTS.cameraZoneBuilding,
      picture: "images/contrib/zone-building.svg",
    },
    parking: {
      name: TEXTS.cameraZoneParking,
      picture: "images/contrib/zone-parking.svg",
    },
    public_transport_platform: {
      name: TEXTS.cameraZonePublicTransportPlatform,
      picture: "images/contrib/zone-transport.jpg",
    },
  },
};

export const choicesCameraHeight = {
  title: TEXTS.cameraHeightQuestion,
  name: TEXTS.cameraHeightName,
  display: true,
  tagName: "height",
  defaultValue: 4,
  minValue: 1,
  maxValue: 16,
  step: 0.5,
};

export const choicesCameraDirection = {
  title: TEXTS.cameraDirectionQuestion,
  name: TEXTS.cameraDirectionName,
  display: true,
  tagName: "camera:direction",
  additionalTransform: 0,
  defaultValue: 0,
  minValue: 0,
  maxValue: 355,
  step: 5,
};

export const choicesCameraAngle = {
  title: TEXTS.cameraAngleQuestion,
  name: TEXTS.cameraAngleName,
  display: true,
  tagName: "camera:angle",
  additionalTransform: 90,
  defaultValue: 15,
  minValue: 0,
  maxValue: 90,
  step: 5,
};

export const choicesCameraLocation = {
  title: TEXTS.cameraLocationQuestion,
  name: TEXTS.cameraLocationName,
  display: false,
  tagName: "camera:position",
};

const last_date = {
  name: TEXTS.cameracheckDateName,
  display: true,
};

export const tagsListCamera = {
  man_made: { display: false },
  "surveillance:type": { display: false },
  check_date: last_date,
  "survey:date": last_date,
  source: {
    name: TEXTS.source,
    display: true,
  },
  operator: {
    name: TEXTS.operator,
    display: true,
  },
  "contact:webcam": {
    name: TEXTS.cameraWebcamName,
    display: true,
  },
  "addr:street": {
    name: TEXTS.address,
    display: true,
  },
  name: {
    name: TEXTS.name,
    display: true,
  },
  "camera:type": choicesCameraType,
  surveillance: choicesSurveillanceType,
  "camera:mount": choicesCameraMount,
  "surveillance:zone": choicesCameraZone,
  height: choicesCameraHeight,
  ele: choicesCameraHeight,
  "camera:angle": choicesCameraAngle,
  "camera:position": choicesCameraLocation,
  "camera:direction": choicesCameraDirection,
  "surveillance:direction": choicesCameraDirection,
  direction: choicesCameraDirection,
};
