import { Suspense } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UpdateButton } from "@/components/UpdateButton";
import { fetchMarketData } from "@/lib/market-utils";
import ProfitOptimizer from "@/components/ProfitOptimiser";

export default async function MarketPage() {
  // Get initial data using the shared fetch function
  const { data, pageCount, total } = await fetchMarketData();

  return (
    <div className="w-full px-4 py-10">
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
        <ProfitOptimizer data={data} />
      </Suspense>
    </div>
  );
}
