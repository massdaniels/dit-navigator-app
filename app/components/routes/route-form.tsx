// app/components/routes/route-form.tsx
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

import { type RouteFeature } from "~/types/geojson";
import { type MutateRouteActionResponse } from "~/types/actions"; // We'll define this

interface RouteFormProps {
  initialData?: RouteFeature | null; // For editing
  onSuccess?: () => void;
  onClose?: () => void;
}

export function RouteForm({ initialData, onSuccess, onClose }: RouteFormProps) {
  const fetcher = useFetcher<MutateRouteActionResponse>();

  const isSubmitting = fetcher.state === "submitting";
  const isEditMode = !!initialData;

  const [name, setName] = useState<string>(initialData?.properties.name || "");
  const [coordinates, setCoordinates] = useState<string>(
    initialData ? JSON.stringify(initialData.geometry.coordinates, null, 2) : "[[0, 0], [1, 1]]" // LineString example
  );

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && isSubmitting) {
      onSuccess?.();
      onClose?.();
    } else if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success && isSubmitting) {
      console.error("Route form submission failed:",);
      // TODO: Display errors to the user, e.g., using toast or inline messages
    }
  }, [fetcher.state, fetcher.data, isSubmitting, onSuccess, onClose]);


  return (
    <fetcher.Form
      method="post"
      action={isEditMode ? `/resources/routes/${initialData.id}` : "/resources/routes"}
      className="grid gap-4 py-4"
    >
      {isEditMode && <input type="hidden" name="_method" value="patch" />}
      <input type="hidden" name="id" value={initialData?.id || ""} />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="coordinates" className="text-right">Coordinates (JSON - [[lon, lat], ...])</Label>
        <Textarea
          id="coordinates"
          name="coordinates"
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          className="col-span-3 min-h-[100px] font-mono text-xs"
          required
          placeholder={`e.g., [[39.27956, -6.81521], [39.27951, -6.81528]]`}
        />
        {/* TODO: Add validation feedback for JSON parsing */}
      </div>

      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save changes" : "Add Route")}
      </Button>
    </fetcher.Form>
  );
}