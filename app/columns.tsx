"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import CoinDisplay from "@/components/CoinDisplay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MarketItem = {
  id: number;
  name: string;
  img: string | null;
  buy_price: number | null;
  sell_price: number | null;
  buy_quantity: number | null;
  sell_quantity: number | null;
  "7d_sell_listed": number | null;
  "7d_sell_delisted": number | null;
  "7d_sell_sold": number | null;
  "1d_sell_sold": number | null;
  "1d_sell_delisted": number | null;
  "1d_buy_sold": number | null;
  "1d_buy_delisted": number | null;
};

// Helper to calculate supply velocity
const calculateSupplyVelocity = (item: MarketItem) => {
  const listed = item["7d_sell_listed"] || 0;
  const delisted = item["7d_sell_delisted"] || 0;
  const sold = item["7d_sell_sold"] || 0;
  return listed - (delisted + sold);
};

// Helper to calculate market activity ratio
const calculateMarketRatio = (item: MarketItem) => {
  const buyOrders = item.buy_quantity || 0;
  const sellOrders = item.sell_quantity || 0;
  return sellOrders > 0 ? buyOrders / sellOrders : 0;
};

function calculateBuyExpectations(row: MarketItem): number {
  // If there's no buy quantity or no historical activity, return 0
  if (!row.buy_quantity || !row["1d_buy_listed"]) return 0;

  // Use the same simple calculation as the expectations column
  const buySales = row["1d_buy_sold"] || 0;
  return buySales / 24; // hourly rate
}

// Helper function to get color based on profit percentage
const getProfitColor = (profitPercent: number) => {
  // Clamp the profit percentage between -100 and 100
  const clampedProfit = Math.max(-100, Math.min(100, profitPercent));

  if (clampedProfit === 0) {
    return "bg-yellow-500 text-yellow-950 hover:bg-yellow-500/80";
  }

  if (clampedProfit > 0) {
    if (clampedProfit >= 75) {
      return "bg-green-800 text-white hover:bg-green-800/80";
    } else if (clampedProfit >= 50) {
      return "bg-green-700 text-white hover:bg-green-700/80";
    } else if (clampedProfit >= 25) {
      return "bg-green-600 text-white hover:bg-green-600/80";
    } else {
      return "bg-green-500 text-white hover:bg-green-500/80";
    }
  } else {
    if (clampedProfit <= -75) {
      return "bg-red-800 text-white hover:bg-red-800/80";
    } else if (clampedProfit <= -50) {
      return "bg-red-700 text-white hover:bg-red-700/80";
    } else if (clampedProfit <= -25) {
      return "bg-red-600 text-white hover:bg-red-600/80";
    } else {
      return "bg-red-500 text-white hover:bg-red-500/80";
    }
  }
};

export const columns: ColumnDef<MarketItem>[] = [
  {
    accessorKey: "img",
    header: "Item",
    cell: ({ row }) => (
      <div className="w-[100px]">
        <img
          src={row.getValue("img") || "/placeholder-image.png"}
          alt={row.getValue("name")}
          className="w-12 h-12 rounded"
        />
      </div>
    ),
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="w-[200px]">
        <Link
          href={`/item/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue("name") as string}
        </Link>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "buy_price",
    header: "Buy Price",
    cell: ({ row }) => (
      <div className="w-[140px]">
        <CoinDisplay value={row.getValue("buy_price") as number} />
      </div>
    ),
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    accessorKey: "sell_price",
    header: "Sell Price",
    cell: ({ row }) => (
      <div className="w-[140px]">
        <CoinDisplay value={row.getValue("sell_price") as number} />
      </div>
    ),
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "profit",
    header: "Profit",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      const buyPrice = row.buy_price || 0;
      return sellPrice * 0.85 - buyPrice;
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const buyPrice = row.original.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;
      const profitPercent = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
      const colorClasses = getProfitColor(profitPercent);

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            <CoinDisplay value={profit} />
          </div>
          <div>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                colorClasses
              )}
            >
              {Math.round(profitPercent)}% profit
            </span>
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "sold_24h",
    header: "Sold (24h)",
    accessorFn: (row) => {
      const sold = row["1d_sell_sold"] || 0;
      const delisted = row["1d_sell_delisted"] || 0;
      return sold + delisted;
    },
    cell: ({ row }) => {
      const sold = row.original["1d_sell_sold"] || 0;
      const delisted = row.original["1d_sell_delisted"] || 0;
      const total = sold + delisted;

      if (total === 0) return <div className="w-[140px]">-</div>;

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {sold > 0 && `${sold.toLocaleString()} filled`}
            {sold > 0 && delisted > 0 && ", "}
            {delisted > 0 && `${delisted.toLocaleString()} cancelled`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "bought_24h",
    header: "Bought (24h)",
    accessorFn: (row) => {
      const bought = row["1d_buy_sold"] || 0;
      const delisted = row["1d_buy_delisted"] || 0;
      return bought + delisted;
    },
    cell: ({ row }) => {
      const bought = row.original["1d_buy_sold"] || 0;
      const delisted = row.original["1d_buy_delisted"] || 0;
      const total = bought + delisted;

      if (total === 0) return <div className="w-[140px]">-</div>;

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {bought > 0 && `${bought.toLocaleString()} filled`}
            {bought > 0 && delisted > 0 && ", "}
            {delisted > 0 && `${delisted.toLocaleString()} cancelled`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "supply_trend",
    header: "Supply Trend (7d)",
    accessorFn: (row) => calculateSupplyVelocity(row),
    cell: ({ row }) => {
      const trend = calculateSupplyVelocity(row.original);

      return (
        <div className="w-[150px] space-y-1">
          <div
            className={`font-medium ${
              trend > 0
                ? "text-green-600"
                : trend < 0
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"}{" "}
            {Math.abs(trend).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            Listed: {(row.original["7d_sell_listed"] || 0).toLocaleString()}
            <br />
            Sold: {(row.original["7d_sell_sold"] || 0).toLocaleString()}
            <br />
            Delisted: {(row.original["7d_sell_delisted"] || 0).toLocaleString()}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "market_activity",
    header: "Market Activity",
    accessorFn: (row) => calculateMarketRatio(row),
    cell: ({ row }) => {
      const ratio = calculateMarketRatio(row.original);

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">{ratio.toFixed(2)}x Buy/Sell Ratio</div>
          <div className="text-xs text-muted-foreground">
            Buy Orders: {(row.original.buy_quantity || 0).toLocaleString()}
            <br />
            Sell Orders: {(row.original.sell_quantity || 0).toLocaleString()}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "sell_rate",
    header: "Sell Rate",
    accessorFn: (row) => {
      const sellRate = (row["1d_sell_sold"] || 0) / 24;
      return sellRate;
    },
    cell: ({ row }) => {
      const sellRate = (row.original["1d_sell_sold"] || 0) / 24;
      const currentListings = row.original.sell_quantity || 0;

      if (sellRate === 0) {
        return (
          <div className="w-[140px] space-y-1">
            <div className="font-medium">No sales</div>
            <div className="text-xs text-muted-foreground">
              {currentListings.toLocaleString()} in queue
            </div>
          </div>
        );
      }

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">{sellRate.toFixed(1)} sales/hr</div>
          <div className="text-xs text-muted-foreground">
            {currentListings.toLocaleString()} in queue
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "velocity",
    header: "Velocity",
    accessorFn: (row) => {
      const buyActivity =
        (row["1d_buy_sold"] || 0) + (row["1d_buy_delisted"] || 0);
      const sellActivity =
        (row["1d_sell_sold"] || 0) + (row["1d_sell_delisted"] || 0);
      return buyActivity + sellActivity;
    },
    cell: ({ row }) => {
      const buyActivity =
        (row.original["1d_buy_sold"] || 0) +
        (row.original["1d_buy_delisted"] || 0);
      const sellActivity =
        (row.original["1d_sell_sold"] || 0) +
        (row.original["1d_sell_delisted"] || 0);
      const totalActivity = buyActivity + sellActivity;

      if (totalActivity === 0) {
        return <div className="w-[140px]">-</div>;
      }

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            {totalActivity.toLocaleString()} / day
          </div>
          <div className="text-xs text-muted-foreground">
            {buyActivity > 0 && `${buyActivity.toLocaleString()} buy`}
            {buyActivity > 0 && sellActivity > 0 && ", "}
            {sellActivity > 0 && `${sellActivity.toLocaleString()} sell`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "listing_fee",
    header: "Loss per Relist",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      // Listing fee is 5% with a minimum of 1 coin
      return Math.max(1, Math.ceil(sellPrice * 0.05));
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const listingFee = Math.max(1, Math.ceil(sellPrice * 0.05));

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            <CoinDisplay value={listingFee} />
          </div>
          <div className="text-xs text-muted-foreground">5% of sell price</div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "relist_allowance",
    header: "Relist Allowance",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      const buyPrice = row.buy_price || 0;
      const listingFee = Math.max(1, Math.ceil(sellPrice * 0.05));
      const profit = sellPrice * 0.85 - buyPrice; // Profit after 15% fees

      // How many times can we relist before depleting profit
      if (listingFee === 0) return 0;
      return Math.floor(profit / listingFee);
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const buyPrice = row.original.buy_price || 0;
      const listingFee = Math.max(1, Math.ceil(sellPrice * 0.05));
      const profit = sellPrice * 0.85 - buyPrice;

      const relistCount =
        listingFee === 0 ? 0 : Math.floor(profit / listingFee);

      // Color coding based on relist allowance
      let colorClass = "text-muted-foreground";
      if (relistCount >= 10) {
        colorClass = "text-green-600";
      } else if (relistCount >= 5) {
        colorClass = "text-yellow-600";
      } else if (relistCount > 0) {
        colorClass = "text-red-600";
      }

      return (
        <div className="w-[140px] space-y-1">
          <div className={`font-medium ${colorClass}`}>
            {relistCount} relists
          </div>
          <div className="text-xs text-muted-foreground">
            Before profit depleted
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "daily_profit",
    header: "Daily Profit",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      const buyPrice = row.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;

      // Use actual successful sales for daily rate
      const successfulSales = row["1d_sell_sold"] || 0;

      return profit * successfulSales;
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const buyPrice = row.original.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;

      const successfulSales = row.original["1d_sell_sold"] || 0;
      const totalAttempts = row.original["1d_sell_listed"] || 0;

      if (successfulSales === 0) {
        return (
          <div className="w-[140px] space-y-1">
            <div className="font-medium">No successful sales</div>
            <div className="text-xs text-muted-foreground">
              {(row.original.sell_quantity || 0).toLocaleString()} in queue
            </div>
          </div>
        );
      }

      // Calculate success rate percentage
      const successRate =
        totalAttempts > 0 ? (successfulSales / totalAttempts) * 100 : 0;

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            <CoinDisplay value={Math.round(profit * successfulSales)} />
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.round(successfulSales).toLocaleString()} sales/day
            {successRate > 0 && ` (${successRate.toFixed(1)}% success)`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "profit_per_hour",
    header: "Profit/Hour",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      const buyPrice = row.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;

      // Use actual successful sales for hourly rate
      const successfulSales = row["1d_sell_sold"] || 0;
      const hourlyRate = successfulSales / 24;

      return profit * hourlyRate;
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const buyPrice = row.original.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;

      const successfulSales = row.original["1d_sell_sold"] || 0;
      const hourlyRate = successfulSales / 24;

      if (successfulSales === 0) {
        return (
          <div className="w-[140px] space-y-1">
            <div className="font-medium">No successful sales</div>
            <div className="text-xs text-muted-foreground">
              {(row.original.sell_quantity || 0).toLocaleString()} in queue
            </div>
          </div>
        );
      }

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            <CoinDisplay value={Math.round(profit * hourlyRate)} />
          </div>
          <div className="text-xs text-muted-foreground">
            {hourlyRate < 0.1
              ? "< 0.1 sales/hr"
              : `${hourlyRate.toFixed(1)} sales/hr`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "capped_profit_per_hour",
    header: "Capped Profit/Hour",
    accessorFn: (row) => {
      const sellPrice = row.sell_price || 0;
      const buyPrice = row.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;
      const effectiveBuyRate = calculateBuyExpectations(row);
      return profit * effectiveBuyRate;
    },
    cell: ({ row }) => {
      const sellPrice = row.original.sell_price || 0;
      const buyPrice = row.original.buy_price || 0;
      const profit = sellPrice * 0.85 - buyPrice;

      // Use the helper to get the effective (capped) buy rate
      const effectiveBuyRate = calculateBuyExpectations(row.original);

      if (effectiveBuyRate <= 0) {
        return (
          <div className="w-[140px] space-y-1">
            <div className="font-medium">No capped sales</div>
            <div className="text-xs text-muted-foreground">Rate: 0/hr</div>
          </div>
        );
      }

      return (
        <div className="w-[140px] space-y-1">
          <div className="font-medium">
            <CoinDisplay value={Math.round(profit * effectiveBuyRate)} />
          </div>
          <div className="text-xs text-muted-foreground">
            {effectiveBuyRate < 0.1
              ? "< 0.1/hr"
              : `Can Buy ${effectiveBuyRate.toFixed(1)}/hr`}
          </div>
        </div>
      );
    },

    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    id: "expectations",
    header: "Expectations",
    accessorFn: (row) => {
      // We'll sort by successful sell rate
      if (!row.sell_quantity) return 0;

      const sellSales = row["1d_sell_sold"] || 0;
      const sellListings = row["1d_sell_listed"] || 0;

      if (sellListings === 0) return 0;

      // Calculate average time a successful sale takes
      const hourlySuccessRate = sellSales / 24;
      const successRatio = sellSales / sellListings;

      // Average items sold per listing attempt
      return successRatio;
    },
    cell: ({ row }) => {
      const sellQuantity = row.original.sell_quantity || 0;
      const buyQuantity = row.original.buy_quantity || 0;

      // Calculate sell success rate
      const sellSales = row.original["1d_sell_sold"] || 0;
      const sellListings = row.original["1d_sell_listed"] || 0;
      const sellDelistings = row.original["1d_sell_delisted"] || 0;

      // Calculate buy success rate
      const buySales = row.original["1d_buy_sold"] || 0;
      const buyListings = row.original["1d_buy_listed"] || 0;
      const buyDelistings = row.original["1d_buy_delisted"] || 0;

      let sellSuccessText = "";
      let buySuccessText = "";

      // Calculate buy expectations
      if (buyQuantity > 0 && buyListings > 0) {
        const buySuccessRate = (buySales / buyListings) * 100;
        const buyHourlyRate = buySales / 24;
        buySuccessText =
          buyHourlyRate < 0.1
            ? "Can Buy < 0.1/hr"
            : `Can Buy ${buyHourlyRate.toFixed(1)}/hr`;
      }

      // Calculate sell expectations
      if (sellQuantity > 0 && sellListings > 0) {
        const sellSuccessRate = (sellSales / sellListings) * 100;
        const sellHourlyRate = sellSales / 24;
        sellSuccessText =
          sellHourlyRate < 0.1
            ? "Can Sell < 0.1/hr"
            : `Can Sell ${sellHourlyRate.toFixed(1)}/hr`;
      }

      if (sellQuantity === 0 && buyQuantity === 0) {
        return (
          <div className="w-[180px] space-y-1">
            <div className="text-muted-foreground">No orders</div>
          </div>
        );
      }

      return (
        <div className="w-[180px] space-y-1">
          {buyQuantity > 0 && (
            <div className="font-medium">{buySuccessText}</div>
          )}
          {sellQuantity > 0 && (
            <div className="font-medium">{sellSuccessText}</div>
          )}
          <div className="text-xs text-muted-foreground">
            {buyQuantity > 0 &&
              `${Math.round(buySales).toLocaleString()} successful buys`}
            {buyQuantity > 0 && sellQuantity > 0 && ", "}
            {sellQuantity > 0 &&
              `${Math.round(sellSales).toLocaleString()} successful sales`}
          </div>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: "number",
  },
];
