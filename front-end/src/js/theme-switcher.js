/**
 * THEME SWITCHER MODULE
 * Manages light/dark mode preference and UI updates.
 */

const STORAGE_KEY = "pano-theme-preference";

/**
 * Gets the initial theme based on:
 * 1. Saved preference in LocalStorage
 * 2. System preference (prefers-color-scheme)
 * 3. Default to 'light'
 */
const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme) return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Applies the theme to the document and saves it
 */
const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);

  // Update the toggle button visual state if it exists
  const toggleBtn = document.getElementById("tr-themeToggle");
  if (toggleBtn) {
    // Based on your CSS, we toggle this class to trigger the SVG animation
    if (theme === "dark") {
      toggleBtn.classList.add("theme-toggle--toggled");
    } else {
      toggleBtn.classList.remove("theme-toggle--toggled");
    }
  }
};

/**
 * Initialization function to be called by app.js
 */
export const initTheme = () => {
  const toggleBtn = document.getElementById("tr-themeToggle");
  let currentTheme = getPreferredTheme();

  // Set initial state
  applyTheme(currentTheme);
  window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme: currentTheme } }));

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(currentTheme);

      // Dispatch a custom event so other modules (like Map)
      // can react to theme changes if necessary
      window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme: currentTheme } }));
    });
  }

  // Listen for system changes (if user changes OS theme while app is open)
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
};
