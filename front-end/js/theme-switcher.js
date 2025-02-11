const themeSwitcher = {
  // Config
  _scheme: "auto",
  buttonAttribute: "data-theme-switcher",
  rootAttribute: "data-theme",
  localStorageKey: "preferredColorScheme",

  // Init
  init() {
    this.button = document.querySelector("div[data-theme-switcher]");
    this.scheme = this.schemeFromLocalStorage;
    this.initSwitcher();
  },

  // Get color scheme from local storage
  get schemeFromLocalStorage() {
    return window.localStorage?.getItem(this.localStorageKey) ?? this._scheme;
  },

  // Preferred color scheme
  get preferredColorScheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },

  // Init switchers
  initSwitcher() {
    const button = document.querySelector("div[data-theme-switcher]");
    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        // Set scheme
        this.scheme = this._scheme == "dark" ? "light" : "dark";
      },
      false
    );
  },

  // Set scheme
  set scheme(scheme) {
    if (scheme == "auto") {
      this._scheme = this.preferredColorScheme;
    } else if (scheme == "dark" || scheme == "light") {
      this._scheme = scheme;
    }
    if (scheme == "dark") {
      console.log("switch to light");
      layerSwitcherDark.options.basemaps.forEach((e) => {
        map.removeLayer(e);
      });
      map.removeControl(layerSwitcherDark);
      map.addControl(layerSwitcherLight);
      this.button.classList.remove("theme-toggle--toggled");
    } else {
      console.log("switch to dark");
      layerSwitcherLight.options.basemaps.forEach((e) => {
        map.removeLayer(e);
      });
      map.removeControl(layerSwitcherLight);
      map.addControl(layerSwitcherDark);
      this.button.classList.add("theme-toggle--toggled");
    }
    this.applyScheme();
    this.schemeToLocalStorage();
  },

  // Get scheme
  get scheme() {
    return this._scheme;
  },

  // Apply scheme
  applyScheme() {
    document
      .querySelector("html")
      ?.setAttribute(this.rootAttribute, this.scheme);
  },

  // Store scheme to local storage
  schemeToLocalStorage() {
    window.localStorage?.setItem(this.localStorageKey, this.scheme);
  },
};

// Init
themeSwitcher.init();
