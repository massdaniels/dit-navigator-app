export interface IndoorFeatureProperties {
  
  [key: string]: unknown;
}

export interface IndoorFeature extends GeoJSON.Feature {
  properties: IndoorFeatureProperties;
}


export interface IndoorMapGeoJSON extends FeatureCollection<MapFeatureGeometry, MapFeatureProperties> {
  // It's explicitly a FeatureCollection containing MapFeatures
  features: MapFeature[];
  type: "FeatureCollection";
}
// app/types/geojson.ts

import { Feature, FeatureCollection, Geometry, Point, LineString, Polygon, MultiLineString, MultiPoint } from 'geojson'; // npm install --save-dev @types/geojson

// Extend GeoJSON Feature properties with your specific properties
export interface MapFeatureProperties {
  name: string;
  feature_type: string; // Renamed from 'feature_type' to align with Category model
  show: boolean;
  height: number;
}

export type MapFeatureGeometry = Point | LineString | Polygon | MultiPoint | MultiLineString;

// Your specific MapFeature type
export interface MapFeature extends Feature<MapFeatureGeometry, MapFeatureProperties> {
  id: string; // Ensure ID is a string for consistency (UUID)
}

// The overall structure of your GeoJSON file
export interface MapGeoJSONFile {
  map_features: {
    type: "FeatureCollection";
    features: MapFeature[];
  };
}

// --- NEW POI TYPES ---

// Extend GeoJSON Feature properties with your specific POI properties
export interface PoiProperties {
  id: string; // Your example has 'id' inside properties, so we'll reflect that
  name: string;
  category: string; // Matches the 'category' property name in your example
  floor: number;
}

export interface PoiFeature extends Feature<Point, PoiProperties> {
  id: string; // This will be the UUID for CRUD operations
}

// The overall structure of your POI GeoJSON file
export interface PoiGeoJSONFile {
  pois: {
    type: "FeatureCollection";
    features: PoiFeature[];
  };
}

// --- NEW ROUTE TYPES ---

// Properties for a Route (LineString)
export interface RouteProperties {
  name: string;
  // We'll manage 'name' only. Other properties like styleUrl, stroke, stroke-opacity, stroke-width
  // will be set to default values if not explicitly managed in the form.
  // For simplicity, we'll omit them from the form and let the server assign defaults.
  styleUrl?: string;
  "stroke-opacity"?: number;
  stroke?: string;
  "stroke-width"?: number;
}

export interface RouteFeature extends Feature<LineString, RouteProperties> {
  // Routes will also use a UUID for their top-level Feature ID for robust CRUD.
  id: string;
}

// The overall structure of your Route GeoJSON file
export interface RouteGeoJSONFile {
  routes: {
    type: "FeatureCollection";
    features: RouteFeature[];
  };
}