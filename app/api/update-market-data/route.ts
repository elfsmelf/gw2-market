// app/api/update-market-data/route.ts
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "../../../index";
import { marketItems } from "../../../db/schema";

const API_URL =
  "https://api.datawars2.ie/gw2/v1/items/json?fields=id,name,charm,img,rarity,chat_link,level,type,firstAdded,statName,upgradeName,weaponType,lastUpdate,buy_price,sell_price,sell_quantity,buy_quantity,1d_sell_price_avg,1d_sell_sold,1d_sell_listed,1d_sell_delisted,1d_sell_value,1d_sell_quantity_avg,2d_sell_price_avg,2d_sell_sold,2d_sell_listed,2d_sell_delisted,2d_sell_value,2d_sell_quantity_avg,7d_sell_price_avg,7d_sell_sold,7d_sell_listed,7d_sell_delisted,7d_sell_value,7d_sell_quantity_avg,1m_sell_price_avg,1m_sell_sold,1m_sell_listed,1m_sell_delisted,1m_sell_value,1m_sell_quantity_avg,1d_buy_price_avg,1d_buy_sold,1d_buy_listed,1d_buy_delisted,1d_buy_value,1d_buy_quantity_avg,2d_buy_price_avg,2d_buy_sold,2d_buy_listed,2d_buy_delisted,2d_buy_value,2d_buy_quantity_avg,7d_buy_price_avg,7d_buy_sold,7d_buy_listed,7d_buy_delisted,7d_buy_value,7d_buy_quantity_avg,1m_buy_price_avg,1m_buy_sold,1m_buy_listed,1m_buy_delisted,1m_buy_value,1m_buy_quantity_avg,1d_sell_delisted_value,2d_sell_delisted_value,7d_sell_delisted_value,1m_sell_delisted_value&beautify=min";

async function fetchMarketData() {
  try {
    console.log("Fetching market data from API...");
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(
        `API response error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} items`);
    return data;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

function transformMarketData(item: any) {
  // Convert numeric strings to numbers for bigint fields
  const numericFields = [
    "id",
    "level",
    "buy_price",
    "sell_price",
    "buy_quantity",
    "sell_quantity",
    "1d_buy_value",
    "1d_sell_value",
    "2d_buy_value",
    "2d_sell_value",
    "7d_buy_value",
    "7d_sell_value",
    "1m_buy_value",
    "1m_sell_value",
    "1d_buy_sold",
    "1d_sell_sold",
    "1d_buy_listed",
    "1d_sell_listed",
    "1d_buy_delisted",
    "1d_sell_delisted",
    "2d_buy_sold",
    "2d_sell_sold",
    "2d_buy_listed",
    "2d_sell_listed",
    "2d_buy_delisted",
    "2d_sell_delisted",
    "7d_buy_sold",
    "7d_sell_sold",
    "7d_buy_listed",
    "7d_sell_listed",
    "7d_buy_delisted",
    "7d_sell_delisted",
    "1m_buy_sold",
    "1m_sell_sold",
    "1m_buy_listed",
    "1m_sell_listed",
    "1m_buy_delisted",
    "1m_sell_delisted",
    "1d_sell_delisted_value",
    "2d_sell_delisted_value",
    "7d_sell_delisted_value",
    "1m_sell_delisted_value",
  ];

  const transformed = {
    ...item,
    first_added: new Date(item.firstAdded),
    last_update: new Date(item.lastUpdate),
    weapon_type: item.weaponType,
    stat_name: item.statName,
    upgrade_name: item.upgradeName,
  };

  // Convert numeric fields
  numericFields.forEach((field) => {
    if (item[field] !== null && item[field] !== undefined) {
      transformed[field] = Number(item[field]);
    }
  });

  return transformed;
}

export async function GET(request: Request) {
  try {
    const data = await fetchMarketData();

    const batchSize = 100;
    let processed = 0;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize).map(transformMarketData);

      await db
        .insert(marketItems)
        .values(batch)
        .onConflictDoUpdate({
          target: marketItems.id,
          set: {
            buy_price: sql`EXCLUDED.buy_price`,
            sell_price: sql`EXCLUDED.sell_price`,
            buy_quantity: sql`EXCLUDED.buy_quantity`,
            sell_quantity: sql`EXCLUDED.sell_quantity`,
            lastUpdate: sql`EXCLUDED.lastUpdate`,
            "1d_buy_price_avg": sql`EXCLUDED."1d_buy_price_avg"`,
            "1d_sell_price_avg": sql`EXCLUDED."1d_sell_price_avg"`,
            "1d_buy_quantity_avg": sql`EXCLUDED."1d_buy_quantity_avg"`,
            "1d_sell_quantity_avg": sql`EXCLUDED."1d_sell_quantity_avg"`,
            "1d_buy_value": sql`EXCLUDED."1d_buy_value"`,
            "1d_sell_value": sql`EXCLUDED."1d_sell_value"`,
            "1d_buy_sold": sql`EXCLUDED."1d_buy_sold"`,
            "1d_sell_sold": sql`EXCLUDED."1d_sell_sold"`,
            "1d_buy_listed": sql`EXCLUDED."1d_buy_listed"`,
            "1d_sell_listed": sql`EXCLUDED."1d_sell_listed"`,
            "1d_buy_delisted": sql`EXCLUDED."1d_buy_delisted"`,
            "1d_sell_delisted": sql`EXCLUDED."1d_sell_delisted"`,
            "1d_sell_delisted_value": sql`EXCLUDED."1d_sell_delisted_value"`,
            // 2d metrics
            "2d_buy_price_avg": sql`EXCLUDED."2d_buy_price_avg"`,
            "2d_sell_price_avg": sql`EXCLUDED."2d_sell_price_avg"`,
            "2d_buy_quantity_avg": sql`EXCLUDED."2d_buy_quantity_avg"`,
            "2d_sell_quantity_avg": sql`EXCLUDED."2d_sell_quantity_avg"`,
            "2d_buy_value": sql`EXCLUDED."2d_buy_value"`,
            "2d_sell_value": sql`EXCLUDED."2d_sell_value"`,
            "2d_buy_sold": sql`EXCLUDED."2d_buy_sold"`,
            "2d_sell_sold": sql`EXCLUDED."2d_sell_sold"`,
            "2d_buy_listed": sql`EXCLUDED."2d_buy_listed"`,
            "2d_sell_listed": sql`EXCLUDED."2d_sell_listed"`,
            "2d_buy_delisted": sql`EXCLUDED."2d_buy_delisted"`,
            "2d_sell_delisted": sql`EXCLUDED."2d_sell_delisted"`,
            "2d_sell_delisted_value": sql`EXCLUDED."2d_sell_delisted_value"`,
            // 7d metrics
            "7d_buy_price_avg": sql`EXCLUDED."7d_buy_price_avg"`,
            "7d_sell_price_avg": sql`EXCLUDED."7d_sell_price_avg"`,
            "7d_buy_quantity_avg": sql`EXCLUDED."7d_buy_quantity_avg"`,
            "7d_sell_quantity_avg": sql`EXCLUDED."7d_sell_quantity_avg"`,
            "7d_buy_value": sql`EXCLUDED."7d_buy_value"`,
            "7d_sell_value": sql`EXCLUDED."7d_sell_value"`,
            "7d_buy_sold": sql`EXCLUDED."7d_buy_sold"`,
            "7d_sell_sold": sql`EXCLUDED."7d_sell_sold"`,
            "7d_buy_listed": sql`EXCLUDED."7d_buy_listed"`,
            "7d_sell_listed": sql`EXCLUDED."7d_sell_listed"`,
            "7d_buy_delisted": sql`EXCLUDED."7d_buy_delisted"`,
            "7d_sell_delisted": sql`EXCLUDED."7d_sell_delisted"`,
            "7d_sell_delisted_value": sql`EXCLUDED."7d_sell_delisted_value"`,
            // 1m metrics
            "1m_buy_price_avg": sql`EXCLUDED."1m_buy_price_avg"`,
            "1m_sell_price_avg": sql`EXCLUDED."1m_sell_price_avg"`,
            "1m_buy_quantity_avg": sql`EXCLUDED."1m_buy_quantity_avg"`,
            "1m_sell_quantity_avg": sql`EXCLUDED."1m_sell_quantity_avg"`,
            "1m_buy_value": sql`EXCLUDED."1m_buy_value"`,
            "1m_sell_value": sql`EXCLUDED."1m_sell_value"`,
            "1m_buy_sold": sql`EXCLUDED."1m_buy_sold"`,
            "1m_sell_sold": sql`EXCLUDED."1m_sell_sold"`,
            "1m_buy_listed": sql`EXCLUDED."1m_buy_listed"`,
            "1m_sell_listed": sql`EXCLUDED."1m_sell_listed"`,
            "1m_buy_delisted": sql`EXCLUDED."1m_buy_delisted"`,
            "1m_sell_delisted": sql`EXCLUDED."1m_sell_delisted"`,
            "1m_sell_delisted_value": sql`EXCLUDED."1m_sell_delisted_value"`,
          },
        });

      processed += batch.length;
      console.log(`Processed ${processed}/${data.length} items`);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processed} items`,
    });
  } catch (error) {
    console.error("Error loading market data:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update market data",
      },
      { status: 500 }
    );
  }
}
