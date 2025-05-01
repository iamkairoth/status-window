import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

// GET by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Use Promise type
) {
  const xata = getXataClient();
  const { id } = await params; // Await params
  const record = await xata.db.attributes_log.read(id);

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

// PUT by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Use Promise type
) {
  const xata = getXataClient();
  const { id } = await params; // Await params
  const body: Record<string, unknown> = await req.json();
  const updated = await xata.db.attributes_log.update(id, body);

  return NextResponse.json(updated);
}

// DELETE by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Use Promise type
) {
  const xata = getXataClient();
  const { id } = await params; // Await params
  await xata.db.attributes_log.delete(id);

  return NextResponse.json({ message: "Deleted" });
}