const computeRenderedImageWidth = (minWidth, gap, numberImages, maxWidth) => {
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

const bottomSheet = document.querySelector(".bottom-sheet");
const sheetOverlay = bottomSheet.querySelector(".sheet-overlay");
const sheetContent = bottomSheet.querySelector(".content");
const bodyModal = bottomSheet.querySelector(".body-modal");
const dragIcon = bottomSheet.querySelector(".drag-icon");
const headerModal = bottomSheet.querySelector(".header-modal");

let allowHiding = true,
  startY,
  previousY,
  startHeight,
  moveBehindModal = null,
  dragModal = null;

const showBottomModal = (
  overlayClickHideModal = true,
  authorizeMoveBehindModal = false,
  authorizeDragModal = true,
  defaultHeight = 80
) => {
  allowHiding = overlayClickHideModal;
  moveBehindModal = authorizeMoveBehindModal;
  dragModal = authorizeDragModal;

  bottomSheet.classList.add("show");
  document.body.style.overflowY = "hidden";
  updateSheetHeight(defaultHeight);

  if (overlayClickHideModal) {
    sheetOverlay.addEventListener("click", hideBottomSheet);
  }

  // Adapt display of contents depending on authorizeMoveBehindModal value
  sheetOverlay.style.opacity = authorizeMoveBehindModal ? "0" : "0.2";
  sheetOverlay.style.display = authorizeMoveBehindModal ? "none" : "";
  bottomSheet.style.maxHeight = authorizeMoveBehindModal ? sheetContent.style.height : "";
  bottomSheet.style.top = authorizeMoveBehindModal ? "unset" : "0";
  bottomSheet.style.bottom = authorizeMoveBehindModal ? "0" : "unset";

  // If drag is allowed, display drag button and add events handlers
  dragIcon.style.display = authorizeDragModal ? "" : "none";
  if (authorizeDragModal) {
    headerModal.addEventListener("mousedown", handleDraggingEvents);
    headerModal.addEventListener("touchstart", handleDraggingEvents);
    sheetContent.addEventListener("mousedown", handleDraggingContent);
    sheetContent.addEventListener("touchstart", handleDraggingContent);
    // Add event listener on escpe key to call hideBottomSheet if pressed
    document.onkeydown = function (evt) {
      evt = evt || window.event;
      if (evt.key === "Escape" || evt.key === "Esc") {
        hideBottomSheet();
      }
    };
  }
};

const updateSheetHeight = (height) => {
  if (allowHiding || height > 20) {
    sheetContent.style.height = `${height}vh`;
  }
  if (moveBehindModal && !dragModal) {
    bottomSheet.style.maxHeight = sheetContent.style.maxHeight;
    sheetContent.style.height = sheetContent.style.maxHeight;
  } else if (moveBehindModal && dragModal) {
    bottomSheet.style.maxHeight = sheetContent.style.height;
  }
};

const hideBottomSheet = () => {
  document.getElementById("map").style.height = `calc(100vh - 4rem)`;
  map.invalidateSize();
  bottomSheet.classList.remove("show");
  document.body.style.overflowY = "auto";
  removeCameraFOVDetail();
  if (allowHiding) {
    sheetOverlay.removeEventListener("click", hideBottomSheet);
  }
  if (dragModal) {
    headerModal.removeEventListener("mousedown", handleDraggingEvents);
    headerModal.removeEventListener("touchstart", handleDraggingEvents);
    sheetContent.removeEventListener("mousedown", handleDraggingContent);
    sheetContent.removeEventListener("touchstart", handleDraggingContent);
  }
  // Remove on key down listener
  document.onkeydown = null;
};

const dragStart = (e) => {
  startY = e.pageY || e.touches?.[0].pageY;
  previousY = startY;
  startHeight = parseInt(sheetContent.style.height);
  bottomSheet.classList.add("dragging");
};

const getEventPosition = (e) => e.pageY || e.touches?.[0].pageY;

const calculateNewHeight = (e) => {
  const delta = startY - getEventPosition(e);
  return startHeight + (delta / window.innerHeight) * 100;
};

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

const updateBottomModalContent = (content, heightAdd = 0, adaptMap = false) => {
  bodyModal.innerHTML = content;
  let maxHeightModal = bodyModal.children[0].scrollHeight + 120 + heightAdd;
  if (maxHeightModal > window.screen.height) {
    maxHeightModal = window.screen.height * 0.9;
  }
  sheetContent.style.maxHeight = `${maxHeightModal}px`;
  if (adaptMap) {
    document.getElementById("map").style.setProperty("height", `calc(100vh - 4rem - ${maxHeightModal}px)`);
    map.invalidateSize();
  }
};

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
