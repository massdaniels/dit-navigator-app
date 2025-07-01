import fs from 'node:fs/promises';
import path from 'node:path';
import { MapGeoJSONFile, MapFeature } from '~/types/geojson';
import { v4 as uuidv4 } from 'uuid'; 

const GEOJSON_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'map.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(GEOJSON_FILE_PATH);
  await fs.mkdir(dataDir, { recursive: true });
}

// Initialize the file if it doesn't exist
async function initializeGeojsonFile() {
  await ensureDataDirectory();
  try {
    await fs.access(GEOJSON_FILE_PATH);
  } catch (error) {
    // File does not exist, create it with an empty structure
    const initialData: MapGeoJSONFile = {
      map_features: {
        type: "FeatureCollection",
        features: [],
      },
    };
    await fs.writeFile(GEOJSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Initialized empty map.json file.");
  }
}

export async function getMapFeatures(filter?: { show?: boolean }): Promise<MapFeature[]> {
  await initializeGeojsonFile();
  try {
    const data = await fs.readFile(GEOJSON_FILE_PATH, 'utf-8');
    const geojsonData: MapGeoJSONFile = JSON.parse(data);
    let features = geojsonData.map_features.features;

    // --- UPDATED FILTER LOGIC ---
    // If filter is provided and `show` is explicitly a boolean, apply that filter.
    // Otherwise (if filter is not provided, or filter.show is undefined),
    // default to only returning features where `show` is true.
    if (filter && typeof filter.show === 'boolean') {
      features = features.filter(feature => feature.properties.show === filter.show);
    } else {
      // Default behavior: only get features where show is true
      features = features.filter(feature => feature.properties.show === true);
    }

    return features;
  } catch (error) {
    console.error("Error reading map-features.geojson:", error);
    return [];
  }
}
// Read the GeoJSON file
export async function getGeojsonFeatures(): Promise<MapFeature[]> {
  await initializeGeojsonFile();
  try {
    const data = await fs.readFile(GEOJSON_FILE_PATH, 'utf-8');
    const geojsonData: MapGeoJSONFile = JSON.parse(data);
    return geojsonData.map_features.features;
  } catch (error) {
    console.error("Error reading map.json:", error);
    // If the file is malformed, return an empty array to prevent app crash
    return [];
  }
}

// Write the GeoJSON features back to the file
export async function writeGeojsonFeatures(features: MapFeature[]): Promise<void> {
  await ensureDataDirectory();
  const currentData = await getGeojsonFeatures(); // Read existing to preserve other structure if needed
  const geojsonData: MapGeoJSONFile = {
    map_features: {
      type: "FeatureCollection",
      features: features, // Replace features array
    },
  };
  await fs.writeFile(GEOJSON_FILE_PATH, JSON.stringify(geojsonData, null, 2), 'utf-8');
}

// CRUD operations for a single feature
export async function createMapFeature(newFeatureData: Omit<MapFeature, 'id'>): Promise<MapFeature> {
  const features = await getGeojsonFeatures();
  const id = uuidv4(); // Generate a new UUID for the feature
  const newFeature: MapFeature = { ...newFeatureData, id };
  features.push(newFeature);
  await writeGeojsonFeatures(features);
  return newFeature;
}

export async function getMapFeatureById(id: string): Promise<MapFeature | undefined> {
  const features = await getGeojsonFeatures();
  return features.find(f => f.id === id);
}

export async function updateMapFeature(id: string, updatedData: Partial<Omit<MapFeature, 'id'>>): Promise<MapFeature | undefined> {
  let features = await getGeojsonFeatures();
  const index = features.findIndex(f => f.id === id);

  if (index === -1) {
    return undefined;
  }

  const existingFeature = features[index];
  const mergedFeature = { ...existingFeature, ...updatedData };
  features[index] = mergedFeature;

  await writeGeojsonFeatures(features);
  return mergedFeature;
}

export async function deleteMapFeature(id: string): Promise<boolean> {
  let features = await getGeojsonFeatures();
  const initialLength = features.length;
  features = features.filter(f => f.id !== id);

  if (features.length === initialLength) {
    return false; // Feature not found
  }

  await writeGeojsonFeatures(features);
  return true;
}


