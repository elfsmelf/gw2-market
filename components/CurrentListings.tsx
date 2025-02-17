"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import CoinDisplay from "@/components/CoinDisplay";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

interface Listing {
  listings: number;
  unit_price: number;
  quantity: number;
}

interface ListingsData {
  id: number;
  buys: Listing[];
  sells: Listing[];
}

interface CurrentListingsProps {
  itemId: number;
}

async function fetchListings(itemId: number): Promise<ListingsData> {
  const response = await fetch(`/api/listings?ids=${itemId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  const data = await response.json();
  return data[0];
}

export default function CurrentListings({ itemId }: CurrentListingsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["listings", itemId],
    queryFn: () => fetchListings(itemId),
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-red-500">
            Error loading listings. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Accordion type="single" collapsible className="mt-4">
      <AccordionItem value="listings">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <h3 className="font-semibold text-foreground text-xl">
                Current Market Listings
              </h3>
            </div>
            <AccordionTrigger className="hover:no-underline [&[data-state=open]>div]:pb-0 p-5 rounded-md bg-gray-100">
              <div className="flex gap-6 text-sm text-muted-foreground w-full ">
                <div className="flex-1">
                  <span className="font-medium">Buy Orders: </span>
                  {data.buys[0] && (
                    <span>
                      <CoinDisplay value={data.buys[0].unit_price} /> ×{" "}
                      {data.buys[0].quantity} Ordered
                      {data.buys[0].listings > 1
                        ? ` (${data.buys[0].listings} Buyers)`
                        : " 1 Buyer"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-medium">Sell Orders: </span>
                  {data.sells[0] && (
                    <span>
                      <CoinDisplay value={data.sells[0].unit_price} /> ×{" "}
                      {data.sells[0].quantity} Available
                      {data.sells[0].listings > 1
                        ? ` (${data.sells[0].listings} Sellers)`
                        : " 1 Seller"}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-6 pt-4 p-5 bg-gray-50 ">
                {/* Buy Orders */}
                <div>
                  <h3 className="font-medium mb-2">Buy Orders</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Buyers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.buys.slice(0, 10).map((listing, index) => (
                        <TableRow key={`buy-${index}`}>
                          <TableCell>
                            <CoinDisplay value={listing.unit_price} />
                          </TableCell>
                          <TableCell className="text-right">
                            {listing.quantity.toLocaleString()} Ordered
                          </TableCell>
                          <TableCell className="text-right">
                            {listing.listings}{" "}
                            {listing.listings === 1 ? "Buyer" : "Buyers"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Sell Orders */}
                <div>
                  <h3 className="font-medium mb-2">Sell Orders</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Sellers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sells.slice(0, 10).map((listing, index) => (
                        <TableRow key={`sell-${index}`}>
                          <TableCell>
                            <CoinDisplay value={listing.unit_price} />
                          </TableCell>
                          <TableCell className="text-right">
                            {listing.quantity.toLocaleString()} Available
                          </TableCell>
                          <TableCell className="text-right">
                            {listing.listings}{" "}
                            {listing.listings === 1 ? "Seller" : "Sellers"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </AccordionContent>
          </CardContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
