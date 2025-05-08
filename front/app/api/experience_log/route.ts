// app/api/experience_log/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";
import { calculateExperience } from "@/lib/calculations"; // Adjust the import path

export async function GET() {
  try {
    const { total_experience, current_level, progress_percentage } = await calculateExperience();
    return NextResponse.json({
      total_experience,
      current_level,
      progress_percentage,
    });
  } catch (error) {
    console.error("Error in GET /api/experience_log:", error);
    return NextResponse.json({ error: "Failed to fetch experience data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const xata = getXataClient();
  const body = await req.json();
  const created = await xata.db.experience_log.create(body);
  return NextResponse.json(created);
}