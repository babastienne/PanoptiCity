export const MENU_CONFIG = [
  {
    id: "values",
    labelKey: "menuValues",
    type: "modal",
    content: [
      { type: "h3", textKey: "valTitle" },
      { type: "p", textKey: "valIntro1" },
      { type: "p", textKey: "valIntro2" },

      { type: "h3", textKey: "valConcernsTitle" },
      {
        type: "accordion",
        titleKey: "",
        items: [
          { summaryKey: "valSumInnocence", detailsKey: "valDetInnocence" },
          { summaryKey: "valSumAi", detailsKey: "valDetAi" },
          { summaryKey: "valSumFascism", detailsKey: "valDetFascism" },
          { summaryKey: "valSumChilling", detailsKey: "valDetChilling" },
          { summaryKey: "valSumProtection", detailsKey: "valDetProtection" },
          { summaryKey: "valSumHide", detailsKey: "valDetHide" },
          { summaryKey: "valSumExpansion", detailsKey: "valDetExpansion" },
          { summaryKey: "valSumEffectiveness", detailsKey: "valDetEffectiveness" },
          { summaryKey: "valSumCost", detailsKey: "valDetCost" },
          { summaryKey: "valSumHack", detailsKey: "valDetHack" },
          { summaryKey: "valSumEcology", detailsKey: "valDetEcology" },
          { summaryKey: "valSumBias", detailsKey: "valDetBias" },
        ],
      },
      { type: "h3", textKey: "valObjTitle" },
      { type: "p", textKey: "valObjP1" },
      { type: "p", textKey: "valObjP2" },
      { type: "p", textKey: "valObjHighlight1" },
      { type: "p", textKey: "valObjQIntro" },
      {
        type: "list",
        items: ["valObjQ1", "valObjQ2", "valObjQ3", "valObjQ4", "valObjQ5", "valObjQ6"],
      },
      { type: "p", textKey: "valObjHighlight2" },
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
    id: "scenarios-more",
    labelKey: "menuScenarioComputation",
    type: "modal",
    content: [
      { type: "h3", textKey: "scenTitle" },
      { type: "p", textKey: "scenIntro" },
      { type: "p", textKey: "scenDataLinks" },
      { type: "p", textKey: "scenModelsIntro" },

      // Scenarios Comparison Table
      {
        type: "table",
        headers: ["thScen", "thDesc", "thFixedVal", "thDomeVal"],
        rows: [
          [{ key: "trBestTitle" }, { key: "trBestDesc" }, { raw: "2.8mm / 1080p" }, { raw: "2.8mm / 1024p" }],
          [{ key: "trMeanTitle" }, { key: "trMeanDesc" }, { raw: "6.8mm / 1440p" }, { raw: "6.5mm / 1440p" }],
          [{ key: "trWorstTitle" }, { key: "trWorstDesc" }, { raw: "26mm / 4K" }, { raw: "68.2mm / 4K" }],
        ],
      },

      { type: "p", style: "modal-attribution", textKey: "scenImprovement" },

      // Statistical Analysis Section
      { type: "h3", textKey: "statsTitle" },
      { type: "p", textKey: "statsIntro" },

      { type: "h4", textKey: "statsLimitsTitle" },
      { type: "p", textKey: "statsLimits" },

      // Charts organized in accordions to save space
      { type: "h4", textKey: "statsChartsTitle" },
      {
        type: "accordion",
        titleKey: "",
        items: [
          { summaryKey: "chartFormatTitle", detailsKey: "chartFormatContent" },
          { summaryKey: "chartResTitle", detailsKey: "chartResContent" },
          { summaryKey: "chartFocalMinTitle", detailsKey: "chartFocalMinContent" },
          { summaryKey: "chartFocalAvgTitle", detailsKey: "chartFocalAvgContent" },
          { summaryKey: "chartFocalMaxTitle", detailsKey: "chartFocalMaxContent" },
        ],
      },
    ],
  },
  {
    id: "resources",
    labelKey: "menuResources",
    type: "modal",
    content: [
      { type: "h3", textKey: "menuResources" },

      // Learn More Section
      { type: "h4", textKey: "resLearnTitle" },

      // English / International
      { type: "p", style: "margin-bottom: 0; font-weight: bold;", textKey: "resLangEn" },
      {
        type: "list",
        items: [
          "resLearnEnL1",
          "resLearnEnL2",
          "resLearnEnL3",
          "resLearnEnL4",
          "resLearnEnL5",
          "resLearnEnL6",
          "resLearnEnL7",
          "resLearnEnL8",
          "resLearnEnL9",
        ],
      },

      // French
      { type: "p", style: "margin-bottom: 0; font-weight: bold;", textKey: "resLangFr" },
      {
        type: "list",
        items: ["resLearnFrL1", "resLearnFrL2", "resLearnFrL3", "resLearnFrL4", "resLearnFrL5"],
      },

      // Protection Section
      { type: "h3", textKey: "resProtectTitle" },
      { type: "p", style: "margin-bottom: 0;", textKey: "resProtectIRTitle" },
      { type: "list", items: ["resProtectIRL1", "resProtectIRL2"] },

      { type: "p", style: "margin-bottom: 0;", textKey: "resProtectAntiTitle" },
      { type: "list", items: ["resProtectAntiL1", "resProtectAntiL2", "resProtectAntiL3"] },

      { type: "p", style: "margin-bottom: 0;", textKey: "resProtectDisableTitle" },
      { type: "list", items: ["resProtectDisableL1", "resProtectDisableL2"] },

      { type: "p", textKey: "resProtectAction" },
      {
        type: "button",
        textKey: "resProtectBtn",
        url: "https://www.openstreetmap.org/",
        style: "primary",
      },

      // Inspirations
      { type: "h3", textKey: "resInspoTitle" },
      { type: "p", textKey: "resInspoP1" },
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
