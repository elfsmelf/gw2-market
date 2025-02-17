"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import CoinDisplay from "@/components/CoinDisplay";
import {
  ArrowRightIcon,
  TrendingUpIcon,
  CoinsIcon,
  WalletIcon,
} from "lucide-react";
import CurrentListings from "./CurrentListings";

interface MarketItem {
  id: number;
  name: string;
  img: string;
  buy_price: number;
  sell_price: number;
  "1d_buy_sold": number;
  "1d_sell_sold": number;
}

interface OptimizedItem {
  item: MarketItem;
  quantity: number;
  totalCost: number;
  expectedProfit: number;
  hourlyProfit: number;
  dailyProfit: number;
  buyTime: number;
  sellTime: number;
}

interface OptimizationResult {
  purchases: OptimizedItem[];
  remainingBudget: number;
  totalExpectedProfit: number;
  totalHourlyProfit: number;
  totalDailyProfit: number;
  totalInvestment: number;
  totalBuyTime: number;
  totalSellTime: number;
  totalTurnoverTime: number;
  roi: number;
}

export default function ProfitOptimizer() {
  const [budget, setBudget] = useState<string>("");
  const [minPurchase, setMinPurchase] = useState<number>(1000); // Default 10 silver
  const [data, setData] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/market-data?${searchParams.toString()}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const optimizedPurchases = React.useMemo<OptimizationResult | null>(() => {
    const budgetNum = Number(budget);
    if (!budgetNum || isNaN(budgetNum) || budgetNum <= 0) return null;

    let remainingBudget = budgetNum;
    const purchases: OptimizedItem[] = [];
    let totalExpectedProfit = 0;
    let totalHourlyProfit = 0;
    let totalDailyProfit = 0;
    let totalInvestment = 0;
    let totalBuyTime = 0;
    let totalSellTime = 0;

    for (const item of data) {
      if (remainingBudget < item.buy_price || item.buy_price < minPurchase)
        continue;

      const buyPerHour = Math.floor((item["1d_buy_sold"] || 0) / 24);
      const sellPerHour = Math.floor((item["1d_sell_sold"] || 0) / 24);
      if (buyPerHour === 0) continue;

      const affordableQuantity = Math.floor(remainingBudget / item.buy_price);
      const quantity = Math.min(affordableQuantity, buyPerHour);

      if (quantity === 0) continue;

      const totalCost = quantity * item.buy_price;
      const profitPerItem = item.sell_price * 0.85 - item.buy_price;
      const profit = profitPerItem * quantity;
      const hourlyProfit = profitPerItem * buyPerHour;
      const dailyProfit = hourlyProfit * 24;

      // Calculate time to buy and sell all items
      const buyTime = quantity / buyPerHour;
      const sellTime = quantity / sellPerHour;

      totalBuyTime += buyTime;
      totalSellTime += sellTime;

      purchases.push({
        item,
        quantity,
        totalCost,
        expectedProfit: profit,
        hourlyProfit,
        dailyProfit,
        buyTime,
        sellTime,
      });

      remainingBudget -= totalCost;
      totalExpectedProfit += profit;
      totalHourlyProfit += hourlyProfit;
      totalDailyProfit += dailyProfit;
      totalInvestment += totalCost;

      if (
        remainingBudget <
        Math.min(...data.slice(purchases.length).map((item) => item.buy_price))
      ) {
        break;
      }
    }

    const roi =
      totalInvestment > 0 ? (totalExpectedProfit / totalInvestment) * 100 : 0;
    const totalTurnoverTime = Math.max(totalBuyTime, totalSellTime); // Operations can happen in parallel

    return {
      purchases,
      remainingBudget,
      totalExpectedProfit,
      totalHourlyProfit,
      totalDailyProfit,
      totalInvestment,
      totalBuyTime,
      totalSellTime,
      totalTurnoverTime,
      roi,
    };
  }, [budget, data, minPurchase]);

  // Inside your ProfitOptimizer component
  return (
    <Card className="mt-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <CoinsIcon className="h-5 w-5" />
          Trading Post Profit Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Currency Inputs */}
          <div className="grid gap-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-base">
                Available Currency
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter your available currency..."
                />
                {budget && <CoinDisplay value={Number(budget)} />}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPurchase" className="text-base">
                Minimum Purchase Amount
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="minPurchase"
                  type="number"
                  min="0"
                  defaultValue="1000"
                  onChange={(e) => setMinPurchase(Number(e.target.value))}
                  placeholder="Enter minimum purchase amount..."
                />
                <CoinDisplay value={minPurchase} />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum value per item to purchase (default: 10 silver)
              </p>
            </div>
          </div>

          {/* Results Section */}
          {optimizedPurchases && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Investment Card */}
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Total Investment</h3>
                      <WalletIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      <CoinDisplay value={optimizedPurchases.totalInvestment} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (optimizedPurchases.totalInvestment / Number(budget)) *
                        100
                      ).toFixed(1)}
                      % of budget utilized
                    </p>
                  </CardContent>
                </Card>

                {/* Hourly Profit Card */}
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Hourly Profit</h3>
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +
                      <CoinDisplay
                        value={optimizedPurchases.totalHourlyProfit}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {optimizedPurchases.roi.toFixed(1)}% ROI
                    </p>
                  </CardContent>
                </Card>

                {/* Daily Profit Card */}
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Daily Profit</h3>
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      +
                      <CoinDisplay
                        value={optimizedPurchases.totalDailyProfit}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (optimizedPurchases.totalDailyProfit /
                          optimizedPurchases.totalInvestment) *
                        100
                      ).toFixed(1)}
                      % daily return
                    </p>
                  </CardContent>
                </Card>

                {/* Remaining Budget Card */}
                <Card className="bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                      <h3 className="text-sm font-medium">Remaining Budget</h3>
                      <CoinsIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      <CoinDisplay value={optimizedPurchases.remainingBudget} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (optimizedPurchases.remainingBudget / Number(budget)) *
                        100
                      ).toFixed(1)}
                      % available
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase Steps Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <ArrowRightIcon className="h-5 w-5" />
                  Recommended Purchase Steps
                </h3>

                {/* Turnover Times Card */}
                {optimizedPurchases.totalTurnoverTime && (
                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">
                          Estimated Turnover Times
                        </h4>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div>
                            Time to buy all items:{" "}
                            {formatTime(optimizedPurchases.totalBuyTime)}
                          </div>
                          <div>
                            Time to sell all items:{" "}
                            {formatTime(optimizedPurchases.totalSellTime)}
                          </div>
                          <div className="font-medium text-foreground">
                            Total turnover time:{" "}
                            {formatTime(optimizedPurchases.totalTurnoverTime)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Individual Purchase Cards */}
                {optimizedPurchases.purchases.map((purchase, index) => (
                  <div key={purchase.item.id} className="space-y-4">
                    {/* Purchase Info Card */}
                    <Card className="bg-card/50">
                      <CardContent className="pt-6">
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                            <img
                              src={
                                purchase.item.img || "/placeholder-image.png"
                              }
                              alt={purchase.item.name}
                              className="max-w-full max-h-full object-contain rounded-md"
                            />
                          </div>

                          <div className="flex-grow flex justify-between">
                            <div className="space-y-2">
                              <h4 className="font-medium text-base">
                                {index + 1}. Buy{" "}
                                <span className="font-bold">
                                  {purchase.quantity}x
                                </span>{" "}
                                {purchase.item.name}
                              </h4>

                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  Buy price:{" "}
                                  <CoinDisplay
                                    value={purchase.item.buy_price}
                                  />
                                  <span className="text-xs">each</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  Total investment:{" "}
                                  <CoinDisplay value={purchase.totalCost} />
                                </div>
                                <div className="flex items-center gap-2">
                                  Sell price:{" "}
                                  <CoinDisplay
                                    value={purchase.item.sell_price}
                                  />
                                  <span className="text-xs">each</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right space-y-2">
                              <div className="font-medium text-green-600 flex items-center justify-end gap-1">
                                +<CoinDisplay value={purchase.expectedProfit} />{" "}
                                profit
                              </div>
                              <div className="text-sm text-green-600 flex items-center justify-end gap-1">
                                +<CoinDisplay value={purchase.hourlyProfit} />
                                /hr
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div>
                                  Buy time: {formatTime(purchase.buyTime)}
                                </div>
                                <div>
                                  Sell time: {formatTime(purchase.sellTime)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Current Market Listings */}
                    <CurrentListings itemId={purchase.item.id} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTime(hours: number): string {
  if (!isFinite(hours)) return "unknown";
  if (hours < 1 / 60) {
    return "less than a minute";
  } else if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hours`;
  } else {
    const days = Math.floor(hours / 24);
    const hrs = Math.round(hours % 24);
    return hrs > 0 ? `${days}d ${hrs}h` : `${days} days`;
  }
}
