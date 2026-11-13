import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const managedCategories = await prisma.categoryGroup.findMany({
      orderBy: { name: 'asc' }
    });

    const existingEquipmentCategories = await prisma.equipment.groupBy({
      by: ['department', 'category'],
    });

    const groupedData: Record<string, string[]> = {};
    
    managedCategories.forEach((item: any) => {
      if (!groupedData[item.department]) {
        groupedData[item.department] = [];
      }
      if (!groupedData[item.department].includes(item.name)) {
        groupedData[item.department].push(item.name);
      }
    });

    existingEquipmentCategories.forEach((item: any) => {
      if (!groupedData[item.department]) {
        groupedData[item.department] = [];
      }
      if (!groupedData[item.department].includes(item.category)) {
        groupedData[item.department].push(item.category);
      }
    });

    Object.keys(groupedData).forEach(dept => {
      groupedData[dept].sort((a, b) => a.localeCompare(b, 'th'));
    });

    return NextResponse.json(groupedData);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "โหลดข้อมูลหมวดหมู่ล้มเหลว" }, { status: 500 });
  }
}
