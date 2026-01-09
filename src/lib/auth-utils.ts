import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function requireUser() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    throw new Error("Não autorizado: Sessão inválida ou expirada")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, nickname: true }
  })

  if (!user) {
    throw new Error("Usuário não encontrado no sistema")
  }

  return user
}
