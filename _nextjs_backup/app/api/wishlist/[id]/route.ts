import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: equipmentId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.wishlistItem.delete({
            where: {
                userId_equipmentId: {
                    userId: session.user.id,
                    equipmentId: equipmentId
                }
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        if (error.code === 'P2025') { 
            return new NextResponse(null, { status: 204 });
        }
        console.error("Error removing from wishlist:", error);
        return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
    }
}
