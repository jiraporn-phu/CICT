export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const borrows = await prisma.borrowTransaction.findMany({
      where: { borrowerId: id, status: "borrowed" },
      include: { equipment: true },
      orderBy: { borrowDate: "desc" },
    });
    return NextResponse.json(borrows);
  } catch (error) {
    console.error("User borrows error:", error);
    return NextResponse.json({ error: "โหลดข้อมูลล้มเหลว" }, { status: 500 });
  }
}
