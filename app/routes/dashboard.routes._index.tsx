// app/routes/admin/routes/_index.tsx
import { useState, useEffect, Suspense } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "~/components/routes/route-columns";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { RouteForm } from "~/components/routes/route-form";
import { DeleteRouteDialog } from "~/components/routes/delete-route-dialog";

import { getRouteFeatures } from "~/lib/route-geojson.server";
import { type RouteFeature } from "~/types/geojson";
import { Shell } from "~/components/dashboard/shell";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

export const breadcrumbItems = [
  { title: "Routes(Paths)", link: "/dashboard/routes" },
];

// LOADER: Fetch all Route features
export async function loader({ request }: LoaderFunctionArgs) {
  const routes = await getRouteFeatures();
  return json({ routes });
}

export default function AdminRoutesPage() {
  const { routes } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteFeature | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<RouteFeature | null>(null);

  useEffect(() => {
    const handleOpenEdit = (event: Event) => {
      const customEvent = event as CustomEvent<RouteFeature>;
      setEditingRoute(customEvent.detail);
      setIsAddFormOpen(true);
    };
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<RouteFeature>;
      setRouteToDelete(customEvent.detail);
      setIsDeleteConfirmOpen(true);
    };

    window.addEventListener('open-edit-route-dialog', handleOpenEdit as EventListener);
    window.addEventListener('open-delete-route-dialog', handleOpenDelete as EventListener);

    return () => {
      window.removeEventListener('open-edit-route-dialog', handleOpenEdit as EventListener);
      window.removeEventListener('open-delete-route-dialog', handleOpenDelete as EventListener);
    };
  }, []);

  const handleFormSuccess = () => {
    revalidator.revalidate(); // Re-fetch data after successful C/U/D
    setIsAddFormOpen(false); // Close dialog
    setEditingRoute(null); // Clear editing state
    setRouteToDelete(null); // Clear deleting state
    // TODO: Show success toast
  };

  return (
        <Shell variant="sidebar">
              <BreadCrumb items={breadcrumbItems} />
        <Suspense
          fallback={
            <Skeleton className="h-[calc(75vh-220px)] rounded-md border" />
          }
        >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Routes</h1>
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setEditingRoute(null)}><PlusCircle className="mr-1 h-4 w-4"/> New Route</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
            </DialogHeader>
            <RouteForm
              initialData={editingRoute}
              onSuccess={handleFormSuccess}
              onClose={() => setIsAddFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={routes} />

      <DeleteRouteDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        route={routeToDelete}
        onSuccess={handleFormSuccess}
      />
      </Suspense>
    </Shell>
  );
}