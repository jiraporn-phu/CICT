export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { borrowPatchSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`borrow-patch:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const existing = await prisma.borrowTransaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (userRole !== "admin" && existing.borrowerId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const parsed = borrowPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { status, note, afterImageUrl, returnLocation } = parsed.data;

    let transaction;
    
    // Special handling for Requisition approval
    if (status === "requisitioned" && (existing as any).transactionType === "REQUISITION" && existing.status === "pending" && userRole === "admin") {
        transaction = await prisma.$transaction(async (tx) => {
            // Decrease equipment quantity
            await tx.equipment.update({
                where: { id: existing.equipmentId },
                data: {
                    quantity: { decrement: existing.borrowQuantity }
                }
            });

            // Update transaction status
            return await tx.borrowTransaction.update({
                where: { id },
                data: {
                    status: "requisitioned",
                    note: note || existing.note,
                }
            });
        });
    } else {
        const updateData: any = {};
        
        if (status && userRole === "admin") {
            updateData.status = status;
            if (status === "returned") {
                updateData.returnDate = new Date();
            }
        } else if (status) {
            return NextResponse.json({ error: "Only admins can change transaction status" }, { status: 403 });
        }

        if (note) updateData.note = note;
        if (afterImageUrl) updateData.afterImageUrl = afterImageUrl;
        if (returnLocation) updateData.returnLocation = returnLocation;

        transaction = await prisma.borrowTransaction.update({
            where: { id },
            data: updateData,
        });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Borrow PATCH error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`borrow-delete:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const userRole = (session.user as any)?.role;
    const currentUserId = (session.user as any)?.id;

    const existing = await prisma.borrowTransaction.findUnique({
        where: { id }
    });

    if (!existing) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (userRole !== "admin" && existing.borrowerId !== currentUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (userRole !== "admin" && existing.status !== "pending") {
        return NextResponse.json({ error: "Cannot delete active or completed transactions" }, { status: 400 });
    }

    await prisma.borrowTransaction.delete({
        where: { id }
    });
      return NextResponse.json({ success: true });
  } catch (error) {
      console.error("Borrow DELETE error:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
