// app/page.tsx
import { Suspense } from "react";
import { MarketItem, columns } from "./columns";
import { DataTable } from "./data-table";
import { db } from "@/index";
import { marketItems } from "@/db/schema";
import { UpdateButton } from "@/components/UpdateButton";
import { desc, asc, sql } from "drizzle-orm";

// Types for pagination and sorting
export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type SortingState = {
  id: string;
  desc: boolean;
}[];

async function getMarketData(
  pagination: PaginationState = { pageIndex: 0, pageSize: 25 },
  sorting: SortingState = [],
  filters: any = {}
) {
  try {
    const offset = pagination.pageIndex * pagination.pageSize;

    // Build the base query
    let query = db.select().from(marketItems);

    // Apply filters if any
    if (filters.name) {
      query = query.where(
        sql`${marketItems.name} ILIKE ${`%${filters.name}%`}`
      );
    }

    // Apply sorting
    if (sorting.length > 0) {
      const { id, desc: isDesc } = sorting[0];
      const column = marketItems[id as keyof typeof marketItems];
      if (column) {
        query = query.orderBy(isDesc ? desc(column) : asc(column));
      }
    }

    // Get total count for pagination
    const totalPromise = db
      .select({ count: sql`count(*)` })
      .from(marketItems)
      .execute();

    // Get paginated data
    const dataPromise = query
      .limit(pagination.pageSize)
      .offset(offset)
      .execute();

    // Wait for both queries
    const [data, [{ count }]] = await Promise.all([dataPromise, totalPromise]);

    return {
      data,
      pageCount: Math.ceil(Number(count) / pagination.pageSize),
      total: Number(count),
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return {
      data: [],
      pageCount: 0,
      total: 0,
    };
  }
}

export default async function MarketPage() {
  // Get initial data
  const { data, pageCount, total } = await getMarketData();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Data</h1>
        <UpdateButton />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          initialTotal={total}
        />
      </Suspense>
    </div>
  );
}
