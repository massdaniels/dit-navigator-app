import fs from 'node:fs/promises';
import path from 'node:path';
import { PoiGeoJSONFile, PoiFeature, PoiProperties } from '~/types/geojson';
import { v4 as uuidv4 } from 'uuid';

const POI_GEOJSON_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'pois.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(POI_GEOJSON_FILE_PATH);
  await fs.mkdir(dataDir, { recursive: true });
}

// Initialize the file if it doesn't exist
async function initializePoiGeojsonFile() {
  await ensureDataDirectory();
  try {
    await fs.access(POI_GEOJSON_FILE_PATH);
  } catch (error) {
    // File does not exist, create it with an empty structure
    const initialData: PoiGeoJSONFile = {
      pois: {
        type: "FeatureCollection",
        features: [],
      },
    };
    await fs.writeFile(POI_GEOJSON_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log("Initialized empty pois.geojson file.");
  }
}

// Read the POI GeoJSON file
export async function getPoiFeatures(): Promise<PoiFeature[]> {
  await initializePoiGeojsonFile();
  try {
    const data = await fs.readFile(POI_GEOJSON_FILE_PATH, 'utf-8');
    const geojsonData: PoiGeoJSONFile = JSON.parse(data);
    // Ensure features are valid GeoJSON Features
    return geojsonData.pois.features;
  } catch (error) {
    console.error("Error reading pois.geojson:", error);
    // If the file is malformed, return an empty array to prevent app crash
    return [];
  }
}

// Write the POI GeoJSON features back to the file
export async function writePoiFeatures(features: PoiFeature[]): Promise<void> {
  await ensureDataDirectory();
  const geojsonData: PoiGeoJSONFile = {
    pois: {
      type: "FeatureCollection",
      features: features, // Replace features array
    },
  };
  await fs.writeFile(POI_GEOJSON_FILE_PATH, JSON.stringify(geojsonData, null, 2), 'utf-8');
}

// CRUD operations for a single POI feature
export async function createPoiFeature(newFeatureData: Omit<PoiFeature, 'id'>): Promise<PoiFeature> {
  const features = await getPoiFeatures();
  const id = uuidv4(); // Generate a new UUID for the feature

  // Assign the UUID to both top-level id and properties.id
  const newPoiFeature: PoiFeature = {
    ...newFeatureData,
    id: id,
    properties: {
      ...newFeatureData.properties,
      id: id, // Assign generated UUID to properties.id
    }
  };
  features.push(newPoiFeature);
  await writePoiFeatures(features);
  return newPoiFeature;
}

export async function getPoiFeatureById(id: string): Promise<PoiFeature | undefined> {
  const features = await getPoiFeatures();
  return features.find(f => f.id === id); // Find by top-level ID
}

export async function updatePoiFeature(id: string, updatedData: Partial<Omit<PoiFeature, 'id'>>): Promise<PoiFeature | undefined> {
  let features = await getPoiFeatures();
  const index = features.findIndex(f => f.id === id);

  if (index === -1) {
    return undefined;
  }

  const existingFeature = features[index];

  // Perform a deep merge for properties and geometry coordinates
  const mergedFeature: PoiFeature = {
    ...existingFeature,
    properties: {
      ...existingFeature.properties,
      ...(updatedData.properties || {}), // Merge properties
      id: existingFeature.properties.id, // Ensure properties.id is preserved or explicitly managed
    },
    geometry: {
      ...existingFeature.geometry,
      ...(updatedData.geometry || {}), // Merge geometry (type is fixed to Point)
    },
    // Ensure 'type' (GeoJSON 'Feature' type) is preserved
    type: existingFeature.type
  };


  features[index] = mergedFeature;

  await writePoiFeatures(features);
  return mergedFeature;
}

export async function deletePoiFeature(id: string): Promise<boolean> {
  let features = await getPoiFeatures();
  const initialLength = features.length;
  features = features.filter(f => f.id !== id);

  if (features.length === initialLength) {
    return false; // Feature not found
  }

  await writePoiFeatures(features);
  return true;
}