// app/routes/resources/map-features.$featureId.ts
import { type ActionFunctionArgs, json,  } from "@remix-run/node";
import {
  updateMapFeature,
  deleteMapFeature,
  getMapFeatureById,
} from "~/lib/geojson.server";
import { z } from "zod";
import { type MapFeature, type MapFeatureGeometry, type MapFeatureProperties } from "~/types/geojson"; // Ensure MapFeatureProperties is imported too

// Helper for parsing JSON coordinates (needs to be robust)
function parseCoordinates(jsonString: string, type: MapFeatureGeometry['type']): any {
  try {
    const coords = JSON.parse(jsonString);
    // Basic structural validation based on GeoJSON type
    if (type === 'Point' && (!Array.isArray(coords) || coords.length < 2)) {
      throw new Error('Point coordinates must be an array of at least 2 numbers (e.g., [lon, lat])');
    }
    if ((type === 'LineString' || type === 'MultiPoint') && (!Array.isArray(coords) || !Array.isArray(coords[0]))) {
      throw new Error('LineString/MultiPoint coordinates must be an array of arrays of numbers (e.g., [[lon1, lat1], [lon2, lat2]])');
    }
    if ((type === 'Polygon' || type === 'MultiLineString') && (!Array.isArray(coords) || !Array.isArray(coords[0]) || !Array.isArray(coords[0][0]))) {
      throw new Error('Polygon/MultiLineString coordinates must be an array of arrays of arrays of numbers (e.g., [[[lon1, lat1], ...]])');
    }
    return coords;
  } catch (e: any) {
    console.log("Invalid JSON coordinates: ", e.message)
    throw new Error(`Invalid JSON coordinates: ${e.message}`);
  }
}

// ... (your zod schemas for input data - createMapFeatureSchema is from the other file)

// Adjusted schema for update, as fields are optional
const updateMapFeatureSchema = z.object({
  name: z.string().min(1, "Name is required").optional(), // Make optional for PATCH
  categoryName: z.string().min(1, "Category is required").optional(),
  height: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Height must be non-negative").nullable().default(0) // Default only applied if value is missing/null
  ).optional(),
  show: z.preprocess( // Use preprocess to convert "on" or undefined to boolean
    (val) => val === "on" ? true : false,
    z.boolean()
  ).default(false), // Optional for PATCH, required for POST
  geometryType: z.enum(["Point", "LineString", "Polygon"]).optional(),
  coordinates: z.string().optional(),
});


export async function action({ request, params }: ActionFunctionArgs) {
  const featureId = params.featureId;
  const formData = await request.formData();
  const _method = formData.get("_method");

  // For PATCH (update)
  if (_method === "patch") {
    if (!featureId) {
      throw Error("Feature ID is required for update.");
    }

    const parseResult = updateMapFeatureSchema.safeParse(Object.fromEntries(formData)); // Use Object.fromEntries to get all fields

    if (!parseResult.success) {
      console.log("Validation errors:", parseResult.error.flatten());
      return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    // Correct way to initialize: Start with an empty object
    const updatePayload: Partial<MapFeature> = {};

    // Initialize properties and geometry if needed
    let propertiesUpdate: Partial<MapFeatureProperties> = {};
    let geometryUpdate: Partial<MapFeatureGeometry> = {};


    // Conditionally assign properties
    if (data.name !== undefined) propertiesUpdate.name = data.name;
    if (data.categoryName !== undefined) propertiesUpdate.feature_type = data.categoryName;
    if (data.height !== null) propertiesUpdate.height = data.height;
    if (data.show !== undefined) propertiesUpdate.show = data.show;

    // Conditionally assign geometry
    if (data.geometryType !== undefined) geometryUpdate.type = data.geometryType;
    if (data.coordinates !== undefined) {
      try {
        const currentFeature = await getMapFeatureById(featureId);
        // Use provided geometryType or fallback to existing feature's type for parsing
        const effectiveGeometryType = data.geometryType || currentFeature?.geometry.type || 'Point';
        geometryUpdate.coordinates = parseCoordinates(data.coordinates, effectiveGeometryType);
      } catch (e: any) {
        return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
      }
    }

    // Only add properties or geometry to updatePayload if they actually have changes
    if (Object.keys(propertiesUpdate).length > 0) {
        updatePayload.properties = propertiesUpdate as MapFeatureProperties; // Cast to non-partial if necessary, or adjust MapFeature definition
    }
    if (Object.keys(geometryUpdate).length > 0) {
        updatePayload.geometry = geometryUpdate as MapFeatureGeometry; // Cast here
    }

    // Ensure the id and type are set for the MapFeature base interface if they weren't inferred.
    // This is more about ensuring the object being sent to updateMapFeature matches MapFeature.
    // However, updateMapFeature takes Partial<Omit<MapFeature, 'id'>>, so it should be fine.
    // If you explicitly update the `type` or `id` of the Feature itself (not just properties/geometry), add them here:
    // if (data.type) updatePayload.type = data.type; // Assuming you'd have a 'type' field in formData for the Feature 'type' (e.g. "Feature")


    try {
      const updatedFeature = await updateMapFeature(featureId, updatePayload);
      if (!updatedFeature) {
        throw Error("Map feature not found for update.");
      }
      return json({ success: true, feature: updatedFeature });
    } catch (error: any) {
      console.error("Error updating map feature:", error);
      return json({ success: false, errors: { formErrors: ["Failed to update map feature."] } }, { status: 500 });
    }
  } else if (_method === "delete") {
    if (!featureId) {
      throw Error("Feature ID is required for delete.");
    }
    try {
      const deleted = await deleteMapFeature(featureId);
      if (!deleted) {
        // PROBLEM: This path returns nothing if deleted is false (feature not found)
        throw Error("Map feature not found for deletion.");
      }
      // SUCCESS PATH: This path returns json
      return json({ success: true, message: "Map feature deleted successfully." });
    } catch (error) {
      console.error("Error deleting map feature:", error);
      // ERROR PATH: This path returns json
      return json({ success: false, errors: { formErrors: ["Failed to delete map feature."] } }, { status: 500 });
    }
  }
  // ... (rest of your action for delete and method not allowed)
}