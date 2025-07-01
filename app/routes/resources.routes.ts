// app/routes/resources/routes.ts
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createRouteFeature } from "~/lib/route-geojson.server";
import { z } from "zod";
import { LineString } from "geojson"; // For coordinates type

// Helper for parsing JSON coordinates (specifically for LineString)
function parseLineStringCoordinates(jsonString: string): LineString['coordinates'] {
  try {
    const coords = JSON.parse(jsonString);
    if (!Array.isArray(coords) || coords.length < 2 || !Array.isArray(coords[0]) || coords[0].length < 2) {
      throw new Error('Coordinates for LineString must be an array of at least two points, each point being an array of two numbers (e.g., [[lon1, lat1], [lon2, lat2]])');
    }
    if (!coords.every(point => Array.isArray(point) && point.length >= 2 && point.every(c => typeof c === 'number'))) {
        throw new Error('All points in LineString coordinates must be arrays of numbers (e.g., [lon, lat])');
    }
    return coords as LineString['coordinates'];
  } catch (e: any) {
    throw new Error(`Invalid JSON coordinates for LineString: ${e.message}`);
  }
}

// Zod schema for input data (for create)
const createRouteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  coordinates: z.string().min(1, "Coordinates JSON is required."),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const coordinatesString = formData.get("coordinates") as string;

  const parseResult = createRouteSchema.safeParse({
    name, coordinates: coordinatesString
  });

  if (!parseResult.success) {
    console.error("Validation failed for Route creation:", parseResult.error.flatten());
    return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
  }

  const { name: parsedName, coordinates: parsedCoordinatesString } = parseResult.data;

  let parsedCoords;
  try {
    parsedCoords = parseLineStringCoordinates(parsedCoordinatesString);
  } catch (e: any) {
    return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
  }

  try {
    // createRouteFeature will assign default style properties and UUID
    const newRoute = await createRouteFeature({
      type: "Feature",
      properties: {
        name: parsedName,
        // Other properties like styleUrl etc. will be set by createRouteFeature
      },
      geometry: {
        type: "LineString",
        coordinates: parsedCoords,
      },
      // id will be assigned by createRouteFeature
    });
    return json({ success: true, route: newRoute });
  } catch (error: any) {
    console.error("Error creating route:", error);
    return json({ success: false, errors: { formErrors: ["Failed to create route: " + error.message || "Unknown error"] } }, { status: 500 });
  }
}