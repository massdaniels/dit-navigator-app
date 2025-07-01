// app/components/routes/delete-route-dialog.tsx
import { useFetcher } from "@remix-run/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useEffect } from "react";
import { type RouteFeature } from "~/types/geojson";
import { type DeleteRouteActionResponse } from "~/types/actions"; // We'll define this

interface DeleteRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteFeature | null;
  onSuccess?: () => void;
}

export function DeleteRouteDialog({ open, onOpenChange, route, onSuccess }: DeleteRouteDialogProps) {
  const fetcher = useFetcher<DeleteRouteActionResponse>();
  const isDeleting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && isDeleting) {
      onSuccess?.(); // Call success callback
      onOpenChange(false); // Close dialog
      // TODO: Show success toast
    } else if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success && isDeleting) {
      console.error("Delete failed:", );
      // TODO: Show error toast
    }
  }, [fetcher.state, fetcher.data, isDeleting, onSuccess, onOpenChange]);


  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the route
            {" "}**{route?.properties.name}** and remove its data from the routes file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <fetcher.Form method="post" action={`/resources/routes/${route?.id}`}>
            <input type="hidden" name="_method" value="delete" />
            <Button type="submit" variant="danger" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </fetcher.Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}