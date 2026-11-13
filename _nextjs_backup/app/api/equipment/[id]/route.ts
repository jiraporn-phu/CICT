export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { equipmentUpdateSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`equipment-id-get:${ip}`, RATE_LIMITS.read);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userRole = (session.user as any)?.role;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        borrows: {
          include: userRole === "admin" ? { borrower: true } : undefined,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Equipment GET error:", error);
    return NextResponse.json({ error: "โหลดข้อมูลล้มเหลว" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`equipment-delete:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.equipment.delete({ where: { id } });
    return NextResponse.json({ message: "ลบอุปกรณ์สำเร็จ" });
  } catch (error) {
    console.error("Equipment DELETE error:", error);
    return NextResponse.json({ error: "ลบอุปกรณ์ล้มเหลว" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`equipment-put:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = equipmentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, category, description, quantity, location, imageUrl, createdAt } = parsed.data;

    const updated = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        category,
        description,
        quantity,
        location,
        imageUrl,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    const borrowCount = await prisma.borrowTransaction.aggregate({
      where: { 
        equipmentId: id,
        status: { in: ["borrowed", "overdue"] }
      },
      _sum: { borrowQuantity: true }
    });
    
    const totalBorrowed = borrowCount._sum.borrowQuantity || 0;
    const availableQuantity = updated.quantity - totalBorrowed;

    return NextResponse.json({ ...updated, availableQuantity });
  } catch (error) {
    console.error("Equipment PUT error:", error);
    return NextResponse.json({ error: "อัปเดตอุปกรณ์ล้มเหลว" }, { status: 500 });
  }
}
