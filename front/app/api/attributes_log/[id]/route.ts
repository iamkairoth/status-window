// Get by ID, update, delete
import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const xata = getXataClient();
  const record = await xata.db.attributes_log.read(params.id);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const xata = getXataClient();
  const body = await req.json();
  const updated = await xata.db.attributes_log.update(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const xata = getXataClient();
  await xata.db.attributes_log.delete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
