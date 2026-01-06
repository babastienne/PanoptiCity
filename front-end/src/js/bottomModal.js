import { removeCameraFOVDetail } from "./camera.js";
import { fovLayer } from "./map.js";
import { removeCreationMarkerFromMap, removeDirectionArrowFromMap } from "./contrib.js";

let map;

export let initModal = (mapReference) => {
  map = mapReference;
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

let convertPXToVH = (px) => (px / window.innerHeight) * 100;

let resetCameraFocusDisplay = () => {
  if (!map.hasLayer(fovLayer)) {
    fovLayer.addTo(map);
  }
  removeCameraFOVDetail();
};

const calculateNewHeight = (e) => {
  const delta = startY - getEventPosition(e);
  return startHeight + convertPXToVH(delta);
};

// --- Core functions ---

const bottomSheet = document.querySelector(".bottom-sheet");
const sheetContent = bottomSheet.querySelector(".content");
const bodyModal = bottomSheet.querySelector(".body-modal");
const dragIcon = bottomSheet.querySelector(".drag-icon");
const headerModal = bottomSheet.querySelector(".header-modal");

let allowHiding = true,
  startY,
  previousY,
  startHeight,
  modalMaxHeight,
  moveBehindModal = null,
  dragModal = null;

export const showBottomModal = ({
  authorizeClosingModal = true,
  authorizeMoveBehindModal = false,
  authorizeDragModal = true,
  defaultHeight = 80,
} = {}) => {
  // Start by reseting possible previous modal displays and components
  removeCreationMarkerFromMap();
  removeDirectionArrowFromMap();
  resetCameraFocusDisplay(); // Hide potential existing Camera Details
  resetEventListeners();

  // Set variables
  allowHiding = authorizeClosingModal;
  moveBehindModal = authorizeMoveBehindModal;
  dragModal = authorizeDragModal;

  bottomSheet.classList.add("show");
  document.body.style.overflowY = "hidden";
  updateSheetHeight(defaultHeight);

  // Adapt display of contents depending on moveBehindModal value
  if (moveBehindModal) {
    bottomSheet.style.top = "unset";
    bottomSheet.style.bottom = "0";
  } else {
    bottomSheet.style.maxHeight = "";
    bottomSheet.style.top = "0";
    bottomSheet.style.bottom = "unset";
  }

  // If drag is allowed, display drag button and add events handlers
  dragIcon.style.display = dragModal ? "" : "none";
  if (dragModal) {
    headerModal.addEventListener("mousedown", handleDraggingEvents);
    headerModal.addEventListener("touchstart", handleDraggingEvents);
    sheetContent.addEventListener("mousedown", handleDraggingContent);
    sheetContent.addEventListener("touchstart", handleDraggingContent);
    document.addEventListener("keydown", handleEscape);
    map.on("click", hideBottomSheet);
  }

  document
    .getElementById("map")
    .style.setProperty("height", `calc(100vh - 3.5rem - ${Math.min(modalMaxHeight, defaultHeight)}vh)`);
  map.invalidateSize();
};

const updateSheetHeight = (height) => {
  if (allowHiding || height > 20) {
    sheetContent.style.height = `${height}vh`;
  }
  let realModalHeight = modalMaxHeight > height ? height : modalMaxHeight;
  if (moveBehindModal && !dragModal) {
    bottomSheet.style.maxHeight = sheetContent.style.maxHeight;
    sheetContent.style.height = sheetContent.style.maxHeight;
  } else if (moveBehindModal && dragModal) {
    bottomSheet.style.maxHeight = `${realModalHeight}vh`;
  }
  document.getElementById("map").style.setProperty("height", `calc(100vh - 3.5rem - ${realModalHeight}vh)`);
  map.invalidateSize();
};

export const hideBottomSheet = () => {
  document.getElementById("map").style.height = `calc(100vh - 3.5rem)`;
  map.invalidateSize();
  bottomSheet.classList.remove("show");
  document.body.style.overflowY = "auto";
  resetCameraFocusDisplay();
  resetEventListeners();
};

export const updateBottomModalContent = (content, { heightAdd = 0 } = {}) => {
  bodyModal.innerHTML = content;
  let maxHeightModal = bodyModal.children[0].scrollHeight + 120 + heightAdd;
  if (maxHeightModal > window.screen.height) {
    maxHeightModal = window.screen.height * 0.9;
  }
  modalMaxHeight = convertPXToVH(maxHeightModal);
  sheetContent.style.maxHeight = `${modalMaxHeight}vh`;
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
  startY = e.pageY || e.touches?.[0].pageY;
  previousY = startY;
  startHeight = parseInt(sheetContent.style.height);
  bottomSheet.classList.add("dragging");
};

const getEventPosition = (e) => e.pageY || e.touches?.[0].pageY;

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
  const sheetHeight = parseInt(sheetContent.style.height);
  sheetHeight < 25 && allowHiding
    ? hideBottomSheet()
    : sheetHeight > 85
    ? updateSheetHeight(100)
    : updateSheetHeight(sheetHeight);
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
