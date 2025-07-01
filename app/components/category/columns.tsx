// import { Category } from "~/types";
// import { ColumnDef } from "@tanstack/react-table";

// import { Checkbox } from "~/components/ui/checkbox";
// import { CellAction } from "./cell-action";


// export const columns: ColumnDef<Category>[] = [
//   {
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={table.getIsAllPageRowsSelected()}
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: "categoryPoi",
//     header: "Category POI",
//   },
//   {
//     accessorKey: "categoryName",
//     header: "Category Name",
//   },
//   {
//     accessorKey: "description",
//     header: "Description",
//   },
//   {
//     id: "actions",
//     cell: ({ row }) => <CellAction data={row.original} />,
//   },
// ];


// components/categories/category-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { type Category } from "@prisma/client"; // Import Prisma type
import { Edit, Trash, Trash2 } from "lucide-react";

export type CategoryTableData = Omit<Category, 'building' | 'createdAt' | 'updatedAt'> & {
  createdAt: string; // On the client, this will be a string
  updatedAt: string; // On the client, this will be a string
};

export const columns: ColumnDef<CategoryTableData>[] = [
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("description") || "No description"}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              // This action will trigger an "edit" mode in your parent component
              // You might pass a prop to open a dialog with the category data
              onClick={() => {
                // TODO: Implement actual edit logic, e.g., open a dialog

                window.dispatchEvent(new CustomEvent('open-edit-category-dialog', { detail: category }));
              }}
            >
              <Edit className="mr-2 w-4 h-4"/> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              // This action will trigger a "delete" confirmation dialog
              onClick={() => {
                // TODO: Implement actual delete logic, e.g., open a confirmation dialog
                
                window.dispatchEvent(new CustomEvent('open-delete-category-dialog', { detail: category }));
              }}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 w-4 h-4"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];