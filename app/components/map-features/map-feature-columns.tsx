


import { DotsHorizontalIcon } from "@radix-ui/react-icons";


"use client"; //

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox"; // 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge"; // 



export type MapFeatureTableData = {
  id: string;
  name: string;
  categoryName: string; // 
  height: number;
  geometryType: string;
  show: boolean; // <-- IMPORTANT: Add the 'show' property here
  // Add any other properties you display in the table
};

export const columns: ColumnDef<MapFeatureTableData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {/* Show sorting indicator based on column state */}
          {column.getIsSorted() === "asc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" /> // Optional: dim default icon
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "categoryName", // Or "feature_type" if that's what's used in table data
    header: "Category",
  },
  {
    accessorKey: "height",
    header: "Height",
  },
  {
    accessorKey: "geometryType",
    header: "Geometry Type",
  },
  
  {
    accessorKey: "show", // You can use accessorKey for sorting/filtering based on boolean
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {/* Show sorting indicator based on column state */}
          {column.getIsSorted() === "asc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" /> // Optional: dim default icon
          )}
        </Button>
      );
    },
    // Custom cell rendering for "Published" / "Unpublished" text
    cell: ({ row }) => {
      const showStatus = row.getValue("show") as boolean;
      return (
        <Badge variant={showStatus ? "default" : "secondary"}>
          {showStatus ? "Published" : "Unpublished"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const feature = row.original;

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
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-edit-map-feature-dialog', { detail: feature }));
              }}
            >
              <Edit className="mr-2 h-4 w-4" /> 
              Update
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-delete-map-feature-dialog', { detail: feature }));
              }}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];