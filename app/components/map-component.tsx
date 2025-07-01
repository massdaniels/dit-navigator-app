// app/components/map/map-component.tsx

import "@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css";
import maplibregl, { FullscreenControl, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef } from "react";
import config from "~/config";
import IndoorMapLayer from "~/layers/indoor-map-layer";
import POIsLayer from "~/layers/pois-layer";
import useMapStore from "~/stores/use-map-store";
import DiscoveryPanel from "./discovery-panel/discovery-panel";
import { IndoorMapGeoJSON, MapFeature, PoiFeature, RouteFeature } from "~/types/geojson";
import FloorBanner from "./footer-banner";
import OIMLogo from "../controls/map-logo";
import { Theme, useTheme } from "remix-themes";
import "~/maplibre.css";
import QrLocationLayer, { QrLocationGeoJSON } from "~/layers/qr-location-layer";

interface MapComponentProps {
  mapFeatures: MapFeature[]; // Filtered building data
  poiFeatures: PoiFeature[]; // All POI data
  routeFeatures: RouteFeature[]; // All Route data
  qrLat?: number; // Latitude from QR code (optional)
  qrLon?: number; // Longitude from QR code (optional)
}

export default function MapComponent({ mapFeatures, poiFeatures, qrLat, qrLon }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();
  const setMapInstance = useMapStore((state) => state.setMapInstance);
  // qrLocationMarkerRef is no longer needed if using a layer
  // const qrLocationMarkerRef = useRef<maplibregl.Marker | null>(null);

  console.log("MapComponent: Props received - qrLat:", qrLat, "qrLon:", qrLon);

  const indoorMapGeoJSON: IndoorMapGeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: mapFeatures,
  }), [mapFeatures]);

  const indoorMapLayer = useMemo(
    () => new IndoorMapLayer(indoorMapGeoJSON, theme as string),
    [indoorMapGeoJSON, theme],
  );

  const poisGeoJSON: GeoJSON.GeoJSON = useMemo(() => ({
    type: "FeatureCollection",
    features: poiFeatures,
  }), [poiFeatures]);

  // NEW: Memoize the QrLocationGeoJSON
  const qrLocationGeoJSON: QrLocationGeoJSON | null = useMemo(() => {
    if (typeof qrLat === 'number' && typeof qrLon === 'number') {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [qrLon, qrLat],
            },
            properties: {
              label: `QR Location`, // Optional label for the point
              // Add other properties if needed for styling or info
            },
          },
        ],
      };
    }
    return null;
  }, [qrLat, qrLon]);

  // NEW: Memoize the QrLocationLayer
  const qrLocationLayer = useMemo(
    () => qrLocationGeoJSON ? new QrLocationLayer(qrLocationGeoJSON) : null,
    [qrLocationGeoJSON]
  );


  // --- Main Map Initialization useEffect ---
// app/components/map/map-component.tsx

// ... (existing imports and code above)

  // --- Main Map Initialization useEffect ---
  useEffect(() => {
    console.log("MapComponent Main useEffect: Initializing map...");
    if (!mapContainer.current) return;

    if ((mapContainer.current as any).maplibreglMap) {
      console.log("MapComponent Main useEffect: Map already initialized.");
      return;
    }

    const map = new maplibregl.Map({
      ...config.mapConfig,
      style: config.mapStyles[theme as Theme],
      container: mapContainer.current,
    });
    (mapContainer.current as any).maplibreglMap = map;

    setMapInstance(map);

    map.on("load", () => {
      console.log("MapComponent Main useEffect: Map loaded!");
      console.log("MapComponent Main useEffect: map.isStyleLoaded() after 'load' event:", map.isStyleLoaded());
      try {
        map.addLayer(indoorMapLayer);
        map.addLayer(new POIsLayer(poisGeoJSON, theme as string));

        if (qrLocationLayer) {
          // map.addLayer(qrLocationLayer); already mapped from the qr code layer
          if (qrLocationGeoJSON && qrLocationGeoJSON.features.length > 0) {
            const coords = qrLocationGeoJSON.features[0].geometry.coordinates;
            map.flyTo({ center: coords as [number, number], zoom: 30, essential: true });
            console.log("MapComponent: Flew to QR location on map load.");
          }
        }

      } catch (error) {
        console.error("MapComponent Main useEffect: Failed to initialize map layers:", error);
      }
    });

    console.log("MapComponent Main useEffect: initial map.isStyleLoaded() status:", map.isStyleLoaded());


    map.addControl(new NavigationControl(), "bottom-right");
    map.addControl(new FullscreenControl(), "bottom-right");
    map.addControl(new OIMLogo());

    // --- REVISED CLEANUP FUNCTION ---
    return () => {
      console.log("MapComponent Main useEffect: Cleaning up map.");
      const mapInstance = (mapContainer.current as any)?.maplibreglMap as maplibregl.Map | undefined;

      if (mapInstance) { // Ensure map instance exists
        // Check if the map's style is loaded before attempting to remove individual layers/sources.
        // This is crucial to avoid "Style is not done loading" error.
        if (mapInstance.isStyleLoaded()) {
            // Remove QR layers/source
            if (qrLocationLayer) {
                console.log("MapComponent Main useEffect: Removing qrLocationLayer.");
                if (mapInstance.getLayer(qrLocationLayer.id)) mapInstance.removeLayer(qrLocationLayer.id);
                if (mapInstance.getLayer(`${qrLocationLayer.id}-label`)) mapInstance.removeLayer(`${qrLocationLayer.id}-label`);
                if (mapInstance.getSource("qr-location-source")) mapInstance.removeSource("qr-location-source");
            }

            // You might need to add similar checks for other layers/sources if they cause errors too
            // Example for indoor-map layers (adjust IDs based on your actual layer IDs in IndoorMapLayer):
            if (mapInstance.getLayer("indoor-map-fill")) mapInstance.removeLayer("indoor-map-fill");
            if (mapInstance.getLayer("indoor-map-fill-outline")) mapInstance.removeLayer("indoor-map-fill-outline");
            if (mapInstance.getLayer("indoor-map-extrusion")) mapInstance.removeLayer("indoor-map-extrusion");
            if (mapInstance.getLayer("indoor-map-fill-extrusion")) mapInstance.removeLayer("indoor-map-fill-extrusion");
            if (mapInstance.getSource("map-features")) mapInstance.removeSource("map-features"); // Assuming your source ID
            // ... and for POIs if needed
        } else {
            console.warn("MapComponent Main useEffect: Map style not loaded during cleanup, skipping explicit layer/source removal.");
        }

        // Always remove the map instance itself, regardless of style load status.
        // This will clean up most resources.
        mapInstance.remove();
        (mapContainer.current as any).maplibreglMap = null; // Clear the ref's stored map
      }
    };
  }, [indoorMapLayer, setMapInstance, theme, poisGeoJSON, qrLocationLayer, qrLocationGeoJSON]); // Keep dependencies as before

// ... (rest of the component code)
  // --- REMOVE THE OLD QR CODE MARKER useEffect ---
  // The QR marker logic is now integrated into the main useEffect
  // useEffect(() => { ... }, [qrLat, qrLon]);


  return (
    <div className="flex size-full flex-col">
      <DiscoveryPanel />
      <div ref={mapContainer} className="size-full" />
      <FloorBanner />
    </div>
  );
}