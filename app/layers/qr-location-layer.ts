// ~/layers/qr-location-layer.ts
import maplibregl, { CustomLayerInterface, Map } from "maplibre-gl"; // <--- ADD THIS IMPORT
// You can also explicitly import Popup if you prefer:
// import maplibregl, { CustomLayerInterface, Map, Popup } from "maplibregl";

import { IndoorFeature, IndoorMapGeoJSON } from "~/types/geojson"; // Assuming this is correct from your previous code

export interface QrLocationGeoJSON extends GeoJSON.FeatureCollection {
  features: [GeoJSON.Feature<GeoJSON.Point>]; // Expecting a FeatureCollection with one Point feature
}

export default class QrLocationLayer implements CustomLayerInterface {
  id: string = "qr-location-point";
  type = "custom" as const;
  private map: Map | null = null;
  private qrData: QrLocationGeoJSON;

  constructor(qrData: QrLocationGeoJSON) {
    this.qrData = qrData;
  }
  render() {}
  // onAdd is called when the layer is added to the map.
  async onAdd(map: Map): Promise<void> {
    this.map = map;

    // Check if source already exists (e.g., on hot module reload)
    if (map.getSource("qr-location-source")) {
      map.removeLayer(this.id);
      map.removeSource("qr-location-source");
    }

    map.addSource("qr-location-source", {
      type: "geojson",
      data: this.qrData,
    });

    // Add a circle layer for the QR location
    map.addLayer({
      id: this.id,
      type: "circle",
      source: "qr-location-source",
      paint: {
        "circle-color": "#FF0000",
        "circle-radius": 10,
        "circle-stroke-color": "#FFFFFF",
        "circle-stroke-width": 2,
        "circle-opacity": 0.8,
      },
    });

    // Optional: Add a text label layer if you want to display the coordinates
    // map.addLayer({
    //   id: `${this.id}-label`,
    //   type: "symbol",
    //   source: "qr-location-source",
    //   layout: {
    //     "text-field": ["get", "label"],
    //     "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    //     "text-size": 12,
    //     "text-offset": [0, -1.5],
    //     "text-anchor": "bottom",
    //   },
    //   paint: {
    //     "text-color": "#000000",
    //     "text-halo-color": "#FFFFFF",
    //     "text-halo-width": 1,
    //   },
    // });

    // Add a click listener for a popup
    map.on('click', this.id, (e) => {
        if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const coordinates = feature.geometry.type === 'Point' ? feature.geometry.coordinates : null;
            const description = feature.properties?.label || `Scanned Location: ${coordinates?.[1].toFixed(4)}, ${coordinates?.[0].toFixed(4)}`;

            if (coordinates) {
                // The error is here, you need to import maplibregl first
                new maplibregl.Popup() // <--- This now correctly refers to the imported maplibregl
                    .setLngLat(coordinates as [number, number])
                    .setHTML(`<strong>${description}</strong>`)
                    .addTo(map);
            }
        }
    });
  }

  // onRemove is called when the layer is removed from the map.
  onRemove(map: Map): void {
    if (map.getLayer(this.id)) {
      map.removeLayer(this.id);
    }
    if (map.getLayer(`${this.id}-label`)) {
      map.removeLayer(`${this.id}-label`);
    }
    if (map.getSource("qr-location-source")) {
      map.removeSource("qr-location-source");
    }
    this.map = null;
  }


}