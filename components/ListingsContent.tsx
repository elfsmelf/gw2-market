// ListingsContent.tsx (Server Component)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CoinDisplay from "@/components/CoinDisplay";

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

interface ListingsContentProps {
  itemId: number;
}

async function getListings(itemId: number): Promise<ListingsData> {
  const response = await fetch(
    `https://api.guildwars2.com/v2/commerce/listings?ids=${itemId}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  const data = await response.json();
  return data[0];
}

export default async function ListingsContent({
  itemId,
}: ListingsContentProps) {
  const data = await getListings(itemId);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Current Market Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buy Orders */}
          <div>
            <h3 className="font-medium mb-2">Top Buy Orders</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.buys.slice(0, 10).map((listing, index) => (
                  <TableRow key={`buy-${index}`}>
                    <TableCell>
                      <CoinDisplay value={listing.unit_price} />
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.listings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sell Orders */}
          <div>
            <h3 className="font-medium mb-2">Top Sell Orders</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sells.slice(0, 10).map((listing, index) => (
                  <TableRow key={`sell-${index}`}>
                    <TableCell>
                      <CoinDisplay value={listing.unit_price} />
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {listing.listings.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
