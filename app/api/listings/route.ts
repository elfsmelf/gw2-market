import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json(
      { error: "No item IDs provided" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.guildwars2.com/v2/commerce/listings?ids=${ids}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`GW2 API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GW2 data:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
