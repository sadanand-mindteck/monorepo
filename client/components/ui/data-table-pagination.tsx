"use client";

import * as React from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronsLeft, ChevronsRight, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "./card";

export interface ServerSideDataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data:
    | {
        data: T[];
        pagination: { total: number; page: number; limit: number; pages: number };
      }
    | undefined;
  isLoading: Boolean;
  page: string;
  setPage: React.Dispatch<React.SetStateAction<string>>;
  limit: string;
  setLimit: React.Dispatch<React.SetStateAction<string>>;
  search?: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
}

export function ServerSideDataTable<T>({
  columns,
  data,
  isLoading,
  page = "1",
  limit = "10",
  setLimit,
  search = "",
  setPage,
  setSearch,
  children,
}: ServerSideDataTableProps<T>) {
  const searchDebounce = React.useRef<NodeJS.Timeout | null>(null);
  const [searchInput, setSearchInput] = React.useState(search || ""); // instant typing

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  React.useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearch(searchInput); // triggers query only after delay
      setPage("1");
    }, 500);

    return () => clearTimeout(searchDebounce.current!);
  }, [searchInput]);

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchInput} // instant feedback
                onChange={(e) => setSearchInput(e.target.value)} // no delay here
                className="pl-8"
              />
            </div>
            {children}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center h-24">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center h-24">
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page:</span>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(v);
                  setPage("1");
                }}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p: string) => Math.max(+p - 1, 1).toString())}
                disabled={page === "1"}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {data?.pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p: string) => Math.min(+p + 1, data?.pagination.total || 1).toString())}
                disabled={+page >= (data?.pagination.pages || 1)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
