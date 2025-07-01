// app/routes/resources/routes.$routeId.ts
import { type ActionFunctionArgs, json } from "@remix-run/node";
import {
  updateRouteFeature,
  deleteRouteFeature,
} from "~/lib/route-geojson.server";
import { z } from "zod";
import { LineString } from "geojson"; // For coordinates type
import { type RouteFeature } from "~/types/geojson";

// Helper for parsing JSON coordinates (specifically for LineString)
function parseLineStringCoordinates(jsonString: string): LineString['coordinates'] {
  try {
    const coords = JSON.parse(jsonString);
    // Basic validation for LineString: array of arrays of numbers
    if (!Array.isArray(coords) || coords.length < 2 || !Array.isArray(coords[0]) || coords[0].length < 2) {
      throw new Error('Coordinates for LineString must be an array of at least two points, each point being an array of two numbers (e.g., [[lon1, lat1], [lon2, lat2]])');
    }
    // More robust check: ensure all inner arrays are [number, number]
    if (!coords.every(point => Array.isArray(point) && point.length >= 2 && point.every(c => typeof c === 'number'))) {
        throw new Error('All points in LineString coordinates must be arrays of numbers (e.g., [lon, lat])');
    }
    return coords as LineString['coordinates'];
  } catch (e: any) {
    throw new Error(`Invalid JSON coordinates for LineString: ${e.message}`);
  }
}

// Zod schema for input data (for create and update)
const routeInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  coordinates: z.string().min(1, "Coordinates JSON is required."),
});

export async function action({ request, params }: ActionFunctionArgs) {
  const routeId = params.routeId;
  const formData = await request.formData();
  const _method = formData.get("_method"); // For PATCH/DELETE

  const name = formData.get("name") as string;
  const coordinates = formData.get("coordinates") as string;

  // For PATCH (update)
  if (_method === "patch") {
    if (!routeId) {
      return json({ success: false, errors: { formErrors: ["Route ID is required for update."] } }, { status: 400 });
    }

    const parseResult = routeInputSchema.partial().safeParse({
      name, coordinates
    });

    if (!parseResult.success) {
      console.error("Validation errors for Route PATCH action:", parseResult.error.flatten());
      return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
    }

    const data = parseResult.data;
    const updatePayload: Partial<RouteFeature> = {};

    let propertiesUpdate: Partial<RouteFeature['properties']> = {};
    let geometryUpdate: Partial<LineString> = {};

    if (data.name !== undefined) propertiesUpdate.name = data.name;

    if (data.coordinates !== undefined) {
      try {
        geometryUpdate.coordinates = parseLineStringCoordinates(data.coordinates);
        geometryUpdate.type = "LineString"; // Ensure type is always LineString
      } catch (e: any) {
        return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
      }
    }

    if (Object.keys(propertiesUpdate).length > 0) {
        updatePayload.properties = propertiesUpdate as RouteFeature['properties'];
    }
    if (Object.keys(geometryUpdate).length > 0) {
        updatePayload.geometry = geometryUpdate as LineString;
    }

    try {
      const updatedRoute = await updateRouteFeature(routeId, updatePayload);
      if (!updatedRoute) {
        return json({ success: false, errors: { formErrors: ["Route not found for update."] } }, { status: 404 });
      }
      return json({ success: true, route: updatedRoute });
    } catch (error: any) {
      console.error("Error updating route:", error);
      return json({ success: false, errors: { formErrors: ["Failed to update route: " + error.message || "Unknown error"] } }, { status: 500 });
    }
  }
  // For DELETE
  else if (_method === "delete") {
    if (!routeId) {
      return json({ success: false, errors: { formErrors: ["Route ID is required for delete."] } }, { status: 400 });
    }
    try {
      const deleted = await deleteRouteFeature(routeId);
      if (!deleted) {
        return json({ success: false, errors: { formErrors: ["Route not found for deletion."] } }, { status: 404 });
      }
      return json({ success: true, message: "Route deleted successfully." });
    } catch (error: any) {
      console.error("Error deleting route:", error);
      return json({ success: false, errors: { formErrors: ["Failed to delete route: " + error.message || "Unknown error"] } }, { status: 500 });
    }
  }

  return json({ success: false, message: "Method not allowed." }, { status: 405 });
}