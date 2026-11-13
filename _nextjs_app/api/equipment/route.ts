import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { equipmentCreateSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`equipment-get:${ip}`, RATE_LIMITS.read);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const equipment = await prisma.equipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        borrows: {
          where: { status: { in: ["borrowed", "overdue"] } },
          select: { id: true, borrowQuantity: true, borrowerId: true },
        },
      },
    });

    const result = equipment.map((eq) => {
      const borrowedQty = eq.borrows.reduce((sum, b) => sum + b.borrowQuantity, 0);
      const myBorrow = userId ? eq.borrows.find(b => b.borrowerId === userId) : null;

      return {
        ...eq,
        borrowedQuantity: borrowedQty,
        availableQuantity: eq.quantity - borrowedQty,
        myBorrowId: myBorrow?.id || null,
        borrows: undefined,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Equipment GET error:", error);
    return NextResponse.json({ error: "โหลดข้อมูลล้มเหลว" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`equipment-post:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = equipmentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, department, category, description, quantity, imageUrl, location, createdAt } = parsed.data;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        department,
        category,
        description: description || null,
        quantity: (quantity && quantity > 0) ? quantity : 1,
        initialQuantity: (quantity && quantity > 0) ? quantity : 1,
        imageUrl: imageUrl || null,
        location: location || null,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error("Equipment POST error:", error);
    return NextResponse.json({ error: "เพิ่มอุปกรณ์ล้มเหลว" }, { status: 500 });
  }
}
