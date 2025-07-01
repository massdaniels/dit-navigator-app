// components/categories/delete-category-dialog.tsx
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
import { CategoryTableData } from "~/components/category/columns";
import { toast } from "~/components/ui/use-toast";
import { DeleteCategoryActionResponse } from "~/types/actions";
interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryTableData | null;
  onSuccess?: () => void;
}

export function DeleteCategoryDialog({ open, onOpenChange, category, onSuccess }: DeleteCategoryDialogProps) {
  const fetcher = useFetcher<DeleteCategoryActionResponse>();
  const isDeleting = fetcher.state === "submitting";

  useEffect(() => {
    // TypeScript now knows fetcher.data has a 'success' property
    if (fetcher.state === "idle" && fetcher.data?.success && isDeleting) {
      onSuccess?.(); // Call success callback
      onOpenChange(false); // Close dialog
      // TODO: Optionally show a toast for success
    } else if (fetcher.state === "idle" && fetcher.data && !fetcher.data.success && isDeleting) {
      // Handle error case: fetcher.data exists but success is false
      
      // TODO: Optionally show a toast for error:
      toast({
        title: "Error deleting category",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  }, [fetcher.state, fetcher.data, isDeleting, onSuccess, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the category
            {" "}**{category?.name}** and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <fetcher.Form method="post" action={`/dashboard/categories/${category?.id}`}>
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