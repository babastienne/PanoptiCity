const computeRenderedImageWidth = (minWidth, gap, numberImages, maxWidth) => {
  let widthModal = window.screen.width - 40; // 40 = padding for modal
  let numberOfDisaplyedImagesByRow = Math.floor(widthModal / (minWidth + gap));
  if (numberOfDisaplyedImagesByRow > numberImages) {
    numberOfDisaplyedImagesByRow = numberImages;
  }
  let widthModalWithoutGaps =
    widthModal - (numberOfDisaplyedImagesByRow - 1) * gap;
  let widthImage = Math.floor(
    widthModalWithoutGaps / numberOfDisaplyedImagesByRow
  );
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

let isDragging = false,
  startY,
  startHeight;

const showBottomModal = (
  overlayClickHideModal = true,
  authorizeMoveBehindModal = false
) => {
  bottomSheet.classList.add("show");
  document.body.style.overflowY = "hidden";
  updateSheetHeight(80);
  if (overlayClickHideModal) {
    sheetOverlay.addEventListener("click", hideBottomSheet);
  } else {
    sheetOverlay.removeEventListener("click", hideBottomSheet);
  }
  if (authorizeMoveBehindModal) {
    sheetOverlay.style.opacity = "0";
    sheetOverlay.style.display = "none";
    dragIcon.style.display = "none";
    bottomSheet.style.maxHeight = sheetContent.style.maxHeight;
    bottomSheet.style.top = "unset";
    bottomSheet.style.bottom = "0";
  } else {
    sheetOverlay.style.opacity = "0.2";
    sheetOverlay.style.display = "";
    dragIcon.style.display = "";
    bottomSheet.style.maxHeight = "";
    bottomSheet.style.top = "0";
    bottomSheet.style.bottom = "unset";
  }
};

const updateSheetHeight = (height) => {
  sheetContent.style.height = `${height}vh`;
  bottomSheet.classList.toggle("fullscreen", height === 100);
};

const hideBottomSheet = () => {
  document.getElementById("map").style.height = `calc(100vh - 4rem)`;
  map.invalidateSize();
  bottomSheet.classList.remove("show");
  document.body.style.overflowY = "auto";
};

const dragStart = (e) => {
  isDragging = true;
  startY = e.pageY || e.touches?.[0].pageY;
  startHeight = parseInt(sheetContent.style.height);
  bottomSheet.classList.add("dragging");
};

const dragging = (e) => {
  if (!isDragging) return;
  const delta = startY - (e.pageY || e.touches?.[0].pageY);
  const newHeight = startHeight + (delta / window.innerHeight) * 100;
  updateSheetHeight(newHeight);
};

const dragStop = () => {
  isDragging = false;
  bottomSheet.classList.remove("dragging");
  const sheetHeight = parseInt(sheetContent.style.height);
  sheetHeight < 25
    ? hideBottomSheet()
    : sheetHeight > 90
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
    document
      .getElementById("map")
      .style.setProperty("height", `calc(100vh - 4rem - ${maxHeightModal}px)`);
    map.invalidateSize();
  }
};

dragIcon.addEventListener("mousedown", dragStart);
document.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);

dragIcon.addEventListener("touchstart", dragStart);
document.addEventListener("touchmove", dragging);
document.addEventListener("touchend", dragStop);
