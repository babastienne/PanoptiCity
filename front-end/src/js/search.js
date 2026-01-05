import { MAP_MAX_BBOX } from "../../CONFIG.js";
import { TEXTS, getUserLang } from "./language.js";

let debounceTimer;

const displayResults = (show) => {
  const container = document.getElementById("map-search-container");
  const resultsList = document.getElementById("search-results");
  if (show) {
    container.classList.add("has-results");
    resultsList.classList.remove("hidden");
  } else {
    container.classList.remove("has-results");
    resultsList.classList.add("hidden");
  }
};

export function initSearch(map) {
  const input = document.getElementById("search-input");
  const resultsList = document.getElementById("search-results");
  const actionBtn = document.getElementById("search-action-btn");
  const iconSearch = document.getElementById("icon-search");
  const iconClear = document.getElementById("icon-clear");

  // Translation
  input.placeholder = TEXTS.searchPlaceholder || "Search location...";

  // Prevent map interaction when using results list
  L.DomEvent.disableClickPropagation(resultsList);
  L.DomEvent.disableScrollPropagation(resultsList);

  const toggleIcons = () => {
    const hasText = input.value.trim().length > 0;
    iconSearch.classList.toggle("hidden", hasText);
    iconClear.classList.toggle("hidden", !hasText);
  };

  input.addEventListener("input", (e) => {
    toggleIcons();
    const query = e.target.value.trim();

    clearTimeout(debounceTimer);
    if (query.length < 1) {
      displayResults(false);
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchNominatim(query, resultsList, map);
    }, 250);
  });

  // Action Button logic (Clear on mobile/when text exists)
  actionBtn.addEventListener("click", () => {
    if (input.value.length > 0) {
      input.value = "";
      displayResults(false);
      toggleIcons();
      input.focus();
    }
  });
}

async function fetchNominatim(query, resultsList, map) {
  const north = MAP_MAX_BBOX[0][0];
  const east = MAP_MAX_BBOX[0][1];
  const south = MAP_MAX_BBOX[1][0];
  const west = MAP_MAX_BBOX[1][1];

  const input = document.getElementById("search-input");
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&` +
    `q=${encodeURIComponent(query)}&` +
    `viewbox=${west},${north},${east},${south}&` +
    `bounded=1&` + // This is exclusion of anything not in the bounding box. Set to 0 to prefer instead of filter.
    `limit=7`;

  try {
    const response = await fetch(url, { headers: { "Accept-Language": getUserLang() } });
    const data = await response.json();

    resultsList.innerHTML = "";
    if (data.length === 0) {
      displayResults(false);
      return;
    }

    data.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.display_name;
      li.onclick = () => {
        const bbox = item.boundingbox;
        const southWest = [parseFloat(bbox[0]), parseFloat(bbox[2])];
        const northEast = [parseFloat(bbox[1]), parseFloat(bbox[3])];
        const bounds = [southWest, northEast];

        map.fitBounds(bounds, {
          padding: [20, 20], // Adds 20px of space around the object
          maxZoom: 18, // Prevents zooming too close for tiny objects (like a pole)
        });

        displayResults(false);
        input.value = item.display_name;
      };
      resultsList.appendChild(li);
    });
    displayResults(true);
  } catch (err) {
    console.error("Search failed", err);
  }
}
