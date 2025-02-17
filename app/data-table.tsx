"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CoinDisplay from "@/components/CoinDisplay";

// Helper to determine if a column is price-related
const isPriceColumn = (columnId: string) => {
  return ["buy_price", "sell_price", "profit"].includes(columnId);
};

// Helper function to parse URL params
const parseURLParams = (searchParams: URLSearchParams) => {
  const filters = searchParams.get("filters");
  const sortField = searchParams.get("sortField");
  const sortOrder = searchParams.get("sortOrder");
  const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
  const pageSize = parseInt(searchParams.get("pageSize") || "25");

  return {
    filters: filters ? JSON.parse(filters) : {},
    sorting: sortField ? [{ id: sortField, desc: sortOrder === "desc" }] : [],
    pagination: { pageIndex, pageSize },
  };
};

// Helper function to convert filters to column filters
const filtersToColumnFilters = (filters: Record<string, any>) => {
  return Object.entries(filters).map(([id, value]) => ({
    id,
    value,
  }));
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  initialTotal: number;
}

function DataTableViewOptions({ table }: { table: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          View Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="p-2">
          <div className="mb-2 text-sm font-medium">Toggle columns</div>
          {table
            .getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => {
              const isCoreColumn = [
                "img",
                "name",
                "buy_price",
                "sell_price",
                "profit",
                "daily_profit",
                "profit_per_hour",
                "capped_profit_per_hour",
                "expectations",
              ].includes(column.id);

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className={`capitalize ${isCoreColumn ? "font-medium" : ""}`}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.columnDef.header}
                </DropdownMenuCheckboxItem>
              );
            })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTableFilters<TData, TValue>({ table }: { table: any }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {table.getHeaderGroups()[0].headers.map(
          (header: any) =>
            header.column.getCanFilter() && (
              <div key={header.id} className="space-y-2">
                <Label className="text-sm font-medium">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </Label>
                {header.column.columnDef.sortingFn === "number" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={
                            (header.column.getFilterValue() as { min?: string })
                              ?.min ?? ""
                          }
                          onChange={(e) =>
                            header.column.setFilterValue((old: any) => ({
                              ...old,
                              min: e.target.value,
                            }))
                          }
                          className="w-full"
                        />
                        {isPriceColumn(header.id) &&
                          (header.column.getFilterValue() as { min?: string })
                            ?.min &&
                          !isNaN(
                            Number(
                              (
                                header.column.getFilterValue() as {
                                  min?: string;
                                }
                              ).min
                            )
                          ) && (
                            <div className="text-sm text-muted-foreground min-h-[24px]">
                              <CoinDisplay
                                value={Number(
                                  (
                                    header.column.getFilterValue() as {
                                      min?: string;
                                    }
                                  ).min
                                )}
                              />
                            </div>
                          )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Max"
                          value={
                            (header.column.getFilterValue() as { max?: string })
                              ?.max ?? ""
                          }
                          onChange={(e) =>
                            header.column.setFilterValue((old: any) => ({
                              ...old,
                              max: e.target.value,
                            }))
                          }
                          className="w-full"
                        />
                        {isPriceColumn(header.id) &&
                          (header.column.getFilterValue() as { max?: string })
                            ?.max &&
                          !isNaN(
                            Number(
                              (
                                header.column.getFilterValue() as {
                                  max?: string;
                                }
                              ).max
                            )
                          ) && (
                            <div className="text-sm text-muted-foreground min-h-[24px]">
                              <CoinDisplay
                                value={Number(
                                  (
                                    header.column.getFilterValue() as {
                                      max?: string;
                                    }
                                  ).max
                                )}
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="text"
                    placeholder={`Filter ${flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}...`}
                    value={(header.column.getFilterValue() as string) ?? ""}
                    onChange={(e) =>
                      header.column.setFilterValue(e.target.value)
                    }
                  />
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
}

function DataTableSortingInfo({ sorting }: { sorting: SortingState }) {
  if (sorting.length === 0) return null;

  return (
    <div className="text-sm text-muted-foreground mb-4">
      {sorting.map((sort) => (
        <span key={sort.id} className="mr-4">
          Sorted by {sort.id} ({sort.desc ? "descending" : "ascending"})
        </span>
      ))}
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  pageCount: initialPageCount,
  initialTotal,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = React.useMemo(
    () => parseURLParams(searchParams),
    [searchParams]
  );

  const [data, setData] = React.useState(initialData);
  const [total, setTotal] = React.useState(initialTotal);
  const [isLoading, setIsLoading] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    filtersToColumnFilters(urlState.filters)
  );
  const [sorting, setSorting] = React.useState<SortingState>(urlState.sorting);
  const [{ pageIndex, pageSize }, setPagination] = React.useState(
    urlState.pagination
  );

  // Set default column visibility
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({
    // Core columns visible by default
    img: true,
    name: true,
    buy_price: true,
    sell_price: true,
    profit: true,
    daily_profit: true,
    profit_per_hour: true,
    capped_profit_per_hour: true,
    expectations: true,
    // Hide all other columns by default
    velocity: false,
    market_activity: false,
    supply_trend: false,
    sold_24h: false,
    bought_24h: false,
    sell_rate: false,
    listing_fee: false,
    relist_allowance: false,
  });

  const [debouncedFilters] = useDebounce(columnFilters, 500);

  const fetchData = React.useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams(searchParams);
      params.set("pageIndex", pageIndex.toString());
      params.set("pageSize", pageSize.toString());

      // Convert column filters to object format
      const filterObject = debouncedFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, any>
      );

      params.set("filters", JSON.stringify(filterObject));

      if (sorting.length > 0) {
        params.set("sortField", sorting[0].id);
        params.set("sortOrder", sorting[0].desc ? "desc" : "asc");
      } else {
        params.delete("sortField");
        params.delete("sortOrder");
      }

      // Update URL without navigation
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      const response = await fetch(`/api/market-data?${params}`);
      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();
      setData(json.data);
      setTotal(json.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    pageIndex,
    pageSize,
    debouncedFilters,
    sorting,
    isLoading,
    router,
    pathname,
    searchParams,
  ]);

  React.useEffect(() => {
    fetchData();
  }, [debouncedFilters, sorting, pageIndex, pageSize]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pageSize),
    state: {
      columnFilters,
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <DataTableFilters table={table} />
        <DataTableViewOptions table={table} />
      </div>

      <DataTableSortingInfo sorting={sorting} />

      <div className="relative rounded-md border">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={`py-4 ${
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <div className="w-4 flex-none">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {total.toLocaleString()} total items
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 order-1 sm:order-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Rows per page
            </p>
            <select
              value={pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="h-8 w-[70px] rounded-md border"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm whitespace-nowrap">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
