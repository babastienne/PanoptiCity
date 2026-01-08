import { removeCameraFOVDetail } from "./camera.js";
import { fovLayer } from "./map.js";
import { removeCreationMarkerFromMap, removeDirectionArrowFromMap } from "./contrib.js";

let map;
let isRightMode = false;
const isLaptop = () => window.innerWidth >= 1024;

export let initModal = (mapReference) => {
  map = mapReference;

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideBottomSheet();
    });
  }
};

// --- Utils functions ---

export const computeRenderedImageWidth = (minWidth, gap, numberImages, maxWidth) => {
  let widthModal = window.screen.width - 40; // 40 = padding for modal
  let numberOfDisaplyedImagesByRow = Math.floor(widthModal / (minWidth + gap));
  if (numberOfDisaplyedImagesByRow > numberImages) {
    numberOfDisaplyedImagesByRow = numberImages;
  }
  let widthModalWithoutGaps = widthModal - (numberOfDisaplyedImagesByRow - 1) * gap;
  let widthImage = Math.floor(widthModalWithoutGaps / numberOfDisaplyedImagesByRow);
  if (maxWidth < widthImage) {
    return maxWidth;
  }
  return Math.ceil(numberImages / numberOfDisaplyedImagesByRow) * widthImage;
};

const convertPXToSizeUnit = (px) => {
  // If on right, we use VW for width, otherwise VH for height
  const totalSize = isRightMode ? window.innerWidth : window.innerHeight;
  return (px / totalSize) * 100;
};

let convertPXToVH = (px) => (px / window.innerHeight) * 100;

const resetCameraFocusDisplay = () => {
  if (!map.hasLayer(fovLayer)) {
    fovLayer.addTo(map);
  }
  removeCameraFOVDetail();
};

const calculateNewHeight = (e) => {
  const delta = startY - getEventPosition(e);
  // On the right, dragging left (negative delta) increases width.
  // On the bottom, dragging up (negative delta) increases height.
  return startHeight + convertPXToSizeUnit(delta);
};

// --- Core functions ---

const bottomSheet = document.querySelector(".bottom-sheet");
const sheetContent = bottomSheet.querySelector(".content");
const bodyModal = bottomSheet.querySelector(".body-modal");
const dragIcon = bottomSheet.querySelector(".drag-icon");
const headerModal = bottomSheet.querySelector(".header-modal");
const mapSidebar = document.getElementById("map-sidebar");
const closeBtn = document.querySelector(".close-modal-btn");

let startY,
  previousY,
  startHeight,
  modalMaxHeight,
  moveBehindModal = null,
  dragModal = null;

export const showBottomModal = ({
  authorizeMoveBehindModal = false,
  authorizeDragModal = true,
  defaultHeight = 80,
  displayOnRight = false,
} = {}) => {
  // Start by reseting possible previous modal displays and components
  removeCreationMarkerFromMap();
  removeDirectionArrowFromMap();
  resetCameraFocusDisplay(); // Hide potential existing Camera Details
  resetEventListeners();
  clearModalActiveStates();
  if (isRightMode) {
    mapSidebar.style.right = "15px";
  }

  // Determine if we should actually display on the right
  isRightMode = displayOnRight && isLaptop();

  if (isRightMode) {
    bottomSheet.classList.add("display-right");
    sheetContent.style.maxHeight = "";
    sheetContent.style.maxWidth = "50vw";
    defaultHeight = 35;
  } else {
    bottomSheet.classList.remove("display-right");
  }

  let maxDisplayedHeight = Math.min(modalMaxHeight, defaultHeight);

  // Set variables
  moveBehindModal = authorizeMoveBehindModal;
  dragModal = authorizeDragModal;

  bottomSheet.classList.add("show");
  document.body.style.overflowY = "hidden";
  updateSheetHeight(maxDisplayedHeight);

  // Adapt display of contents depending on moveBehindModal value
  if (moveBehindModal) {
    bottomSheet.style.top = isRightMode ? "3.5rem" : "unset";
    bottomSheet.style.bottom = "0";
    bottomSheet.style.left = isRightMode ? "unset" : "0";
    bottomSheet.style.right = "0";
  } else {
    bottomSheet.style.maxHeight = "";
    bottomSheet.style.top = "0";
    bottomSheet.style.bottom = "unset";
  }

  // If drag is allowed, display drag button and add events handlers
  dragIcon.style.display = dragModal ? "" : "none";
  closeBtn.style.display = dragModal ? "flex" : "none";
  if (dragModal) {
    headerModal.addEventListener("mousedown", handleDraggingEvents);
    headerModal.addEventListener("touchstart", handleDraggingEvents);
    sheetContent.addEventListener("mousedown", handleDraggingContent);
    sheetContent.addEventListener("touchstart", handleDraggingContent);
    document.addEventListener("keydown", handleEscape);
    map.on("click", hideBottomSheet);
  }
};

const updateSheetHeight = (size) => {
  const root = document.documentElement;
  const unit = isRightMode ? "vw" : "vh";
  let realSize = isRightMode ? Math.min(50, size) : Math.min(modalMaxHeight, size);

  if (size > 20) {
    root.style.setProperty("--modal-size", `${size}${unit}`);
    if (isRightMode) {
      sheetContent.style.height = "100%";
      sheetContent.style.width = `${size}vw`;
      mapSidebar.style.right = `calc(${realSize}vw + 15px)`;
    } else {
      sheetContent.style.height = `${size}vh`;
      sheetContent.style.width = "100%";
    }
  }

  if (moveBehindModal) {
    bottomSheet.style.maxHeight = isRightMode ? "100vh" : `${realSize}vh`;
    bottomSheet.style.maxWidth = isRightMode ? `${realSize}vw` : "100vw";
  }

  // Map Resizing Logic
  const mapElem = document.getElementById("map");
  if (isRightMode) {
    mapElem.style.height = "calc(100vh - 3.5rem)";
    mapElem.style.width = `calc(100vw - ${realSize}vw)`;
  } else {
    mapElem.style.width = "100vw";
    mapElem.style.height = `calc(100vh - 3.5rem - ${realSize}vh)`;
  }
  map.invalidateSize();
};

export const hideBottomSheet = () => {
  const mapElem = document.getElementById("map");
  mapElem.style.height = "calc(100vh - 3.5rem)";
  mapElem.style.width = "100vw";
  if (isRightMode) {
    mapSidebar.style.right = "15px";
  }
  map.invalidateSize();
  bottomSheet.classList.remove("show");
  bottomSheet.classList.remove("display-right");
  document.body.style.overflowY = "auto";
  resetCameraFocusDisplay();
  resetEventListeners();
  clearModalActiveStates();
};

export const updateBottomModalContent = (content, { heightAdd = 0 } = {}) => {
  bodyModal.innerHTML = content;
  let maxHeightModal = bodyModal.children[0].scrollHeight + 120 + heightAdd;
  if (maxHeightModal > window.screen.height) {
    maxHeightModal = window.screen.height * 0.9;
  }
  modalMaxHeight = convertPXToVH(maxHeightModal);
  sheetContent.style.maxHeight = `${modalMaxHeight}vh`;
  sheetContent.style.maxWidth = "100vw";
};

// ---- EVENTS AND LISTENERS ----

const addDraggingEvents = (e, moveHandler, condition = () => true) => {
  const [moveEvent, stopEvent] = e.type === "mousedown" ? ["mousemove", "mouseup"] : ["touchmove", "touchend"];
  dragStart(e);

  if (condition()) {
    document.addEventListener(moveEvent, moveHandler);
  }

  const stopCallback = (e) => {
    dragStop();
    document.removeEventListener(moveEvent, moveHandler);
    document.removeEventListener(stopEvent, stopCallback);
  };

  document.addEventListener(stopEvent, stopCallback);
};

const handleDraggingEvents = (e) => addDraggingEvents(e, dragging);
const handleDraggingContent = (e) => addDraggingEvents(e, draggingToBottom, () => bodyModal.scrollTop === 0);

const dragStart = (e) => {
  startY = getEventPosition(e);
  previousY = startY;
  // Read from the CSS variable to get accurate current size
  const currentSizeStr = getComputedStyle(document.documentElement).getPropertyValue("--modal-size");
  startHeight = parseInt(currentSizeStr);
  bottomSheet.classList.add("dragging");
};

const getEventPosition = (e) => (isRightMode ? e.pageX || e.touches?.[0].pageX : e.pageY || e.touches?.[0].pageY);

const dragging = (e) => {
  updateSheetHeight(calculateNewHeight(e));
};

const draggingToBottom = (e) => {
  const currentY = getEventPosition(e);
  if (currentY > previousY) {
    updateSheetHeight(calculateNewHeight(e));
    previousY = currentY;
  }
};

const dragStop = () => {
  bottomSheet.classList.remove("dragging");
  let sheetMaxSize = parseInt(sheetContent.style.maxHeight);
  if (Number.isNaN(sheetMaxSize)) {
    sheetMaxSize = parseInt(sheetContent.style.maxWidth);
  }
  const currentSizeStr = getComputedStyle(document.documentElement).getPropertyValue("--modal-size");
  const currentSize = parseInt(currentSizeStr);
  let newSize = Math.min(sheetMaxSize, currentSize);
  if (Number.isNaN(newSize)) {
    newSize = currentSize;
  }

  if (newSize < 25) {
    hideBottomSheet();
  } else if (newSize > 85) {
    updateSheetHeight(100);
  } else {
    updateSheetHeight(newSize);
  }
};

const handleEscape = (evt) => {
  if (evt.key === "Escape" || evt.key === "Esc") {
    hideBottomSheet();
  }
};

const resetEventListeners = () => {
  if (dragModal) {
    headerModal.removeEventListener("mousedown", handleDraggingEvents);
    headerModal.removeEventListener("touchstart", handleDraggingEvents);
    sheetContent.removeEventListener("mousedown", handleDraggingContent);
    sheetContent.removeEventListener("touchstart", handleDraggingContent);
    document.removeEventListener("keydown", handleEscape);
    map.off("click", hideBottomSheet);
  }
};
