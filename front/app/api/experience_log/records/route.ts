// app/api/experience_log/records/route.ts
import { NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET() {
  try {
    const xata = getXataClient();
    // Fetch ALL records from the experience_log table
    // For very large tables, you might prefer .getPaginated()
    const records = await xata.db.experience_log.getAll();

    // Return the records. Wrapping them in an object like { records: [...] }
    // is a common pattern and aligns with how the client-side fix works.
    return NextResponse.json({ records });

  } catch (error) {
    console.error("Error in GET /api/experience_log/records:", error);
    return NextResponse.json({ error: "Failed to fetch experience records" }, { status: 500 });
  }
}