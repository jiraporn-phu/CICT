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

    const { name, department } = await req.json();

    if (!name?.trim() || !department?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกชื่อหมวดหมู่และแผนก" }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่ต้องไม่เกิน 100 ตัวอักษร" }, { status: 400 });
    }

    if (/[<>{}]/.test(name)) {
      return NextResponse.json({ error: "ชื่อหมวดหมู่มีอักขระที่ไม่อนุญาต" }, { status: 400 });
    }

    const existing = await prisma.categoryGroup.findFirst({
      where: { name: name.trim(), department: department.trim() }
    });

    if (existing) {
      return NextResponse.json({ error: `หมวดหมู่ "${name}" มีอยู่แล้วในแผนก ${department}` }, { status: 409 });
    }

    const created = await prisma.categoryGroup.create({
      data: {
        name: name.trim(),
        department: department.trim()
      }
    });

    return NextResponse.json({ success: true, category: created });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "สร้างหมวดหมู่ไม่สำเร็จ" }, { status: 500 });
  }
}
