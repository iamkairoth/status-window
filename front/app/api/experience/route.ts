import { NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET() {
  try {
    const xata = getXataClient();
    const records = await xata.db.experience_log.getAll();
    const totalExp = records.reduce((sum, item) => sum + (item.experience || 0), 0);

    const expForLevel = (lvl: number) => 100 * (lvl - 1);
    let level = 1;
    while (totalExp >= expForLevel(level + 1)) {
      level++;
    }

    const currentExp = expForLevel(level);
    const nextExp = expForLevel(level + 1);
    const progress = parseFloat(((totalExp - currentExp) / (nextExp - currentExp)) * 100).toFixed(2);

    return NextResponse.json({
      current_level: level,
      current_experience: totalExp,
      current_level_exp: currentExp,
      next_level_exp: nextExp,
      progress_percentage: progress,
    });
  } catch (error: any) {
    console.error("Error fetching experience:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const xata = getXataClient();
    const body = await req.json();
    const created = await xata.db.experience_log.create(body);
    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error creating experience:", error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}