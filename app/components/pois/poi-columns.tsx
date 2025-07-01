// app/components/pois/poi-columns.tsx
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
import { type PoiFeature } from "~/types/geojson";
import { Edit, Trash2 } from "lucide-react";

export const columns: ColumnDef<PoiFeature>[] = [
  {
    accessorKey: "properties.name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.properties.name}</div>,
  },
  {
    accessorKey: "properties.category",
    header: "Category",
    cell: ({ row }) => <div>{row.original.properties.category}</div>,
  },
  {
    accessorKey: "properties.floor",
    header: "Floor",
    cell: ({ row }) => <div>{row.original.properties.floor}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const poi = row.original;

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
                window.dispatchEvent(new CustomEvent('open-edit-poi-dialog', { detail: poi }));
              }}
            >
              <Edit className="mr-2 h-4 w-4"/> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-delete-poi-dialog', { detail: poi }));
              }}
              className="text-red-600 focus:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4"/> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];