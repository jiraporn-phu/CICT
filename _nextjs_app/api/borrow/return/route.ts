export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { returnSchema, formatZodError } from "@/app/lib/validations";
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from "@/app/lib/rate-limit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`borrow-return:${ip}`, RATE_LIMITS.write);
  if (!rl.success) return rateLimitResponse(rl);

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = returnSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { transactionId, afterImageUrl, returnLocation, note } = parsed.data;

    const transaction = await prisma.borrowTransaction.update({
      where: { id: transactionId },
      data: {
        status: "returned",
        returnDate: new Date(),
        afterImageUrl: afterImageUrl || null,
        returnLocation: returnLocation || null,
        note: note || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Return error:", error);
    return NextResponse.json({ error: "คืนอุปกรณ์ล้มเหลว" }, { status: 500 });
  }
}
