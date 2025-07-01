

import "@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css";
import maplibregl, { FullscreenControl, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Suspense, useEffect, useMemo, useRef } from "react";
import config from "~/config";
import IndoorMapLayer from "~/layers/indoor-map-layer";
import POIsLayer from "~/layers/pois-layer";
import map from "~/data/map.json";
import useMapStore from "~/stores/use-map-store";
import { IndoorMapGeoJSON } from "~/types/geojson";
import pois from "~/data/pois.json"
import buildings from "~/mock/buildings.json"
import { Theme, useTheme } from "remix-themes";
import "~/maplibre.css";
import { Shell } from "~/components/dashboard/shell";
import { Skeleton } from "~/components/ui/skeleton";

export default function MapEditor() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [theme] = useTheme();

  const setMapInstance = useMapStore((state) => state.setMapInstance);
  const indoorMapLayer = useMemo(
    () =>
      new IndoorMapLayer(
        map.map_features as IndoorMapGeoJSON,
        theme as string,
      ),
    [theme],
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      ...config.mapConfig,
      style: config.mapStyles[theme as Theme],
      container: mapContainer.current,
    });
    setMapInstance(map);

    map.on("load", () => {
      try {
        map.addLayer(indoorMapLayer);
        map.addLayer(
          new POIsLayer(pois.pois as GeoJSON.GeoJSON, theme as string),
        );
      } catch (error) {
        console.error("Failed to initialize map layers:", error);
      }
    });

    map.addControl(new NavigationControl(), "bottom-right");
    map.addControl(new FullscreenControl(), "bottom-right");


    return () => {
      map.remove();
    };
  }, [indoorMapLayer, setMapInstance, theme]);

  return (
    <Suspense
      fallback={
        <Skeleton className="h-[calc(75vh-220px)] rounded-md border" />
      }
    >
    <Shell variant="sidebar" className="flex size-full flex-col">
      <div ref={mapContainer} className="size-full" />
    </Shell>
    </Suspense>
  );
}
