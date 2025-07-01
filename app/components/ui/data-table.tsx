
"use client"; // Make sure this is a client component

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState, // Import this
  flexRender,
  getCoreRowModel,
  getFilteredRowModel, // Import this
  getPaginationRowModel,
  useReactTable,
  // ... other imports
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input"; // Assuming you have a filter input here
import { Button } from "./button";
import { Card } from "./card";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  // State for global filter
  const [globalFilter, setGlobalFilter] = React.useState(''); // <--- IMPORTANT: State for filter input
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]); // For column-specific filters if you use them

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Add filter state and handlers
    onGlobalFilterChange: setGlobalFilter, // <--- IMPORTANT: Link state to table
    onColumnFiltersChange: setColumnFilters, // For column-specific filters
    getFilteredRowModel: getFilteredRowModel(), // <--- IMPORTANT: Enable filtering
    state: {
      globalFilter: globalFilter, // <--- IMPORTANT: Pass filter value to table
      columnFilters: columnFilters,
      // ... other states like sorting, pagination
    },
  });

  return (
    <div>
      {/* Global filter input */}
      <div className="flex items-center py-4">
        <Card className="flex justify-between items-center">
        <Input
          placeholder="Search Items..."
          value={globalFilter} // <--- IMPORTANT: Bind value to state
          onChange={(event) => setGlobalFilter(event.target.value)} // <--- IMPORTANT: Update state on change
          className="max-w-sm border-none"
        />
        <Search className="h-6 w-6 mx-2" />
        </Card>
                     <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="ml-auto"
                >
                    Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {table
                    .getAllColumns()
                    .filter(
                    (column) => column.getCanHide()
                    )
                    .map((column) => {
                    return (
                        <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                        }
                        >
                        {column.id}
                        </DropdownMenuCheckboxItem>
                    )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Add pagination controls here if you haven't */}
        {/* <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Previous
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Next
                </Button>
            </div>
        </div> */}
              <div className="flex flex-col items-center justify-end gap-2 space-x-2 py-4 sm:flex-row">
                <div className="flex w-full items-center justify-between">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing {table.getFilteredSelectedRowModel().rows.length}
                    -
                    {table.getFilteredRowModel().rows.length} of row(s) selected.
                  </div>

                </div>
                <div className="flex w-full items-center justify-between gap-2 sm:justify-end">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      aria-label="Go to first page"
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <DoubleArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Go to previous page"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Go to next page"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Go to last page"
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      <DoubleArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
    </div>
  );
}