import { type ActionFunctionArgs, json,  } from "@remix-run/node";
import {
  updatePoiFeature,
  deletePoiFeature,
  getPoiFeatureById,
} from "~/lib/poi-geojson.server";
import { z } from "zod";
import { type PoiFeature } from "~/types/geojson";
import { Point } from "geojson"; // For coordinates type

// Helper for parsing JSON coordinates (specifically for Point)
function parsePointCoordinates(jsonString: string): Point['coordinates'] {
  try {
    const coords = JSON.parse(jsonString);
    if (!Array.isArray(coords) || coords.length !== 2 || typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
      throw new Error('Coordinates for Point must be an array of two numbers (e.g., [lon, lat])');
    }
    return coords as Point['coordinates'];
  } catch (e: any) {
    throw new Error(`Invalid JSON coordinates for Point: ${e.message}`);
  }
}

// Zod schema for input data (for create and update)
const poiInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  floor: z.preprocess(
    (val) => parseInt(String(val)),
    z.number().int("Floor must be an integer").min(0, "Floor must be non-negative").nullable().default(0)
  ),
  coordinates: z.string().min(1, "Coordinates JSON is required."),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const poiId = params.poiId;
  const formData = await request.formData();
  const _method = formData.get("_method"); // For PATCH/DELETE

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const floor = formData.get("floor");
  const coordinates = formData.get("coordinates") as string;

  // For PATCH (update)
  if (_method === "patch") {
    if (!poiId) {
      return json({ success: false, errors: { formErrors: ["POI ID is required for update."] } }, { status: 400 });
    }

    const parseResult = poiInputSchema.partial().safeParse({
      name, category, floor, coordinates
    });

    if (!parseResult.success) {
      console.error("Validation errors for POI PATCH action:", parseResult.error.flatten());
      return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: Partial<PoiFeature> = {};

    let propertiesUpdate: Partial<PoiFeature['properties']> = {}; // Use PoiFeature's properties type
    let geometryUpdate: Partial<Point> = {}; // Use GeoJSON Point type

    if (data.name !== undefined) propertiesUpdate.name = data.name;
    if (data.category !== undefined) propertiesUpdate.category = data.category;
    if (data.floor !== null) propertiesUpdate.floor = data.floor;

    if (data.coordinates !== undefined) {
      try {
        geometryUpdate.coordinates = parsePointCoordinates(data.coordinates);
        geometryUpdate.type = "Point"; // Ensure type is always Point
      } catch (e: any) {
        return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
      }
    }

    if (Object.keys(propertiesUpdate).length > 0) {
        updatePayload.properties = propertiesUpdate as PoiFeature['properties'];
    }
    if (Object.keys(geometryUpdate).length > 0) {
        updatePayload.geometry = geometryUpdate as Point;
    }

    try {
      const updatedPoi = await updatePoiFeature(poiId, updatePayload);
      if (!updatedPoi) {
        return json({ success: false, errors: { formErrors: ["POI not found for update."] } }, { status: 404 });
      }
      return json({ success: true, poi: updatedPoi });
    } catch (error: any) {
      console.error("Error updating POI:", error);
      return json({ success: false, errors: { formErrors: ["Failed to update POI: " + error.message || "Unknown error"] } }, { status: 500 });
    }
  }
  // For DELETE
  else if (_method === "delete") {
    if (!poiId) {
      return json({ success: false, errors: { formErrors: ["POI ID is required for delete."] } }, { status: 400 });
    }
    try {
      const deleted = await deletePoiFeature(poiId);
      if (!deleted) {
        return json({ success: false, errors: { formErrors: ["POI not found for deletion."] } }, { status: 404 });
      }
      return json({ success: true, message: "POI deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting POI:", error);
      return json({ success: false, errors: { formErrors: ["Failed to delete POI: " + error.message || "Unknown error"] } }, { status: 500 });
    }
  }

  return json({ success: false, message: "Method not allowed." }, { status: 405 });
}