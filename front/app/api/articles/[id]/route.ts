import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/lib/xata";

// GET by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const xata = getXataClient();
    const { id } = await params;
    const record = await xata.db.articles.read(id);

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error(`Error fetching article ${params}:`, error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// UPDATE by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const xata = getXataClient();
    const { id } = await params;
    const body = await req.json();

    const updated = await xata.db.articles.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`Error updating article ${params}:`, error);
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
}

// DELETE by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const xata = getXataClient();
    const { id } = await params;
    const deleted = await xata.db.articles.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(`Error deleting article ${params}:`, error);
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}