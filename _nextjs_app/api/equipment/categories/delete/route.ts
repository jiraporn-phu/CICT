import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, department } = await req.json();

    if (!category || !department) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await prisma.categoryGroup.deleteMany({
      where: {
        name: category,
        department: department
      }
    });

    await prisma.equipment.updateMany({
      where: {
        category: category,
        department: department
      },
      data: {
        category: "อื่นๆ"
      }
    });

    return NextResponse.json({ success: true, message: `Category '${category}' deleted and equipment reassigned.` });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
