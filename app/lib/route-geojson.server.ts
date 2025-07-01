// app/lib/route-geojson.server.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { RouteGeoJSONFile, RouteFeature, RouteProperties } from '~/types/geojson';
import { v4 as uuidv4 } from 'uuid';
import { LineString } from 'geojson';

const ROUTE_GEOJSON_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'routes.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(ROUTE_GEOJSON_FILE_PATH);
  await fs.mkdir(dataDir, { recursive: true });
}

// Initialize the file if it doesn't exist
async function initializeRouteGeojsonFile() {
  await ensureDataDirectory();
  try {
    await fs.access(ROUTE_GEOJSON_FILE_PATH);
  } catch (error) {
    // File does not exist, create it with an empty structure
    const initialData: RouteGeoJSONFile = {
      routes: {
        type: "FeatureCollection",
        features: [],
      },
    };
    await fs.writeFile(ROUTE_GEOJSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Initialized empty routes.geojson file.");
  }
}

// Read the Route GeoJSON file
export async function getRouteFeatures(): Promise<RouteFeature[]> {
  await initializeRouteGeojsonFile();
  try {
    const data = await fs.readFile(ROUTE_GEOJSON_FILE_PATH, 'utf-8');
    const geojsonData: RouteGeoJSONFile = JSON.parse(data);
    return geojsonData.routes.features;
  } catch (error) {
    console.error("Error reading routes.geojson:", error);
    return [];
  }
}

// Write the Route GeoJSON features back to the file
export async function writeRouteFeatures(features: RouteFeature[]): Promise<void> {
  await ensureDataDirectory();
  const geojsonData: RouteGeoJSONFile = {
    routes: {
      type: "FeatureCollection",
      features: features,
    },
  };
  await fs.writeFile(ROUTE_GEOJSON_FILE_PATH, JSON.stringify(geojsonData, null, 2), 'utf-8');
}

// CRUD operations for a single Route feature
export async function createRouteFeature(newFeatureData: Omit<RouteFeature, 'id'>): Promise<RouteFeature> {
  const features = await getRouteFeatures();
  const id = uuidv4(); // Generate a new UUID

  // Set default properties for routes
  const defaultProperties: RouteProperties = {
    name: newFeatureData.properties.name, // Use the provided name
    styleUrl: "#line-000000-1200-nodesc",
    "stroke-opacity": 1,
    stroke: "#000000",
    "stroke-width": 1.2,
  };

  const newRouteFeature: RouteFeature = {
    ...newFeatureData,
    id: id,
    properties: defaultProperties, // Use the default properties
    geometry: {
      type: "LineString", // Ensure it's LineString
      coordinates: newFeatureData.geometry.coordinates as LineString['coordinates']
    }
  };
  features.push(newRouteFeature);
  await writeRouteFeatures(features);
  return newRouteFeature;
}

export async function getRouteFeatureById(id: string): Promise<RouteFeature | undefined> {
  const features = await getRouteFeatures();
  return features.find(f => f.id === id);
}

export async function updateRouteFeature(id: string, updatedData: Partial<Omit<RouteFeature, 'id'>>): Promise<RouteFeature | undefined> {
  let features = await getRouteFeatures();
  const index = features.findIndex(f => f.id === id);

  if (index === -1) {
    return undefined;
  }

  const existingFeature = features[index];

  const mergedFeature: RouteFeature = {
    ...existingFeature,
    properties: {
      ...existingFeature.properties,
      ...(updatedData.properties || {}), // Merge properties
    },
    geometry: {
      ...existingFeature.geometry,
      ...(updatedData.geometry || {}), // Merge geometry coordinates
    },
    type: existingFeature.type // Preserve 'Feature' type
  };

  features[index] = mergedFeature;

  await writeRouteFeatures(features);
  return mergedFeature;
}

export async function deleteRouteFeature(id: string): Promise<boolean> {
  let features = await getRouteFeatures();
  const initialLength = features.length;
  features = features.filter(f => f.id !== id);

  if (features.length === initialLength) {
    return false; // Feature not found
  }

  await writeRouteFeatures(features);
  return true;
}