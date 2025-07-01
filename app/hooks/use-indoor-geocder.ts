import { useEffect, useRef } from "react";
import { IndoorGeocoder, POIFeature } from "~/utils/indoor-geocoder";
import pois from "~/data/pois.json";

export function useIndoorGeocoder() {
  const geocoderRef = useRef<IndoorGeocoder | null>(null);

  if (!geocoderRef.current) {
    geocoderRef.current = new IndoorGeocoder(
      pois.pois.features as POIFeature[],
    );
  }

  useEffect(() => {

    // const loadData = async () => {
    //   if (geocoderRef.current) {
    //     await geocoderRef.current.loadData();
    //   }
    // };
    // loadData();
  }, []);

  return geocoderRef.current;
}
