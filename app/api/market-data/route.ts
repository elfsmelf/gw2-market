import { NextResponse } from "next/server";
import { db } from "@/index";
import { marketItems } from "@/db/schema";
import { desc, asc, sql, and, ilike, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageIndex = parseInt(searchParams.get("pageIndex") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");
    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder");
    const filters = JSON.parse(searchParams.get("filters") || "{}");

    console.log("API received filters:", filters);

    const offset = pageIndex * pageSize;
    const conditions: any[] = [];

    // Build filter conditions
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (!value) return;

      switch (key) {
        case "profit": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(
              sql`(COALESCE(${marketItems.sell_price}, 0) - COALESCE(${marketItems.buy_price}, 0)) >= ${Number(value.min)}`
            );
            console.log("Added profit filter >=", value.min);
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(
              sql`(COALESCE(${marketItems.sell_price}, 0) - COALESCE(${marketItems.buy_price}, 0)) <= ${Number(value.max)}`
            );
            console.log("Added profit filter <=", value.max);
          }
          break;
        }
        case "sell_quantity": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(gte(marketItems.sell_quantity, Number(value.min)));
            console.log("Added sell_quantity filter >=", value.min);
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(lte(marketItems.sell_quantity, Number(value.max)));
            console.log("Added sell_quantity filter <=", value.max);
          }
          break;
        }
        case "buy_quantity": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(gte(marketItems.buy_quantity, Number(value.min)));
            console.log("Added buy_quantity filter >=", value.min);
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(lte(marketItems.buy_quantity, Number(value.max)));
            console.log("Added buy_quantity filter <=", value.max);
          }
          break;
        }
        case "name": {
          if (typeof value === "string" && value.trim()) {
            conditions.push(ilike(marketItems.name, `%${value.trim()}%`));
            console.log("Added name filter:", value.trim());
          }
          break;
        }
      }
    });

    // Build the query
    let query = db.select().from(marketItems);

    // Apply filters if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sortField && sortOrder) {
      if (sortField === "profit") {
        query = query.orderBy(
          sortOrder === "desc"
            ? sql`(COALESCE(${marketItems.sell_price}, 0) - COALESCE(${marketItems.buy_price}, 0)) DESC NULLS LAST`
            : sql`(COALESCE(${marketItems.sell_price}, 0) - COALESCE(${marketItems.buy_price}, 0)) ASC NULLS LAST`
        );
      } else {
        const column = marketItems[sortField as keyof typeof marketItems];
        if (column) {
          query = query.orderBy(
            sortOrder === "desc"
              ? sql`${column} DESC NULLS LAST`
              : sql`${column} ASC NULLS LAST`
          );
        }
      }
    } else {
      query = query.orderBy(sql`${marketItems.name} ASC NULLS LAST`);
    }

    // Get the SQL query for debugging
    const debugQuery = query.toSQL();
    console.log("Generated SQL:", debugQuery.sql);
    console.log("SQL parameters:", debugQuery.params);

    // Clone the query for count (without limit/offset)
    const countQuery = query;

    // Add pagination to the main query
    query = query.limit(pageSize).offset(offset);

    // Execute both queries
    const [data, [{ count }]] = await Promise.all([
      query.execute(),
      db
        .select({ count: sql`count(*)` })
        .from(countQuery.as("filtered_items"))
        .execute(),
    ]);

    // Log a sample of the results for debugging
    console.log(
      "Sample results (first 3 items):",
      data.slice(0, 3).map((item) => ({
        name: item.name,
        sell_quantity: item.sell_quantity,
        buy_quantity: item.buy_quantity,
        profit: (item.sell_price || 0) - (item.buy_price || 0),
      }))
    );

    return NextResponse.json({
      data,
      pageCount: Math.ceil(Number(count) / pageSize),
      total: Number(count),
    });
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
