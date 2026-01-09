import prisma from "@/lib/prisma"
import { requireUser } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await requireUser()

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    if (error instanceof Error && error.message.includes("Não autorizado")) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
