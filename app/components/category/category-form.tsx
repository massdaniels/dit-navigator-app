// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Trash } from "lucide-react";
// import * as z from "zod";

// import { Button } from "~/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form";
// import { Input } from "~/components/ui/input";
// import { Separator } from "~/components/ui/separator";
// import { Heading } from "~/components/ui/heading";
// import { useState } from "react";
// import { toast } from "~/components/ui/use-toast";
// import { ReloadIcon } from "@radix-ui/react-icons";
// import { useNavigate } from "@remix-run/react";
// import { Category } from "~/types";
// import { AlertModal } from "../modal/alert-modal";
// import { CategorySchema } from "prisma/zodShema";

// type CategoryFormValues = z.infer<typeof CategorySchema>;

// interface CategoryFormProps {
//   initialData: Category | null;

// }

// export function CategoryForm({
//   initialData,

// }: CategoryFormProps) {
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const title = initialData ? "Edit POI category" : "Create POI category";
//   const description = initialData
//     ? "Edit a POI category"
//     : "Add a new POI category";
//   const action = initialData ? "Save changes" : "Create";

//   const form = useForm<CategoryFormValues>({
//     resolver: zodResolver(CategorySchema),
//     defaultValues: initialData
//       ? {
//           ...initialData,
//           description: initialData.description || "",

//         }
//       : {
//           categoryPoi: "",
//           categoryName: "",
//           description: "",

//         },
//   });

//   // Form submission handler
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const onSubmit = async (_data: CategoryFormValues) => {
//     // Note: _data variable is intentionally prefixed with underscore as it's required by the form
//     // but not used in this demo implementation
//     try {
//       setLoading(true);

//       // API call would go here

//       toast({
//         title: "POI category saved.",
//       });
//       navigate("/dashboard/pois-categories");
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Error!",
//         description: "Something went wrong.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDelete = async () => {
//     try {
//       setLoading(true);

//       // Delete API call would go here

//       toast({
//         title: "POI category deleted.",
//       });
//       navigate("/dashboard/categories");
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Error!",
//         description: "Something went wrong.",
//       });
//     } finally {
//       setLoading(false);
//       setOpen(false);
//     }
//   };

//   return (
//     <>
//       <AlertModal
//         isOpen={open}
//         onClose={() => setOpen(false)}
//         onConfirm={onDelete}
//         loading={loading}
//       />
//       <div className="flex items-center justify-between">
//         <Heading title={title} description={description} />
//         {initialData && (
//           <Button
//             disabled={loading}
//             variant="danger"
//             size="sm"
//             onClick={() => setOpen(true)}
//           >
//             <Trash className="h-4 w-4" />
//           </Button>
//         )}
//       </div>
//       <Separator />
//       <Form {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-8 w-full"
//         >
//           <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
//             <FormField
//               control={form.control}
//               name="categoryPoi"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Category POI</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading || !!initialData}
//                       placeholder="Enter category POI"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="categoryName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Category Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Enter category name"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled={loading}
//                       placeholder="Enter description (optional)"
//                       {...field}
//                       value={field.value || ""}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <input type="hidden" name="token" />
//           <Button disabled={loading} className="ml-auto" type="submit">
//             {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
//             {action}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// }





// components/categories/category-form.tsx
import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { type CategoryTableData } from "./columns"; // Re-use the type
import { DeleteCategoryActionResponse } from "~/types/actions";

interface CategoryFormProps {
  initialData?: CategoryTableData | null; // For editing
  onSuccess?: () => void; // Callback after successful submission
  onClose?: () => void; // Callback to close the dialog/drawer
}

export function CategoryForm({ initialData, onSuccess, onClose }: CategoryFormProps) {
  const fetcher = useFetcher<DeleteCategoryActionResponse>();

  const isSubmitting = fetcher.state === "submitting";
  const isEditMode = !!initialData;

  useEffect(() => {
    // Listen for successful submissions
    if (fetcher.state === "idle" && fetcher.data?.success && isSubmitting) {
      onSuccess?.(); // Call success callback
      onClose?.(); // Close dialog/drawer
    }
    // TODO: Add error handling based on fetcher.data?.error
  }, [fetcher.state, fetcher.data, isSubmitting, onSuccess, onClose]);

  return (
    <fetcher.Form
      method="post"
      // Action path for new categories (e.g., /admin/categories/_index)
      // For editing, we'll hit a dynamic route (e.g., /resources/categories/categoryId)
      action={isEditMode ? `/dashboard/categories/${initialData.id}` : "/dashboard/categories"}
      className="grid gap-4 py-4"
    >
      {isEditMode && <input type="hidden" name="_method" value="patch" />} {/* For PUT/PATCH via POST */}
      <input type="hidden" name="id" value={initialData?.id || ""} />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name || ""}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          className="col-span-3"
        />
      </div>
      {/* TODO: Add error display from fetcher.data?.errors if any */}
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save changes" : "Add category")}
      </Button>
    </fetcher.Form>
  );
}