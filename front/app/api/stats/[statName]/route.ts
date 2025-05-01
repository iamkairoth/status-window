import { NextResponse } from "next/server";
import { calculateTotalScore, CONSTANTS } from "@/lib/calculations";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ statName: string }> }
) {
  try {
    const { statName } = await params; // Await params
    if (!statName) {
      return NextResponse.json({ error: "Missing stat name" }, { status: 400 });
    }

    const [total, breakdown] = await calculateTotalScore(statName, CONSTANTS);

    return NextResponse.json({
      name: statName.charAt(0).toUpperCase() + statName.slice(1),
      value: total,
      breakdown,
    });
  } catch (error: any) {
    console.error(`Error fetching stats for ${params}:`, error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}