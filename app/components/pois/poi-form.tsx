// app/components/pois/poi-form.tsx
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

import { type PoiFeature } from "~/types/geojson";
import { type MutatePoiActionResponse } from "~/types/actions"; // We'll define this
import { CategoryTableData } from "../category/columns";

interface PoiFormProps {
  initialData?: PoiFeature | null; // For editing
  categories: CategoryTableData[]; // List of categories for dropdown
  onSuccess?: () => void;
  onClose?: () => void;
}

export function PoiForm({ initialData, categories, onSuccess, onClose }: PoiFormProps) {
  const fetcher = useFetcher<MutatePoiActionResponse>();

  const isSubmitting = fetcher.state === "submitting";
  const isEditMode = !!initialData;

  const [name, setName] = useState<string>(initialData?.properties.name || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.properties.category || (categories.length > 0 ? categories[0].name : "")
  );
  const [floor, setFloor] = useState<number>(initialData?.properties.floor || 0);
  const [coordinates, setCoordinates] = useState<string>(
    initialData ? JSON.stringify(initialData.geometry.coordinates, null, 2) : "[0, 0]" // Point coordinates
  );

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && isSubmitting) {
      onSuccess?.();
      onClose?.();
    } else if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success && isSubmitting) {
      console.error("POI form submission failed:",);
      // TODO: Display errors to the user, e.g., using toast or inline messages
    }
  }, [fetcher.state, fetcher.data, isSubmitting, onSuccess, onClose]);


  return (
    <fetcher.Form
      method="post"
      action={isEditMode ? `/resources/pois/${initialData.id}` : "/resources/pois"}
      className="grid gap-4 py-4"
    >
      {isEditMode && <input type="hidden" name="_method" value="patch" />}
      <input type="hidden" name="id" value={initialData?.id || ""} />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">Category</Label>
        <Select
          name="category"
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
        <Label htmlFor="floor" className="text-right">Floor</Label>
        <Input
          id="floor"
          name="floor"
          type="number"
          step="1"
          value={floor}
          onChange={(e) => setFloor(parseInt(e.target.value))}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="coordinates" className="text-right">Coordinates (JSON - [lon, lat])</Label>
        <Textarea
          id="coordinates"
          name="coordinates"
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          className="col-span-3 min-h-[80px] font-mono text-xs"
          required
          placeholder={`e.g., [39.279570, -6.815262]`}
        />
        {/* TODO: Add validation feedback for JSON parsing */}
      </div>

      <Button variant="primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save changes" : "Add POI")}
      </Button>
    </fetcher.Form>
  );
}