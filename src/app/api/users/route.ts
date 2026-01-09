import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { nickname, name, email, password, image } = await req.json()

    if (!nickname || !email || !password) {
      return NextResponse.json({ error: "Nickname, email e senha são obrigatórios" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Usuário com este e-mail já existe" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        nickname,
        name,
        email,
        password: hashedPassword,
        image,
      }
    })

    return NextResponse.json({ 
      user: { 
        id: user.id, 
        nickname: user.nickname, 
        name: user.name,
        email: user.email,
        image: user.image 
      } 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { id, nickname, name, email, password, image } = await req.json()

    if (!id || !nickname || !email) {
      return NextResponse.json({ error: "ID, nickname e email são obrigatórios" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    })

    if (!existingUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o email já está sendo usado por outro usuário
    const emailConflict = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: Number(id) }
      }
    })

    if (emailConflict) {
      return NextResponse.json({ error: "Este e-mail já está em uso por outro usuário" }, { status: 400 })
    }

    const data: any = {
      nickname,
      name,
      email,
      image,
    }

    if (password && typeof password === 'string' && password.trim().length > 0) {
      data.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data
    })

    return NextResponse.json({ 
      user: { 
        id: updatedUser.id, 
        nickname: updatedUser.nickname, 
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image 
      } 
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
