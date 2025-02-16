// db/schema.ts
import {
  pgTable,
  bigint,
  varchar,
  timestamp,
  text,
  decimal,
} from "drizzle-orm/pg-core";

export const marketItems = pgTable("market_items", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  rarity: varchar("rarity", { length: 50 }),
  type: varchar("type", { length: 50 }),
  level: bigint("level", { mode: "number" }),
  buy_price: bigint("buy_price", { mode: "number" }),
  sell_price: bigint("sell_price", { mode: "number" }),
  buy_quantity: bigint("buy_quantity", { mode: "number" }),
  sell_quantity: bigint("sell_quantity", { mode: "number" }),
  chat_link: varchar("chat_link", { length: 50 }),
  img: text("img"),
  weapon_type: varchar("weapon_type", { length: 50 }),
  stat_name: varchar("stat_name", { length: 50 }),
  upgrade_name: varchar("upgrade_name", { length: 100 }),
  charm: varchar("charm", { length: 100 }),
  first_added: timestamp("first_added"),
  last_update: timestamp("last_update"),

  // Price averages
  "1d_buy_price_avg": decimal("1d_buy_price_avg", { precision: 20, scale: 2 }),
  "1d_sell_price_avg": decimal("1d_sell_price_avg", {
    precision: 20,
    scale: 2,
  }),
  "2d_buy_price_avg": decimal("2d_buy_price_avg", { precision: 20, scale: 2 }),
  "2d_sell_price_avg": decimal("2d_sell_price_avg", {
    precision: 20,
    scale: 2,
  }),
  "7d_buy_price_avg": decimal("7d_buy_price_avg", { precision: 20, scale: 2 }),
  "7d_sell_price_avg": decimal("7d_sell_price_avg", {
    precision: 20,
    scale: 2,
  }),
  "1m_buy_price_avg": decimal("1m_buy_price_avg", { precision: 20, scale: 2 }),
  "1m_sell_price_avg": decimal("1m_sell_price_avg", {
    precision: 20,
    scale: 2,
  }),

  // Quantity averages
  "1d_buy_quantity_avg": decimal("1d_buy_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "1d_sell_quantity_avg": decimal("1d_sell_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "2d_buy_quantity_avg": decimal("2d_buy_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "2d_sell_quantity_avg": decimal("2d_sell_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "7d_buy_quantity_avg": decimal("7d_buy_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "7d_sell_quantity_avg": decimal("7d_sell_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "1m_buy_quantity_avg": decimal("1m_buy_quantity_avg", {
    precision: 20,
    scale: 2,
  }),
  "1m_sell_quantity_avg": decimal("1m_sell_quantity_avg", {
    precision: 20,
    scale: 2,
  }),

  // Values
  "1d_buy_value": bigint("1d_buy_value", { mode: "number" }),
  "1d_sell_value": bigint("1d_sell_value", { mode: "number" }),
  "2d_buy_value": bigint("2d_buy_value", { mode: "number" }),
  "2d_sell_value": bigint("2d_sell_value", { mode: "number" }),
  "7d_buy_value": bigint("7d_buy_value", { mode: "number" }),
  "7d_sell_value": bigint("7d_sell_value", { mode: "number" }),
  "1m_buy_value": bigint("1m_buy_value", { mode: "number" }),
  "1m_sell_value": bigint("1m_sell_value", { mode: "number" }),

  // Counts
  "1d_buy_sold": bigint("1d_buy_sold", { mode: "number" }),
  "1d_sell_sold": bigint("1d_sell_sold", { mode: "number" }),
  "1d_buy_listed": bigint("1d_buy_listed", { mode: "number" }),
  "1d_sell_listed": bigint("1d_sell_listed", { mode: "number" }),
  "1d_buy_delisted": bigint("1d_buy_delisted", { mode: "number" }),
  "1d_sell_delisted": bigint("1d_sell_delisted", { mode: "number" }),

  "2d_buy_sold": bigint("2d_buy_sold", { mode: "number" }),
  "2d_sell_sold": bigint("2d_sell_sold", { mode: "number" }),
  "2d_buy_listed": bigint("2d_buy_listed", { mode: "number" }),
  "2d_sell_listed": bigint("2d_sell_listed", { mode: "number" }),
  "2d_buy_delisted": bigint("2d_buy_delisted", { mode: "number" }),
  "2d_sell_delisted": bigint("2d_sell_delisted", { mode: "number" }),

  "7d_buy_sold": bigint("7d_buy_sold", { mode: "number" }),
  "7d_sell_sold": bigint("7d_sell_sold", { mode: "number" }),
  "7d_buy_listed": bigint("7d_buy_listed", { mode: "number" }),
  "7d_sell_listed": bigint("7d_sell_listed", { mode: "number" }),
  "7d_buy_delisted": bigint("7d_buy_delisted", { mode: "number" }),
  "7d_sell_delisted": bigint("7d_sell_delisted", { mode: "number" }),

  "1m_buy_sold": bigint("1m_buy_sold", { mode: "number" }),
  "1m_sell_sold": bigint("1m_sell_sold", { mode: "number" }),
  "1m_buy_listed": bigint("1m_buy_listed", { mode: "number" }),
  "1m_sell_listed": bigint("1m_sell_listed", { mode: "number" }),
  "1m_buy_delisted": bigint("1m_buy_delisted", { mode: "number" }),
  "1m_sell_delisted": bigint("1m_sell_delisted", { mode: "number" }),

  // Delisted values
  "1d_sell_delisted_value": bigint("1d_sell_delisted_value", {
    mode: "number",
  }),
  "2d_sell_delisted_value": bigint("2d_sell_delisted_value", {
    mode: "number",
  }),
  "7d_sell_delisted_value": bigint("7d_sell_delisted_value", {
    mode: "number",
  }),
  "1m_sell_delisted_value": bigint("1m_sell_delisted_value", {
    mode: "number",
  }),
});
