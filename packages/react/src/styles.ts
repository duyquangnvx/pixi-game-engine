const STYLE_ID = "studio-core-styles";

const CSS = `
#ui-root {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  pointer-events: none;
}
#ui-root :where(button, input, select, textarea, a, [data-pe="auto"]) {
  pointer-events: auto;
}
`;

export function injectBaseStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
