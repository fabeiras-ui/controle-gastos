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
    select: { id: true, email: true, nickname: true, role: true }
  })

  if (!user) {
    // Se o usuário logou (ex: via Google) mas não foi criado no banco pelo callback por algum motivo,
    // tentamos criar aqui para evitar que a aplicação quebre.
    try {
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          nickname: session.user.name || session.user.email.split('@')[0],
        },
        select: { id: true, email: true, nickname: true, role: true }
      })
      console.log(`Usuário criado sob demanda em requireUser: ${session.user.email}`)
      return newUser
    } catch (createError) {
      console.error("Erro ao criar usuário sob demanda:", createError)
      throw new Error("Usuário não encontrado e não pôde ser criado.")
    }
  }

  return user
}
