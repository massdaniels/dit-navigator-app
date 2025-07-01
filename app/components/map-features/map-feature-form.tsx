// app/components/map-features/map-feature-form.tsx
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { type MapFeature, MapFeatureGeometry, MapFeatureProperties } from "~/types/geojson";
import { type MutateMapFeatureActionResponse } from "~/types/actions"; // We'll define this
import { CategoryTableData } from "../category/columns";

// For the category dropdown

interface MapFeatureFormProps {
  initialData?: MapFeature | null; // For editing
  categories: CategoryTableData[]; // List of categories for dropdown
  onSuccess?: () => void;
  onClose?: () => void;
}

export function MapFeatureForm({ initialData, categories, onSuccess, onClose }: MapFeatureFormProps) {
  const fetcher = useFetcher<MutateMapFeatureActionResponse>();

  const isSubmitting = fetcher.state === "submitting";
  const isEditMode = !!initialData;

  const [geometryType, setGeometryType] = useState<MapFeatureGeometry['type']>(
    initialData?.geometry.type || "Point"
  );
  const [coordinates, setCoordinates] = useState<string>(
    initialData ? JSON.stringify(initialData.geometry.coordinates, null, 2) : "[]"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.properties.feature_type || (categories.length > 0 ? categories[0].name : "")
  );
  const [name, setName] = useState<string>(initialData?.properties.name || "");
  const [height, setHeight] = useState<number>(initialData?.properties.height || 0);
  const [show, setShow] = useState<boolean>(initialData?.properties.show ?? true);


  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && isSubmitting) {
      onSuccess?.();
      onClose?.();
      console.log("data sent...")
    } else if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success && isSubmitting) {
      console.error("Map feature form submission failed:");
      // TODO: Display errors to the user, e.g., using toast or inline messages
    }
  }, [fetcher.state, fetcher.data, isSubmitting, onSuccess, onClose]);

  // Handle geometry type change to suggest default coordinates structure
  const handleGeometryTypeChange = (value: MapFeatureGeometry['type']) => {
    setGeometryType(value);
    switch (value) {
      case "Point":
        setCoordinates("[0, 0]");
        break;
      case "LineString":
        setCoordinates("[[0, 0], [1, 1]]");
        break;
      case "Polygon":
        setCoordinates("[[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]");
        break;
      default:
        setCoordinates("[]");
    }
  };


  return (
    <fetcher.Form
      method="post"
      action={isEditMode ? `/resources/map-features/${initialData.id}` : "/resources/map-features"}
      className="grid gap-4 py-4"
    >
      {isEditMode && <input type="hidden" name="_method" value="patch" />}
      <input type="hidden" name="id" value={initialData?.id || ""} />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="categoryName" className="text-right">Category</Label>
        <Select
          name="categoryName"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="height" className="text-right">Height</Label>
        <Input
          id="height"
          name="height"
          type="number"
          step="3"
          value={height}
          onChange={(e) => setHeight(parseFloat(e.target.value))}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="geometryType" className="text-right">Geometry Type</Label>
        <Select
          name="geometryType"
          value={geometryType}
          onValueChange={handleGeometryTypeChange}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select geometry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Point">Point</SelectItem>
            <SelectItem value="LineString">LineString</SelectItem>
            <SelectItem value="Polygon">Polygon</SelectItem>
            <SelectItem value="MultiPoint">MultiPoint</SelectItem>
            <SelectItem value="MultiLineString">MultiLineString</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="coordinates" className="text-right">Coordinates (JSON)</Label>
        <Textarea
          id="coordinates"
          name="coordinates"
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          className="col-span-3 min-h-[100px] font-mono text-xs"
          required
          placeholder={`e.g., for Point: [lon, lat]\nfor Polygon: [[[lon, lat], ...]]`}
        />
        {/* TODO: Add validation feedback for JSON parsing */}
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="show" className="text-right">Show on Map</Label>
        <input
          type="checkbox"
          id="show"
          name="show"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="col-span-3 h-4 w-4"
        />
      </div>

      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save changes" : "Add Feature")}
      </Button>
    </fetcher.Form>
  );
}