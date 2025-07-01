// app/routes/admin/pois/_index.tsx
import { useState, useEffect, Suspense } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { DataTable } from "~/components/ui/data-table";
import { columns } from "~/components/pois/poi-columns";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { PoiForm } from "~/components/pois/poi-form";

import { getPoiFeatures } from "~/lib/poi-geojson.server";
import { type PoiFeature } from "~/types/geojson";
import { prisma } from "~/services/prisma.server";
import { CategoryTableData } from "~/components/category/columns";
import { DeletePoiDialog } from "~/components/pois/delete-poi-dialog";
import { Shell } from "~/components/dashboard/shell";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";
import { PlusCircle } from "lucide-react";

export const breadcrumbItems = [
  { title: "Points of Interest", link: "/dashboard/pois" },
];
// LOADER: Fetch all POI features and categories
export async function loader({ request }: LoaderFunctionArgs) {
  const [pois, categories] = await Promise.all([
    getPoiFeatures(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Ensure categories are serialized correctly for client-side
  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  }));

  return json({ pois, categories: serializedCategories });
}

export default function AdminPoisPage() {
  const { pois, categories } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState<PoiFeature | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<PoiFeature | null>(null);

  useEffect(() => {
    const handleOpenEdit = (event: Event) => {
      const customEvent = event as CustomEvent<PoiFeature>;
      setEditingPoi(customEvent.detail);
      setIsAddFormOpen(true);
    };
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<PoiFeature>;
      setPoiToDelete(customEvent.detail);
      setIsDeleteConfirmOpen(true);
    };

    window.addEventListener('open-edit-poi-dialog', handleOpenEdit as EventListener);
    window.addEventListener('open-delete-poi-dialog', handleOpenDelete as EventListener);

    return () => {
      window.removeEventListener('open-edit-poi-dialog', handleOpenEdit as EventListener);
      window.removeEventListener('open-delete-poi-dialog', handleOpenDelete as EventListener);
    };
  }, []);

  const handleFormSuccess = () => {
    revalidator.revalidate(); // Re-fetch data after successful C/U/D
    setIsAddFormOpen(false); // Close dialog
    setEditingPoi(null); // Clear editing state
    setPoiToDelete(null); // Clear deleting state
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
        <h1 className="text-2xl font-bold">Manage Points of Interest (POIs)</h1>
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setEditingPoi(null)}><PlusCircle className="mr-1 h-4 w-4"/> New POI</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPoi ? "Edit POI" : "Add New POI"}</DialogTitle>
            </DialogHeader>
            <PoiForm
              initialData={editingPoi}
              categories={categories as CategoryTableData[]}
              onSuccess={handleFormSuccess}
              onClose={() => setIsAddFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={pois} />

      <DeletePoiDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        poi={poiToDelete}
        onSuccess={handleFormSuccess}
      />
      </Suspense>
    </Shell>
  );
}