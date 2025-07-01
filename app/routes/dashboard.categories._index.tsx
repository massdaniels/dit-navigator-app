// routes/admin/categories/_index.tsx
import { useState, useEffect, Suspense } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { prisma } from "~/services/prisma.server";
import { CategoryTableData, columns } from "~/components/category/columns";
import { CategoryForm } from "~/components/category/category-form";
import { DeleteCategoryDialog } from "../components/category/delete-category-dialog";
import { DataTable } from "~/components/ui/data-table";
import { toast } from "~/components/ui/use-toast";
import { Shell } from "~/components/dashboard/shell";
import BreadCrumb from "~/components/dashboard/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";
import { PlusCircle } from "lucide-react";
// import { useToast } from "~/components/ui/use-toast"; // If you set up toasts

// LOADER: Fetch all categories
export async function loader({ request }: LoaderFunctionArgs) {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ categories });
}
export const breadcrumbItems = [
  { title: "Categories", link: "/dashboard/categories" },
];
export default function AdminCategoriesPage() {
  const { categories } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  // const { toast } = useToast(); // If you set up toasts

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryTableData | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryTableData | null>(null);

  // Listen for custom events dispatched from table cell actions
  useEffect(() => {
    const handleOpenEdit = (event: Event) => {
      const customEvent = event as CustomEvent<CategoryTableData>;
      setEditingCategory(customEvent.detail);
      setIsAddFormOpen(true); // Re-use the same dialog for edit
    };
    const handleOpenDelete = (event: Event) => {
      const customEvent = event as CustomEvent<CategoryTableData>;
      setCategoryToDelete(customEvent.detail);
      setIsDeleteConfirmOpen(true);
    };

    window.addEventListener('open-edit-category-dialog', handleOpenEdit as EventListener);
    window.addEventListener('open-delete-category-dialog', handleOpenDelete as EventListener);

    return () => {
      window.removeEventListener('open-edit-category-dialog', handleOpenEdit as EventListener);
      window.removeEventListener('open-delete-category-dialog', handleOpenDelete as EventListener);
    };
  }, []);

  const handleFormSuccess = () => {
    revalidator.revalidate(); // Re-fetch data after successful C/U/D
    toast({
      title: "Success!",
      description: "Category updated successfully.",
    });
    setEditingCategory(null); // Clear editing state
    setCategoryToDelete(null); // Clear deleting state
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
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setEditingCategory(null)}> <PlusCircle className="mr-1 h-4 w-4"/> New Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              initialData={editingCategory}
              onSuccess={handleFormSuccess}
              onClose={() => setIsAddFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={categories} />

      <DeleteCategoryDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        category={categoryToDelete}
        onSuccess={handleFormSuccess}
      />
     </Suspense>
      </Shell>
  );
}