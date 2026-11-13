export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { userCreateSchema, userPatchSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`users-get:${ip}`, RATE_LIMITS.read);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        borrows: {
          where: { status: { in: ["borrowed", "overdue"] } },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.fullName || u.username,
      username: u.username,
      email: u.username,
      phone: u.phone || "-",
      role: u.role,
      image: u.image,
      status: (u as any).status || "active",
      department: u.department || "General",
      borrowedCount: u.borrows.length
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`users-post:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { username, password, fullName, phone, department, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        phone,
        department: department || "General",
        role: role || "user",
        status: "active",
      },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`users-patch:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = userPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { id, role, status, password } = parsed.data;
    
    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`users-delete:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if ((session.user as any).id === id) {
      return NextResponse.json({ error: "ไม่สามารถลบข้อมูลของตนเองได้" }, { status: 400 });
    }

    const activeLoans = await prisma.borrowTransaction.findFirst({
      where: {
        borrowerId: id,
        status: { in: ["borrowed", "overdue", "pending"] }
      }
    });

    if (activeLoans) {
      return NextResponse.json({ 
        error: "ไม่สามารถลบได้เนื่องจากยังมีอุปกรณ์ที่ยังไม่ได้คืน" 
      }, { status: 400 });
    }

    try {
      await prisma.user.delete({
        where: { id },
      });
      return NextResponse.json({ message: "User deleted successfully" });
    } catch (dbError: any) {

      if (dbError.code === 'P2003') {
        return NextResponse.json({ 
          error: "ไม่สามารถลบได้เนื่องจากผู้ใช้งานมีประวัติการทำรายการในระบบ (แนะนำให้ใช้วิธีระงับการใช้งานแทน)" 
        }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบข้อมูล" }, { status: 500 });
  }
}
