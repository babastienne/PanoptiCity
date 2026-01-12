export const MENU_CONFIG = [
  {
    id: "about",
    labelKey: "menuAbout",
    type: "modal",
    content: [
      { type: "h3", textKey: "menuAbout" },
      { type: "p", textKey: "aboutP1" },
      { type: "p", textKey: "aboutP2" },
    ],
  },
  {
    id: "fov-more",
    labelKey: "menuFOVComputation",
    type: "modal",
    content: [
      { type: "h3", textKey: "methFovTitle" },
      { type: "p", textKey: "methFovIntro" },
      {
        type: "list",
        items: ["methFovL1", "methFovL2", "methFovL3", "methFovL4", "methFovL5", "methFovL6"],
      },
      { type: "p", textKey: "methFovPPM" },
      { type: "p", textKey: "methFovMatching" },
      {
        type: "table",
        headers: ["thColor", "thLevel", "thQuality"],
        rows: [
          [
            { raw: '<img src="/images/menu/icons/zone-identification.svg" width="24">' },
            { key: "tr1Level" },
            { raw: "<strong>> 250 PPM</strong>" },
          ],
          [
            { raw: '<img src="/images/menu/icons/zone-recognition.svg" width="24">' },
            { key: "tr2Level" },
            { raw: "<strong>250 - 65 PPM</strong>" },
          ],
          [
            { raw: '<img src="/images/menu/icons/zone-observation.svg" width="24">' },
            { key: "tr3Level" },
            { raw: "<strong>65 - 25 PPM</strong>" },
          ],
          [{ raw: "" }, { key: "tr4Level" }, { raw: "<strong>< 25 PPM</strong>" }],
        ],
      },
      { type: "p", style: "modal-attribution", textKey: "methDhsQuote" },
      {
        type: "accordion",
        titleKey: "",
        items: [
          { summaryKey: "methExampleIdTitle", detailsKey: "methExampleIdDesc" },
          { summaryKey: "methExampleRecTitle", detailsKey: "methExampleRecDesc" },
          { summaryKey: "methExampleObsTitle", detailsKey: "methExampleObsDesc" },
          { summaryKey: "methExampleNoneTitle", detailsKey: "methExampleNoneDesc" },
        ],
      },
      { type: "p", textKey: "methPtzNote" },

      { type: "h3", textKey: "methOsmTitle" },
      { type: "p", textKey: "methOsmP1" },
      { type: "p", textKey: "methOsmP2" },
      { type: "p", textKey: "methOsmQuestion" },
      { type: "p", textKey: "methOsmDefaultIntro" },
      {
        type: "table",
        headers: ["thField", "thDefault"],
        rows: [
          [{ key: "fldHeight" }, { key: "valHeight" }],
          [{ key: "fldAngle" }, { key: "valAngle" }],
          [{ key: "fldDirection" }, { key: "valDirection" }],
        ],
      },
      { type: "p", textKey: "methStatsP1" },
      { type: "p", textKey: "methStatsP2" },
      { type: "button", textKey: "methStatsButton" },

      { type: "h3", textKey: "methFixedAngleTitle" },
      { type: "p", textKey: "methFixedAngleIntro" },
      {
        type: "list",
        items: ["methFixedAngleF1", "methFixedAngleF2"],
      },
      { type: "p", textKey: "methFixedAngleResultIntro" },
      {
        type: "list",
        items: ["methFixedAngleR1", "methFixedAngleR2"],
      },
      { type: "p", textKey: "methFixedAngleConclusion" },

      { type: "h3", textKey: "methTiltTitle" },
      { type: "p", textKey: "methTiltIntro" },
      { type: "p", textKey: "methTiltCalc" },
      { type: "p", textKey: "methTiltFuture" },
    ],
  },
  {
    id: "why",
    labelKey: "menuWhy",
    type: "modal",
    content: [
      { type: "h3", textKey: "menuWhy" },
      { type: "p", textKey: "whyP1" },
      { type: "img", src: "images/menu/panopticon.jpeg" },
      {
        type: "attribution",
        items: [
          {
            text: "Friman",
            url: "https://commons.wikimedia.org/wiki/User:Friman",
          },
          {
            text: "CC BY-SA 3.0",
            url: "http://creativecommons.org/licenses/by-sa/3.0/",
          },
          {
            text: "Link",
            url: "https://commons.wikimedia.org/w/index.php?curid=2410607",
          },
        ],
      },
      { type: "p", textKey: "whyP2" },
    ],
  },
  {
    id: "documentation",
    labelKey: "menuDocumentation",
    type: "link",
    url: "https://babastienne.github.io/PanoptiCity/",
    external: true,
  },
  {
    id: "github",
    labelKey: "menuSourceCode",
    type: "link",
    url: "https://github.com/babastienne/panopticity",
    external: true,
  },
  {
    id: "contact",
    labelKey: "menuContact",
    type: "modal",
    content: [
      { type: "h3", textKey: "menuContact" },
      { type: "p", textKey: "contactIntro" },

      // GitHub Section
      { type: "h4", textKey: "contactGithubTitle" },
      { type: "p", textKey: "contactGithubDesc" },
      {
        type: "button",
        textKey: "contactGithubBtn",
        url: "https://github.com/babastienne/panopticity/issues",
        style: "contrast",
      },

      // Email Section
      { type: "h4", textKey: "contactEmailTitle" },
      { type: "p", textKey: "contactEmailDesc" },
      { type: "p", textKey: "contactEmailDisplay", style: "email-obfuscated" },

      // PGP Section
      { type: "p", textKey: "contactPgpDesc" },
    ],
  },
  {
    id: "license",
    labelKey: "menuLegal",
    type: "modal",
    content: [
      { type: "h3", textKey: "legalAttributionsTitle" },
      { type: "p", textKey: "legalAttributionsP1" },
      {
        type: "button",
        style: "outline",
        textKey: "legalAttributionsButton",
        url: "https://babastienne.github.io/PanoptiCity/license.html#attribution",
      },
      { type: "h3", textKey: "legalLicenseTitle" },
      { type: "p", textKey: "legalLicenseP1" },
      {
        type: "list",
        ordered: false,
        items: ["legalLicenseB1", "legalLicenseB2", "legalLicenseB3"],
      },
      {
        type: "button",
        style: "outline",
        textKey: "legalLicenseButton",
        url: "https://raw.githubusercontent.com/babastienne/PanoptiCity/refs/heads/main/LICENSE",
      },
    ],
  },
];
