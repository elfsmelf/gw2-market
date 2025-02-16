"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import CoinDisplay from "@/components/CoinDisplay";

export type MarketItem = {
  id: number;
  name: string;
  img: string | null;
  buy_price: number | null;
  sell_price: number | null;
  buy_quantity: number | null;
  sell_quantity: number | null;
};

export const columns: ColumnDef<MarketItem>[] = [
  {
    accessorKey: "img",
    header: "Item",
    cell: ({ row }) => (
      <div className="min-w-[100px]">
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
      <Link
        href={`/item/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.getValue("name") as string}
      </Link>
    ),
    enableSorting: true,
    filterFn: "includesString",
  },
  {
    accessorKey: "buy_price",
    header: "Buy Price",
    cell: ({ row }) => (
      <CoinDisplay value={row.getValue("buy_price") as number} />
    ),
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    accessorKey: "sell_price",
    header: "Sell Price",
    cell: ({ row }) => (
      <CoinDisplay value={row.getValue("sell_price") as number} />
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
      return sellPrice - buyPrice;
    },
    cell: ({ row }) => {
      const buyPrice = (row.getValue("buy_price") as number) || 0;
      const sellPrice = (row.getValue("sell_price") as number) || 0;
      return <CoinDisplay value={sellPrice - buyPrice} />;
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    accessorKey: "buy_quantity",
    header: "Buy Quantity",
    cell: ({ row }) => {
      const amount = row.getValue("buy_quantity") as number;
      return amount?.toLocaleString() ?? "-";
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
  {
    accessorKey: "sell_quantity",
    header: "Sell Quantity",
    cell: ({ row }) => {
      const amount = row.getValue("sell_quantity") as number;
      return amount?.toLocaleString() ?? "-";
    },
    enableSorting: true,
    sortingFn: "number",
    filterFn: "range",
  },
];
