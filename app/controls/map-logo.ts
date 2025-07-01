import { ControlPosition, IControl } from "maplibre-gl";
import { siteConfig } from "./site";

export default class OIMLogo implements IControl {
  private container!: HTMLDivElement;

  getDefaultPosition(): ControlPosition {
    return "bottom-left";
  }

  onAdd(): HTMLElement {
    this.container = document.createElement("div");
    this.container.className = "mapboxgl-ctrl";
    this.container.style.pointerEvents = "auto";
    this.container.innerHTML = `
    <a 
      href=""
      class="flex items-center space-x-1 p-2"
      aria-label="DITNavigatorApp">
      <img src=${siteConfig.logo} alt="DITNavigatorApp" class="h-7 w-auto" />
      <span class="hidden h-7 text-lg w-auto dark:invert md:block"> ${siteConfig.name} </span>
    </a>
    `;
    return this.container;
  }

  onRemove(): void {
    this.container.remove();
  }
}
