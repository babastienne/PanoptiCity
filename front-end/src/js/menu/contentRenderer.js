import { TEXTS, MENU_TEXTS } from "../language.js";

export const renderBlocks = (blocks) => {
  let style;
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h3":
          return `<h3>${MENU_TEXTS[block.textKey]}</h3>`;
        case "h4":
          return `<h4>${MENU_TEXTS[block.textKey]}</h4>`;
        case "p":
          style = block.style || "";
          return `<p class="${style}">${MENU_TEXTS[block.textKey]}</p>`;
        case "img":
          return `<img src="${block.src}" alt="${MENU_TEXTS[block.altKey] || ""}" class="modal-rich-img">`;
        case "accordion":
          const items = block.items
            .map(
              (item) => `
          <details>
            <summary>${MENU_TEXTS[item.summaryKey]}</summary>
            <p>${MENU_TEXTS[item.detailsKey]}</p>
          </details>
        `
            )
            .join("");
          return `<div class="pico-accordion"><strong>${MENU_TEXTS[block.titleKey] || ""}</strong>${items}</div>`;

        case "button":
          style = block.style || "";

          if (block.url) {
            return `<a href="${block.url}" target="_blank" role="button" class="${style} modal-button">${
              MENU_TEXTS[block.textKey]
            }</a>`;
          }

          if (block.actionId) {
            return `<button class="${style} modal-button" onclick="window.handleMenuAction('${block.actionId}')">${
              MENU_TEXTS[block.textKey]
            }</button>`;
          }

          return `<button class="${style} modal-button">${MENU_TEXTS[block.textKey]}</button>`;

        case "attribution":
          const links = block.items
            .map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.text}</a>`)
            .join(", ");

          return `<small class="modal-attribution">${TEXTS.by} ${links}</small>`;

        case "list":
          const listTag = block.ordered ? "ol" : "ul";
          const listItems = block.items.map((itemKey) => `<li>${MENU_TEXTS[itemKey]}</li>`).join("");

          return `<${listTag} class="modal-list">${listItems}</${listTag}>`;

        case "table":
          const headers = block.headers.map((h) => `<th>${MENU_TEXTS[h]}</th>`).join("");
          const rows = block.rows
            .map((row) => {
              const cells = row.map((cell) => `<td>${cell.key ? MENU_TEXTS[cell.key] : cell.raw || ""}</td>`).join("");
              return `<tr>${cells}</tr>`;
            })
            .join("");
          return `<table class="modal-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;

        default:
          return "";
      }
    })
    .join("");
};
