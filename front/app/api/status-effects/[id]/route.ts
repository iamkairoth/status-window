import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const xata = getXataClient();
  const record = await xata.db.status_effects.read(id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const xata = getXataClient();
  const body = await req.json();
  const updated = await xata.db.status_effects.update(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const xata = getXataClient();
  await xata.db.status_effects.delete(id);
  return NextResponse.json({ message: "Deleted" });
}
