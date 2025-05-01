import { NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET() {
  try {
    const xata = getXataClient();
    const effects = await xata.db.status_effects.getAll();
    return NextResponse.json(effects);
  } catch (error) {
    console.error("Error fetching status effects:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  try {
    const xata = getXataClient();
    const body = await req.json();
    const created = await xata.db.status_effects.create(body);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Error creating status effect:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create entry" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
