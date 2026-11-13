import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { borrowCreateSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`borrow-get:${ip}`, RATE_LIMITS.read);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const where: any = {};
    
    if (userRole !== "admin") {
      where.borrowerId = currentUserId;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      where.OR = [
        { status: { notIn: ["returned", "rejected", "cancelled"] } },
        { 
          status: { in: ["returned", "rejected", "cancelled"] },
          updatedAt: { gte: thirtyDaysAgo }
        }
      ];
    } else if (userId) {
      where.borrowerId = userId;
    }

    if (status && status !== "all") {
        where.status = status;
    }

    const transactions = await prisma.borrowTransaction.findMany({
      where,
      include: {
        equipment: {
          select: { name: true, imageUrl: true, category: true }
        },
        borrower: {
          select: { fullName: true, username: true, phone: true, department: true, image: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Borrow GET error:", error);
    return NextResponse.json({ error: "Failed to fetch borrows" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`borrow-post:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = borrowCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { equipmentId, borrowerId, borrowQuantity, dueDate, pickupLocation, status: requestedStatus, transactionType } = parsed.data;
    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const targetBorrowerId = userRole === "admin" ? (borrowerId || currentUserId) : currentUserId;
    
    let finalStatus = requestedStatus || "pending";
    if (userRole !== "admin") {
        finalStatus = "pending";
    }
    
    const qty = borrowQuantity || 1;

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        borrows: {
          where: { 
            status: { in: ["borrowed", "pending", "approved"] }
          },
          select: { borrowQuantity: true },
        },
      },
    });

    if (!equipment) {
      return NextResponse.json({ error: "ไม่พบอุปกรณ์" }, { status: 404 });
    }

    const borrowedQty = equipment.borrows.reduce((s, b) => s + b.borrowQuantity, 0);
    const available = equipment.quantity - borrowedQty;

    if (qty > available) {
      return NextResponse.json(
        { error: `อุปกรณ์เหลือไม่พอ (คงเหลือ ${available} ชิ้น)` },
        { status: 400 }
      );
    }

    const transaction = await (prisma.borrowTransaction as any).create({
      data: {
        equipmentId,
        borrowerId: targetBorrowerId,
        borrowQuantity: qty,
        status: finalStatus,
        transactionType: transactionType || "BORROW",
        dueDate: new Date(dueDate),
        pickupLocation: pickupLocation || null,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Borrow error:", error);
    return NextResponse.json({ error: "ยืมอุปกรณ์ล้มเหลว" }, { status: 500 });
  }
}
