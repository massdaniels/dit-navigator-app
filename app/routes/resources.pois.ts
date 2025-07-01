// app/routes/resources/pois.ts
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createPoiFeature } from "~/lib/poi-geojson.server";
import { z } from "zod";
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

// Zod schema for input data (for create)
const createPoiSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  floor: z.preprocess(
    (val) => parseInt(String(val)),
    z.number().int("Floor must be an integer").min(0, "Floor must be non-negative").nullable().default(0)
  ),
  coordinates: z.string().min(1, "Coordinates JSON is required."),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const floor = formData.get("floor");
  const coordinatesString = formData.get("coordinates") as string;

  const parseResult = createPoiSchema.safeParse({
    name, category, floor, coordinates: coordinatesString
  });

  if (!parseResult.success) {
    console.error("Validation failed for POI creation:", parseResult.error.flatten());
    return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
  }

  const { name: parsedName, category: parsedCategory, floor: parsedFloor, coordinates: parsedCoordinatesString } = parseResult.data;

  let parsedCoords;
  try {
    parsedCoords = parsePointCoordinates(parsedCoordinatesString);
  } catch (e: any) {
    return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
  }

  try {
    const newPoi = await createPoiFeature({
      type: "Feature",
      properties: {
        id: "", // Will be assigned by createPoiFeature with UUID
        name: parsedName,
        category: parsedCategory,
        floor: parsedFloor!, // Assert non-null after default
      },
      geometry: {
        type: "Point",
        coordinates: parsedCoords,
      },
    });
    return json({ success: true, poi: newPoi });
  } catch (error: any) {
    console.error("Error creating POI:", error);
    return json({ success: false, errors: { formErrors: ["Failed to create POI: " + error.message || "Unknown error"] } }, { status: 500 });
  }
}