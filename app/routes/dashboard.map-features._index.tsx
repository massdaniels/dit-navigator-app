// app/routes/admin/map-features/_index.tsx
import { useState, useEffect, Suspense } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react"; // Import useRevalidator
import { DataTable } from "~/components/ui/data-table";
import { columns, MapFeatureTableData } from "~/components/map-features/map-feature-columns";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { MapFeatureForm } from "~/components/map-features/map-feature-form";

import { getGeojsonFeatures } from "~/lib/geojson.server";
import { type MapFeature } from "~/types/geojson"; // Ensure MapFeature is imported
import { CategoryTableData } from "~/components/category/columns";
import { DeleteMapFeatureDialog } from "~/components/map-features/delete-map-feature-dialog"; // Ensure this component exists
import { prisma } from "~/services/prisma.server";
import { Shell } from "~/components/dashboard/shell";
import { Skeleton } from "~/components/ui/skeleton";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { PlusCircle } from "lucide-react";
export const breadcrumbItems = [
  { title: "Features", link: "/dashboard/map-features" },
];

// LOADER: Fetch all map features and categories
export async function loader({ request }: LoaderFunctionArgs) {
  const [features, categories] = await Promise.all([
    getGeojsonFeatures(), // This should return MapFeature[]
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Ensure categories are serialized correctly
  const serializedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    createdAt: cat.createdAt.toISOString(), // Ensure Date is stringified for client
    updatedAt: cat.updatedAt.toISOString(),
  }));

  // Map MapFeature to MapFeatureTableData.
  // If MapFeatureTableData is just an alias for MapFeature, this mapping is redundant
  // but harmless if types are compatible.
  const tableData: MapFeatureTableData[] = features.map(feature => ({
    id: feature.id,
    name: feature.properties.name,
    categoryName: feature.properties.feature_type,
    height: feature.properties.height,
    geometryType: feature.geometry.type,
    show: feature.properties.show,
    // IMPORTANT: Include full properties and geometry if MapFeatureTableData is meant to be MapFeature
    // If MapFeatureTableData is defined as `type MapFeatureTableData = MapFeature;` in columns.tsx,
    // then you can just return `features` directly.
    properties: feature.properties, // Include the entire properties object
    geometry: feature.geometry,     // Include the entire geometry object
  }));


  return json({ features: tableData, categories: serializedCategories });
}

export default function AdminMapFeaturesPage() {
  const { features, categories } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator(); // Used to re-fetch data after CUD operations

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<MapFeature | null>(null); // State for edit form initial data
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<MapFeature | null>(null); // State for delete dialog feature


const [isQrCodeDialogOpen, setIsQrCodeDialogOpen] = useState(false); // Controls if dialog is open
const [featureForQrCode, setFeatureForQrCode] = useState<MapFeature | null>(null); // Holds the feature data

  // --- Event Listeners for Custom Events ---
  useEffect(() => {
    // Listener for opening the Edit dialog
    const handleOpenEdit = (event: Event) => {
      const customEvent = event as CustomEvent<MapFeature>; // Cast to CustomEvent<MapFeature>
      setEditingFeature(customEvent.detail); // Set the feature data to pre-fill the form
      setIsAddFormOpen(true); // Open the form dialog
    };

    // Listener for opening the Delete confirmation dialog
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<MapFeature>; // Cast to CustomEvent<MapFeature>
      setFeatureToDelete(customEvent.detail); // Set the feature to be deleted
      setIsDeleteConfirmOpen(true); // Open the delete confirmation dialog
    };



    window.addEventListener('open-edit-map-feature-dialog', handleOpenEdit as EventListener);
    window.addEventListener('open-delete-map-feature-dialog', handleOpenDelete as EventListener);
    return () => {
      // Clean up event listeners on component unmount
      window.removeEventListener('open-edit-map-feature-dialog', handleOpenEdit as EventListener);
      window.removeEventListener('open-delete-map-feature-dialog', handleOpenDelete as EventListener);
    };
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  // --- Handlers for Dialog Success/Close ---
  const handleFormSuccess = () => {
    revalidator.revalidate(); // Re-fetch data from the loader to update the table
    setIsAddFormOpen(false); // Close the Add/Edit dialog
    setEditingFeature(null); // Clear the editing feature state
    setIsDeleteConfirmOpen(false); // Close the Delete dialog (in case it was open)
    setFeatureToDelete(null); // Clear the feature to delete state
    setIsQrCodeDialogOpen(false);
    setFeatureForQrCode(null);
    // TODO: Consider adding a success toast notification here
  };

  const handleFormClose = () => {
    setIsAddFormOpen(false); // Close the Add/Edit dialog
    setEditingFeature(null); // Clear the editing feature state
    setIsDeleteConfirmOpen(false); // Close the Delete dialog
    setFeatureToDelete(null); // Clear the feature to delete state
    setIsQrCodeDialogOpen(false);
    setFeatureForQrCode(null);
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
          <h1 className="text-2xl font-bold">Manage Map Features</h1>
          <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <DialogTrigger asChild>
              {/* When clicking 'Add New Feature', ensure no feature is set for editing */}
              <Button variant="outline" onClick={() => setEditingFeature(null)}><PlusCircle className="mr-1 h-4 w-4"/>New Feature</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingFeature ? "Edit Map Feature" : "Add New Map Feature"}</DialogTitle>
              </DialogHeader>
              <MapFeatureForm
                initialData={editingFeature} // Pass the feature data for pre-filling
                categories={categories as CategoryTableData[]} // Cast due to Date serialization
                onSuccess={handleFormSuccess}
                onClose={handleFormClose} // Use the new generic close handler
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* DataTable component */}
        <DataTable columns={columns} data={features} />

        {/* Delete Confirmation Dialog */}
        <DeleteMapFeatureDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
          feature={featureToDelete} // Pass the feature object to the dialog
          onSuccess={handleFormSuccess} // Revalidate and close all relevant states on success
        />

      </Suspense>
    </Shell>
  );
}