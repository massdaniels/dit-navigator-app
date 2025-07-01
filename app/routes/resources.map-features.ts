// app/routes/resources/map-features.ts
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createMapFeature } from "~/lib/geojson.server";
import { z } from "zod";
import { type MapFeatureGeometry } from "~/types/geojson";

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
    throw new Error(`Invalid JSON coordinates: ${e.message}`);
  }
}

// Zod schema for input data (for create)
const createMapFeatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryName: z.string().min(1, "Category is required"),
  height: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Height must be non-negative").nullable().default(0)
  ),
  show: z.preprocess(
    (val) => val === 'on' || val === true || val === 'true',
    z.boolean().default(true)
  ),
  geometryType: z.enum(["Point", "LineString", "Polygon"], { required_error: "Geometry type is required." }),
  coordinates: z.string().min(1, "Coordinates JSON is required."),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const categoryName = formData.get("categoryName") as string;
  const height = formData.get("height");
  const show = formData.get("show");
  const geometryType = formData.get("geometryType") as MapFeatureGeometry['type'];
  const coordinatesString = formData.get("coordinates") as string;

  const parseResult = createMapFeatureSchema.safeParse({
    name, categoryName, height, show, geometryType, coordinates: coordinatesString
  });

  if (!parseResult.success) {
    console.error("Validation failed:", parseResult.error.flatten());
    return json({ success: false, errors: parseResult.error.flatten() }, { status: 400 });
  }

  const { name: parsedName, categoryName: parsedCategoryName, height: parsedHeight, show: parsedShow, geometryType: parsedGeometryType, coordinates: parsedCoordinatesString } = parseResult.data;

  let parsedCoords;
  try {
    parsedCoords = parseCoordinates(parsedCoordinatesString, parsedGeometryType);
  } catch (e: any) {
    return json({ success: false, errors: { coordinates: [e.message] } }, { status: 400 });
  }

  try {
    const newFeature = await createMapFeature({
      type: "Feature",
      properties: {
        name: parsedName,
        feature_type: parsedCategoryName, // Use categoryName directly
        show: parsedShow,
        height: parsedHeight!, // Assert non-null after default
      },
      geometry: {
        type: parsedGeometryType,
        coordinates: parsedCoords,
      },
    });
    return json({ success: true, feature: newFeature });
  } catch (error: any) {
    console.error("Error creating map feature:", error);
    return json({ success: false, errors: { formErrors: ["Failed to create map feature."] } }, { status: 500 });
  }
}