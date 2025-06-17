// Get all & create new
import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET() {
  const xata = getXataClient();
  const data = await xata.db.articles.getAll();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const xata = getXataClient();
  const body = await req.json();
  const created = await xata.db.articles.create(body);
  return NextResponse.json(created);
}
