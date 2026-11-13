import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = (session.user as any).id;

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: {
                userId: userId
            },
            include: {
                equipment: {
                    include: {
                        borrows: {
                            where: { status: { in: ["borrowed", "overdue"] } },
                            select: { id: true, borrowQuantity: true, borrowerId: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const result = wishlistItems.map((wi) => {
            const eq = wi.equipment;
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
        console.error("Error fetching wishlist:", error);
        return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { equipmentId } = body;

        if (!equipmentId) {
            return NextResponse.json({ error: "equipmentId is required" }, { status: 400 });
        }

        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_equipmentId: {
                    userId: session.user.id,
                    equipmentId: equipmentId
                }
            }
        });

        if (existingItem) {
            return NextResponse.json({ message: "Item already in wishlist" }, { status: 200 });
        }

        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                userId: session.user.id,
                equipmentId: equipmentId
            }
        });

        return NextResponse.json(wishlistItem, { status: 201 });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
    }
}
