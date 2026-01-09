import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { image } = await req.json();

    const user = await prisma.user.update({
      where: {
        email: session.user.email!,
      },
      data: {
        image: image,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
