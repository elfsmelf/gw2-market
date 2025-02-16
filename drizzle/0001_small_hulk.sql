ALTER TABLE "market_items" ALTER COLUMN "1d_buy_price_avg" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ALTER COLUMN "1d_sell_price_avg" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ALTER COLUMN "1d_buy_quantity_avg" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ALTER COLUMN "1d_sell_quantity_avg" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "upgrade_name" varchar(100);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "charm" varchar(100);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_price_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_quantity_avg" numeric(20, 2);--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_buy_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_buy_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_sold" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_listed" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_buy_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_delisted" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "2d_sell_delisted_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "7d_sell_delisted_value" integer;--> statement-breakpoint
ALTER TABLE "market_items" ADD COLUMN "1m_sell_delisted_value" integer;