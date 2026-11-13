export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { userCreateSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.auth);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const body = await request.json();

    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { username, password, fullName, phone, department } = parsed.data;

    const cleanPhone = phone.replaceAll(/[-\s]/g, "");
    if (!/^0\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username นี้ถูกใช้แล้ว กรุณาเลือก username อื่น" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        phone: cleanPhone,
        department: department || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      {
        message: "ลงทะเบียนสำเร็จ",
        user: { id: user.id, username: user.username, fullName: user.fullName },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
