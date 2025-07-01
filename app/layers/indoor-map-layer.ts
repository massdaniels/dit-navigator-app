import { CustomLayerInterface, Map } from "maplibre-gl";
import { IndoorFeature, IndoorMapGeoJSON } from "~/types/geojson";

export default class IndoorMapLayer implements CustomLayerInterface {
  id: string = "map-features";
  type = "custom" as const;
  private map: Map | null = null;
  private indoorMapData: IndoorMapGeoJSON;
  private theme;
  private hoveredRoomId: string | null = null;

  constructor(indoorMapData: IndoorMapGeoJSON, theme: string = "light") {
    this.indoorMapData = indoorMapData;
    this.theme = theme;
  }

  render = () => {
    // Rendering is handled by maplibre's internal renderer for geojson sources
  };

  async onAdd(map: Map): Promise<void> {
    this.map = map;

    const lightColor = {
      unit: "#f3f3f3",
      unit_hovered: "#e0e0e0",
      corridor: "#d6d5d1",
      outline: "#a6a5a2",
    };

    const darkColor = {
      unit: "#1f2937",
      unit_hovered: "#374151",
      corridor: "#030712",
      outline: "#1f2937",
    };

    const colors = this.theme === "dark" ? darkColor : lightColor;

    map.addSource("map-features", {
      type: "geojson",
      data: this.indoorMapData,
    });

    map.addLayer({
      id: "indoor-map-fill",
      type: "fill",
      source: "map-features",
      paint: {
        "fill-color": ["coalesce", ["get", "fill"], colors.corridor],
      },
      filter: ["==", ["geometry-type"], "Polygon"],
    });

    map.addLayer({
      id: "indoor-map-fill-outline",
      type: "line",
      source: "map-features",
      paint: {
        "line-color": ["coalesce", ["get", "stroke"], colors.outline],
        "line-width": ["coalesce", ["get", "stroke-width"], 2],
        "line-opacity": ["coalesce", ["get", "stroke-opacity"], 1],
      },
      filter: ["==", ["geometry-type"], "Polygon"],
    });

    map.addLayer({
      id: "indoor-map-extrusion",
      type: "fill-extrusion",
      source: "map-features",
      filter: ["all", ["==", "feature_type", "unit"]],
      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          colors.unit_hovered,
          colors.unit,
        ],
        'fill-extrusion-height': ['get', 'height'],
        "fill-extrusion-opacity": 1,
      },
    });

    map.addLayer({
      id: "indoor-map-fill-extrusion",
      type: "fill-extrusion",
      source: "map-features",
      filter: ["all", ["==", "feature_type", "corridor"]],
      paint: {
        "fill-extrusion-color": colors.corridor,
        "fill-extrusion-height": 0.2,
        "fill-extrusion-opacity": 1,
      },
    });

    map.on("mousemove", "indoor-map-extrusion", (e) => {
      if (e.features && e.features.length > 0) {
        // Clear previous hover state if needed
        if (this.hoveredRoomId !== null) {
          map.setFeatureState(
            { source: "map-features", id: this.hoveredRoomId },
            { hover: false },
          );
        }
        this.hoveredRoomId = e.features[0].id as string;
        map.setFeatureState(
          { source: "map-features", id: this.hoveredRoomId },
          { hover: true },
        );
      }
    });

    map.on("mouseleave", "indoor-map-extrusion", () => {
      if (this.hoveredRoomId !== null) {
        map.setFeatureState(
          { source: "map-features", id: this.hoveredRoomId },
          { hover: false },
        );
        this.hoveredRoomId = null;
      }
    });
  }
}
