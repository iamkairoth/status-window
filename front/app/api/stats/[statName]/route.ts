import { NextResponse } from "next/server";
import { calculateTotalScore, CONSTANTS } from "@/lib/calculations";

export async function GET(
  _req: Request,
  { params }: { params: { statName: string } }
) {
  try {
    const { statName } = params;
    const [total, breakdown] = await calculateTotalScore(statName, CONSTANTS);
    const response = NextResponse.json({
      name: statName.charAt(0).toUpperCase() + statName.slice(1),
      value: total,
      breakdown,
    });

    // Set the Access-Control-Allow-Origin header to allow your frontend origin
    response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    // Optionally, you can set other CORS headers as needed
    response.headers.set("Access-Control-Allow-Methods", "GET");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}