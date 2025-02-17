import { db } from "@/index";
import { marketItems } from "@/db/schema";
import { desc, asc, sql, and, ilike, SQL } from "drizzle-orm";

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type SortingState = {
  id: string;
  desc: boolean;
}[];

// Custom operators for calculated fields
const profitGte = (value: number) => {
  return sql`((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) >= ${value}`;
};

const profitLte = (value: number) => {
  return sql`((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) <= ${value}`;
};

const dailyProfitGte = (value: number) => {
  return sql`(
    ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) * 
    (
      (
        COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
        COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
        COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
        COALESCE(${marketItems["1d_sell_delisted"]}, 0)
      ) / 2.0
    )
  ) >= ${value}`;
};

const dailyProfitLte = (value: number) => {
  return sql`(
    ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) * 
    (
      (
        COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
        COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
        COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
        COALESCE(${marketItems["1d_sell_delisted"]}, 0)
      ) / 2.0
    )
  ) <= ${value}`;
};

const velocityGte = (value: number) => {
  return sql`(
    COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
    COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
    COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
    COALESCE(${marketItems["1d_sell_delisted"]}, 0)
  ) >= ${value}`;
};

const velocityLte = (value: number) => {
  return sql`(
    COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
    COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
    COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
    COALESCE(${marketItems["1d_sell_delisted"]}, 0)
  ) <= ${value}`;
};

const supplyVelocityGte = (value: number) => {
  return sql`(COALESCE(${marketItems["7d_sell_listed"]}, 0) - 
    (COALESCE(${marketItems["7d_sell_delisted"]}, 0) + COALESCE(${marketItems["7d_sell_sold"]}, 0))) >= ${value}`;
};

const supplyVelocityLte = (value: number) => {
  return sql`(COALESCE(${marketItems["7d_sell_listed"]}, 0) - 
    (COALESCE(${marketItems["7d_sell_delisted"]}, 0) + COALESCE(${marketItems["7d_sell_sold"]}, 0))) <= ${value}`;
};

const marketRatioGte = (value: number) => {
  return sql`CASE 
    WHEN COALESCE(${marketItems.sell_quantity}, 0) > 0 
    THEN CAST(COALESCE(${marketItems.buy_quantity}, 0) AS FLOAT) / CAST(${marketItems.sell_quantity} AS FLOAT) >= ${value}
    ELSE FALSE 
  END`;
};

const marketRatioLte = (value: number) => {
  return sql`CASE 
    WHEN COALESCE(${marketItems.sell_quantity}, 0) > 0 
    THEN CAST(COALESCE(${marketItems.buy_quantity}, 0) AS FLOAT) / CAST(${marketItems.sell_quantity} AS FLOAT) <= ${value}
    ELSE ${value} >= 0 
  END`;
};

const buyExpectationsCalc = sql`
  CASE 
    WHEN COALESCE(${marketItems.buy_quantity}, 0) = 0 THEN 0
    WHEN COALESCE(${marketItems["1d_buy_listed"]}, 0) = 0 THEN 0
    ELSE
      -- Simple hourly rate based on successful buys only
      CAST(COALESCE(${marketItems["1d_buy_sold"]}, 0) AS FLOAT) / 24
  END
`;

const cappedProfitPerHourGte = (value: number) => {
  return sql`
    (
      (COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)
    ) * (${buyExpectationsCalc}) >= ${value}
  `;
};

const cappedProfitPerHourLte = (value: number) => {
  return sql`
    (
      (COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)
    ) * (${buyExpectationsCalc}) <= ${value}
  `;
};

const listingFeeCalc = sql`
  GREATEST(1, CEIL(COALESCE(${marketItems.sell_price}, 0) * 0.05))
`;

const relistAllowanceCalc = sql`
  CASE 
    WHEN ${listingFeeCalc} = 0 THEN 0
    ELSE FLOOR(
      (
        (COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)
      ) / ${listingFeeCalc}
    )
  END
`;

const sellExpectationsCalc = sql`
  CASE 
    WHEN COALESCE(${marketItems.sell_quantity}, 0) = 0 THEN 0
    WHEN COALESCE(${marketItems["1d_sell_listed"]}, 0) = 0 THEN 0
    ELSE
      (
        CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) + COALESCE(${marketItems["1d_sell_delisted"]}, 0) AS FLOAT) / 2 / 24
      ) * (
        24 / NULLIF(
          (
            CAST(COALESCE(${marketItems["1d_sell_delisted"]}, 0) + COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) /
            NULLIF(CAST(COALESCE(${marketItems["1d_sell_listed"]}, 0) AS FLOAT), 0)
          ),
          0
        )
      )
  END
`;

const expectationsGte = (value: number) => {
  // We'll filter based on sell expectations by default
  return sql`${sellExpectationsCalc} >= ${value}`;
};

const expectationsLte = (value: number) => {
  // We'll filter based on sell expectations by default
  return sql`${sellExpectationsCalc} <= ${value}`;
};

const soldTotalGte = (value: number) => {
  return sql`(COALESCE(${marketItems["1d_sell_sold"]}, 0) + COALESCE(${marketItems["1d_sell_delisted"]}, 0)) >= ${value}`;
};

const soldTotalLte = (value: number) => {
  return sql`(COALESCE(${marketItems["1d_sell_sold"]}, 0) + COALESCE(${marketItems["1d_sell_delisted"]}, 0)) <= ${value}`;
};

const boughtTotalGte = (value: number) => {
  return sql`(COALESCE(${marketItems["1d_buy_sold"]}, 0) + COALESCE(${marketItems["1d_buy_delisted"]}, 0)) >= ${value}`;
};

const boughtTotalLte = (value: number) => {
  return sql`(COALESCE(${marketItems["1d_buy_sold"]}, 0) + COALESCE(${marketItems["1d_buy_delisted"]}, 0)) <= ${value}`;
};

const sellRateGte = (value: number) => {
  return sql`CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24 >= ${value}`;
};

const sellRateLte = (value: number) => {
  return sql`CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24 <= ${value}`;
};

const profitPerHourGte = (value: number) => {
  return sql`(CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24) * 
    ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) >= ${value}`;
};

const profitPerHourLte = (value: number) => {
  return sql`(CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24) * 
    ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) <= ${value}`;
};

export async function fetchMarketData(
  pagination: PaginationState = { pageIndex: 0, pageSize: 25 },
  sorting: SortingState = [],
  filters: any = {}
) {
  try {
    const offset = pagination.pageIndex * pagination.pageSize;
    const conditions: SQL[] = [];

    // Build filter conditions
    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (!value) return;

      switch (key) {
        case "profit": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(profitGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(profitLte(Number(value.max)));
          }
          break;
        }

        case "daily_profit": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(dailyProfitGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(dailyProfitLte(Number(value.max)));
          }
          break;
        }
        case "supply_trend": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(supplyVelocityGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(supplyVelocityLte(Number(value.max)));
          }
          break;
        }

        case "listing_fee": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(sql`${listingFeeCalc} >= ${Number(value.min)}`);
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(sql`${listingFeeCalc} <= ${Number(value.max)}`);
          }
          break;
        }

        case "relist_allowance": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(
              sql`${relistAllowanceCalc} >= ${Number(value.min)}`
            );
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(
              sql`${relistAllowanceCalc} <= ${Number(value.max)}`
            );
          }
          break;
        }

        case "velocity": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(velocityGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(velocityLte(Number(value.max)));
          }
          break;
        }

        case "market_activity": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(marketRatioGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(marketRatioLte(Number(value.max)));
          }
          break;
        }
        case "sold_24h": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(soldTotalGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(soldTotalLte(Number(value.max)));
          }
          break;
        }
        case "bought_24h": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(boughtTotalGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(boughtTotalLte(Number(value.max)));
          }
          break;
        }
        case "sell_rate": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(sellRateGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(sellRateLte(Number(value.max)));
          }
          break;
        }
        case "profit_per_hour": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(profitPerHourGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(profitPerHourLte(Number(value.max)));
          }
          break;
        }

        case "capped_profit_per_hour": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(cappedProfitPerHourGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(cappedProfitPerHourLte(Number(value.max)));
          }
          break;
        }

        case "expectations": {
          if (value.min && !isNaN(Number(value.min))) {
            conditions.push(expectationsGte(Number(value.min)));
          }
          if (value.max && !isNaN(Number(value.max))) {
            conditions.push(expectationsLte(Number(value.max)));
          }
          break;
        }

        case "name": {
          if (typeof value === "string" && value.trim()) {
            conditions.push(ilike(marketItems.name, `%${value.trim()}%`));
          }
          break;
        }
        // Add number range filters for standard columns
        default: {
          const column = marketItems[key as keyof typeof marketItems];
          if (column && value) {
            if (typeof value === "object") {
              if (value.min && !isNaN(Number(value.min))) {
                conditions.push(sql`${column} >= ${Number(value.min)}`);
              }
              if (value.max && !isNaN(Number(value.max))) {
                conditions.push(sql`${column} <= ${Number(value.max)}`);
              }
            } else if (typeof value === "string" && value.trim()) {
              conditions.push(ilike(column, `%${value.trim()}%`));
            }
          }
        }
      }
    });

    // Create base query with filters
    const baseQuery = db.select().from(marketItems);

    // Apply filters if any exist
    const filteredQuery =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Get total count before applying sorting and pagination
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(filteredQuery.as("filtered_items"))
      .execute();

    // Apply sorting to the filtered query
    let sortedQuery = filteredQuery;
    if (sorting.length > 0) {
      const { id, desc: isDesc } = sorting[0];
      switch (id) {
        case "profit":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) DESC NULLS LAST`
              : sql`((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) ASC NULLS LAST`
          );
          break;
        case "supply_trend":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(COALESCE(${marketItems["7d_sell_listed"]}, 0) - 
                (COALESCE(${marketItems["7d_sell_delisted"]}, 0) + COALESCE(${marketItems["7d_sell_sold"]}, 0))) DESC NULLS LAST`
              : sql`(COALESCE(${marketItems["7d_sell_listed"]}, 0) - 
                (COALESCE(${marketItems["7d_sell_delisted"]}, 0) + COALESCE(${marketItems["7d_sell_sold"]}, 0))) ASC NULLS LAST`
          );
          break;

        case "velocity":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(
          COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
          COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
          COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
          COALESCE(${marketItems["1d_sell_delisted"]}, 0)
        ) DESC NULLS LAST`
              : sql`(
          COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
          COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
          COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
          COALESCE(${marketItems["1d_sell_delisted"]}, 0)
        ) ASC NULLS LAST`
          );
          break;

        case "market_activity":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`CASE 
                  WHEN COALESCE(${marketItems.sell_quantity}, 0) > 0 
                  THEN CAST(COALESCE(${marketItems.buy_quantity}, 0) AS FLOAT) / CAST(${marketItems.sell_quantity} AS FLOAT)
                  ELSE 0 
                END DESC NULLS LAST`
              : sql`CASE 
                  WHEN COALESCE(${marketItems.sell_quantity}, 0) > 0 
                  THEN CAST(COALESCE(${marketItems.buy_quantity}, 0) AS FLOAT) / CAST(${marketItems.sell_quantity} AS FLOAT)
                  ELSE 0 
                END ASC NULLS LAST`
          );
          break;

        case "listing_fee":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`${listingFeeCalc} DESC NULLS LAST`
              : sql`${listingFeeCalc} ASC NULLS LAST`
          );
          break;

        case "relist_allowance":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`${relistAllowanceCalc} DESC NULLS LAST`
              : sql`${relistAllowanceCalc} ASC NULLS LAST`
          );
          break;

        case "daily_profit":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(
          ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) * 
          (
            (
              COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
              COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
              COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
              COALESCE(${marketItems["1d_sell_delisted"]}, 0)
            ) / 2.0
          )
        ) DESC NULLS LAST`
              : sql`(
          ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) * 
          (
            (
              COALESCE(${marketItems["1d_buy_sold"]}, 0) + 
              COALESCE(${marketItems["1d_buy_delisted"]}, 0) +
              COALESCE(${marketItems["1d_sell_sold"]}, 0) + 
              COALESCE(${marketItems["1d_sell_delisted"]}, 0)
            ) / 2.0
          )
        ) ASC NULLS LAST`
          );
          break;

        case "sold_24h":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(COALESCE(${marketItems["1d_sell_sold"]}, 0) + COALESCE(${marketItems["1d_sell_delisted"]}, 0)) DESC NULLS LAST`
              : sql`(COALESCE(${marketItems["1d_sell_sold"]}, 0) + COALESCE(${marketItems["1d_sell_delisted"]}, 0)) ASC NULLS LAST`
          );
          break;
        case "bought_24h":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(COALESCE(${marketItems["1d_buy_sold"]}, 0) + COALESCE(${marketItems["1d_buy_delisted"]}, 0)) DESC NULLS LAST`
              : sql`(COALESCE(${marketItems["1d_buy_sold"]}, 0) + COALESCE(${marketItems["1d_buy_delisted"]}, 0)) ASC NULLS LAST`
          );
          break;
        case "sell_rate":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24 DESC NULLS LAST`
              : sql`CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24 ASC NULLS LAST`
          );
          break;
        case "profit_per_hour":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`(CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24) * 
                  ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) DESC NULLS LAST`
              : sql`(CAST(COALESCE(${marketItems["1d_sell_sold"]}, 0) AS FLOAT) / 24) * 
                  ((COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)) ASC NULLS LAST`
          );
          break;

        case "capped_profit_per_hour":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`
          (
            (COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)
          ) * (${buyExpectationsCalc}) DESC NULLS LAST
        `
              : sql`
          (
            (COALESCE(${marketItems.sell_price}, 0) * 0.85) - COALESCE(${marketItems.buy_price}, 0)
          ) * (${buyExpectationsCalc}) ASC NULLS LAST
        `
          );
          break;

        case "expectations":
          sortedQuery = sortedQuery.orderBy(
            isDesc
              ? sql`${sellExpectationsCalc} DESC NULLS LAST`
              : sql`${sellExpectationsCalc} ASC NULLS LAST`
          );
          break;
        default:
          const column = marketItems[id as keyof typeof marketItems];
          if (column) {
            sortedQuery = sortedQuery.orderBy(
              isDesc ? desc(column) : asc(column)
            );
          }
      }
    } else {
      sortedQuery = sortedQuery.orderBy(asc(marketItems.name));
    }

    // Apply pagination and get the data
    const data = await sortedQuery
      .limit(pagination.pageSize)
      .offset(offset)
      .execute();

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

// Helper function to format value ranges for logging
function formatValueRange(value: any) {
  if (!value) return "none";
  if (typeof value === "string") return value;
  const { min, max } = value;
  if (min && max) return `${min} to ${max}`;
  if (min) return `>= ${min}`;
  if (max) return `<= ${max}`;
  return "none";
}

// Helper function to safely extract numeric values
function safeParseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

// Export some utility functions that might be useful for testing or debugging
export const utils = {
  formatValueRange,
  safeParseNumber,
  profitGte,
  profitLte,
  supplyVelocityGte,
  supplyVelocityLte,
  marketRatioGte,
  marketRatioLte,
  soldTotalGte,
  soldTotalLte,
  boughtTotalGte,
  boughtTotalLte,
  sellRateGte,
  sellRateLte,
  profitPerHourGte,
  profitPerHourLte,
};
