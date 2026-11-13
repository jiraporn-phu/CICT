export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { profileUpdateSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`profile-get:${ip}`, RATE_LIMITS.read);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: {
        id: true,
        username: true,
        fullName: true,
        phone: true,
        image: true,
        role: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`profile-put:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.image && !body.fullName) {
       const updatedUser = await prisma.user.update({
        where: { id: (session.user as any).id },
        data: { image: body.image },
      });
      return NextResponse.json({ message: "Image updated", user: updatedUser });
    }

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { fullName, phone, image, department, password, confirmPassword } = parsed.data;

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      fullName,
      phone,
      image,
      department,
    };

    if (password) {
      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
