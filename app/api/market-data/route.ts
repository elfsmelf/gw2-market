import { NextResponse } from "next/server";
import { fetchMarketData } from "@/lib/market-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");
    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder");
    const filters = JSON.parse(searchParams.get("filters") || "{}");

    console.log("API received filters:", filters);

    const result = await fetchMarketData(
      { pageIndex, pageSize },
      sortField ? [{ id: sortField, desc: sortOrder === "desc" }] : [],
      filters
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching market data:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
