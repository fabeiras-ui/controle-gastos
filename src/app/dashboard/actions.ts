"use server"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { requireUser } from "@/lib/auth-utils"

export async function getExpensesByMonth(month: number, year: number) {
  try {
    const user = await requireUser()

    // Define o início e o fim do mês em UTC para evitar problemas de fuso horário
    const startDate = new Date(year, month, 1, 0, 0, 0, 0)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const expenses = await prisma.expense.findMany({
      where: {
        vencimento: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        type: {
          include: {
            categoryRef: true
          }
        },
      },
      orderBy: {
        vencimento: 'asc',
      },
    })

    // A lógica para incrementar parcelas progressivamente baseado no mês visualizado
    // foi implementada no componente de colunas (columns.tsx), pois lá temos acesso
    // ao contexto do mês/ano que está sendo renderizado na tabela.
    
    return expenses
  } catch (error) {
    console.error("Erro ao buscar despesas:", error)
    return []
  }
}

export async function updateExpenseStatus(id: number, status: string) {
  try {
    const user = await requireUser()
    const updatedExpense = await prisma.expense.update({
      where: { 
        id
      },
      data: { status },
    })
    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar status:", error)
    return { success: false, error: "Erro ao atualizar status" }
  }
}

export async function updateExpenseDescription(id: number, descricao: string) {
  try {
    const user = await requireUser()
    const originalExpense = await prisma.expense.findUnique({ 
      where: { 
        id
      } 
    })
    
    if (!originalExpense) {
      return { success: false, error: "Despesa não encontrada" }
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { descricao },
      include: { type: true }
    })

    // Replicar a mudança de descrição para todas as despesas idênticas do usuário
    await prisma.expense.updateMany({
      where: { 
        descricao: originalExpense.descricao
      },
      data: { descricao }
    })

    // Se a despesa tem um tipo associado, atualizamos o nome do tipo também
    if (updatedExpense.typeId) {
      // Nota: Idealmente ExpenseType também deveria ter userId, mas como não tem, 
      // ao menos garantimos que a despesa alterada pertence ao usuário.
      await prisma.expenseType.update({
        where: { id: updatedExpense.typeId },
        data: { name: descricao }
      })
    }

    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar descrição:", error)
    return { success: false, error: "Erro ao atualizar descrição" }
  }
}

export async function deleteExpense(id: number) {
  try {
    const user = await requireUser()
    await prisma.expense.delete({
      where: { 
        id
      },
    })
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    return { success: false, error: "Erro ao excluir despesa" }
  }
}

export async function getStatusList() {
  try {
    await requireUser()
    const statuses = await prisma.status.findMany()
    return statuses.map(s => s.name)
  } catch (error) {
    console.error("Erro ao buscar status:", error)
    return ["Pendente", "Pago"] // Fallback
  }
}

export async function getCategories() {
  try {
    await requireUser()
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
}

export async function updateExpenseCategory(expenseId: number, categoryId: number) {
  try {
    const user = await requireUser()
    const originalExpense = await prisma.expense.findUnique({ 
      where: { 
        id: expenseId
      },
      include: { type: true }
    })

    if (!originalExpense) {
      return { success: false, error: "Despesa não encontrada" }
    }

    let expenseType = await prisma.expenseType.findFirst({
      where: { categoryId: categoryId }
    })

    if (!expenseType) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } })
      expenseType = await prisma.expenseType.create({
        data: {
          name: originalExpense?.descricao || category?.name || "Geral",
          categoryId: categoryId
        }
      })
    }

    const updatedExpense = await prisma.expense.update({
      where: { 
        id: expenseId
      },
      data: { typeId: expenseType.id },
      include: {
        type: {
          include: {
            categoryRef: true
          }
        }
      }
    })

    // Replicar a mudança de categoria (typeId) para todas as despesas idênticas do usuário
    if (originalExpense) {
      await prisma.expense.updateMany({
        where: { 
          descricao: originalExpense.descricao
        },
        data: { typeId: expenseType.id }
      })

      // Se a despesa original já tinha um tipo, e esse tipo tinha o mesmo nome da despesa,
      // atualizamos a categoria desse tipo também (caso outros itens o usem)
      if (originalExpense.typeId) {
        await prisma.expenseType.update({
          where: { id: originalExpense.typeId },
          data: { categoryId: categoryId }
        })
      }
    }

    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar categoria da despesa:", error)
    return { success: false, error: "Erro ao atualizar categoria" }
  }
}

export async function getUsers() {
  try {
    await requireUser()
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
      },
      orderBy: { nickname: 'asc' }
    })
    return users
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return []
  }
}

export async function createExpense(data: {
  descricao: string
  responsavel: string
  real: number
  vencimento: Date
  status: string
  userId?: number
  totalParcelas?: number
  parcelaAtual?: number
  categoryId?: number
}) {
  try {
    const user = await requireUser()
    const finalUserId = user.id

    let typeId = null
    if (data.categoryId) {
      let expenseType = await prisma.expenseType.findFirst({
        where: { categoryId: data.categoryId }
      })

      if (!expenseType) {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
        expenseType = await prisma.expenseType.create({
          data: {
            name: category?.name || "Geral",
            categoryId: data.categoryId
          }
        })
      }
      typeId = expenseType.id
    }

    const { categoryId, ...expenseData } = data
    
    // Normalizar a data para evitar problemas de fuso horário (meio-dia)
    const normalizedVencimento = new Date(data.vencimento)
    normalizedVencimento.setHours(12, 0, 0, 0)

    const expense = await prisma.expense.create({
      data: {
        ...expenseData,
        userId: finalUserId,
        typeId,
        vencimento: normalizedVencimento,
      }
    })
    revalidatePath("/dashboard")
    return { success: true, data: expense }
  } catch (error) {
    console.error("Erro ao criar despesa:", error)
    return { success: false, error: "Erro ao criar despesa" }
  }
}

export async function updateExpense(id: number, data: {
  descricao?: string
  responsavel?: string
  real?: number
  vencimento?: Date
  status?: string
  userId?: number
  totalParcelas?: number
  parcelaAtual?: number
  categoryId?: number
}) {
  try {
    const user = await requireUser()
    let typeId = undefined
    if (data.categoryId) {
      let expenseType = await prisma.expenseType.findFirst({
        where: { categoryId: data.categoryId }
      })

      if (!expenseType) {
        const category = await prisma.category.findUnique({ where: { id: data.categoryId } })
        expenseType = await prisma.expenseType.create({
          data: {
            name: category?.name || "Geral",
            categoryId: data.categoryId
          }
        })
      }
      typeId = expenseType.id
    }

    const { categoryId, ...updateData } = data
    
    // Buscar a despesa original ANTES do update para comparar a descrição
    const originalExpense = await prisma.expense.findUnique({ 
      where: { 
        id
      } 
    })
    
    if (!originalExpense) {
      return { success: false, error: "Despesa não encontrada" }
    }

    // Normalizar a data para evitar problemas de fuso horário (meio-dia UTC)
    let normalizedVencimento = data.vencimento ? new Date(data.vencimento) : undefined
    if (normalizedVencimento) {
      normalizedVencimento.setUTCHours(12, 0, 0, 0)
    }

    // Sync responsavel se vier do formulário ou de edições que não passam o nickname explicitamente
    if (updateData.userId && !updateData.responsavel) {
      const responsavelUser = await prisma.user.findUnique({ where: { id: updateData.userId } })
      if (responsavelUser) {
        updateData.responsavel = responsavelUser.nickname
      }
    }

    const updatedExpense = await prisma.expense.update({
      where: { 
        id
      },
      data: {
        ...updateData,
        ...(typeId !== undefined ? { typeId } : {}),
        ...(normalizedVencimento ? { vencimento: normalizedVencimento } : {}),
      },
      include: {
        type: true
      }
    })

    // Se a descrição mudou, atualizamos todas as despesas com a mesma descrição antiga
    // Também replicamos a categoria (typeId) se ela foi alterada
    if (originalExpense && (
      (data.descricao && originalExpense.descricao !== data.descricao) || 
      (typeId !== undefined && originalExpense.typeId !== typeId) ||
      (data.totalParcelas !== undefined && originalExpense.totalParcelas !== data.totalParcelas) ||
      (data.parcelaAtual !== undefined && originalExpense.parcelaAtual !== data.parcelaAtual)
    )) {
      // Se apenas a parcela mudou, calculamos o deslocamento para atualizar as outras
      const parcelaDiff = (data.parcelaAtual !== undefined && originalExpense.parcelaAtual !== null) 
        ? data.parcelaAtual - originalExpense.parcelaAtual 
        : 0;

      // Buscar irmãos (despesas com a mesma descrição base)
      // Remover sufixo de parcela da descrição para encontrar todos os irmãos
      // Ex: "Itaú (1/12)" -> "Itaú"
      const baseDescricao = originalExpense.descricao.replace(/\s\(\d+\/\d+\)$/, "");

      const siblings = await prisma.expense.findMany({
        where: { 
          descricao: {
            startsWith: baseDescricao
          }
        }
      });

      for (const sibling of siblings) {
        // Verificar se é realmente um irmão (mesma base ou padrão de parcela)
        const siblingBase = sibling.descricao.replace(/\s\(\d+\/\d+\)$/, "");
        if (siblingBase !== baseDescricao) continue;

        // Pular a própria despesa que já foi atualizada acima
        if (sibling.id === id) continue;

        let newParcelaAtual = sibling.parcelaAtual;
        if (parcelaDiff !== 0 && sibling.parcelaAtual !== null) {
          newParcelaAtual = sibling.parcelaAtual + parcelaDiff;
        }

        await prisma.expense.update({
          where: { id: sibling.id },
          data: {
            ...(data.descricao ? { descricao: data.descricao } : {}),
            ...(typeId !== undefined ? { typeId } : {}),
            ...(data.totalParcelas !== undefined ? { totalParcelas: data.totalParcelas } : {}),
            ...(parcelaDiff !== 0 ? { parcelaAtual: newParcelaAtual } : {})
          }
        });
      }

      // Se o nome mudou ou a categoria mudou, e essa despesa tem um tipo associado, 
      // atualizamos o ExpenseType correspondente para refletir o novo nome e nova categoria.
      if (updatedExpense.typeId) {
        await prisma.expenseType.update({
          where: { id: updatedExpense.typeId },
          data: { 
            ...(data.descricao ? { name: data.descricao } : {}),
            ...(data.categoryId ? { categoryId: data.categoryId } : {})
          }
        })
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/settings")

    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error)
    return { success: false, error: "Erro ao atualizar despesa" }
  }
}

export async function updateExpenseResponsavel(id: number, userId: number, nickname: string) {
  try {
    const user = await requireUser()
    const updatedExpense = await prisma.expense.update({
      where: { 
        id
      },
      data: { userId, responsavel: nickname },
    })
    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar responsável:", error)
    return { success: false, error: "Erro ao atualizar responsável" }
  }
}

export async function updateExpenseReal(id: number, real: number) {
  try {
    const user = await requireUser()
    const updatedExpense = await prisma.expense.update({
      where: { 
        id
      },
      data: { real },
    })
    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar valor real:", error)
    return { success: false, error: "Erro ao atualizar valor real" }
  }
}

export async function updateExpenseVencimento(id: number, vencimento: Date) {
  try {
    const user = await requireUser()
    const normalizedVencimento = new Date(vencimento)
    normalizedVencimento.setUTCHours(12, 0, 0, 0)
    
    const updatedExpense = await prisma.expense.update({
      where: { 
        id
      },
      data: { vencimento: normalizedVencimento },
    })
    revalidatePath("/dashboard")
    return { success: true, data: updatedExpense }
  } catch (error) {
    console.error("Erro ao atualizar vencimento:", error)
    return { success: false, error: "Erro ao atualizar vencimento" }
  }
}

export async function getDashboardData(month: number, year: number) {
  try {
    const user = await requireUser()

    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevStartDate = new Date(Date.UTC(prevYear, prevMonth, 1, 0, 0, 0, 0))
    const prevEndDate = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999))

    const [currentExpenses, prevExpenses, currentTotalPrevisto] = await Promise.all([
      prisma.expense.aggregate({
        where: { 
          vencimento: { gte: startDate, lte: endDate },
          status: "Pago"
        },
        _sum: { real: true }
      }),
      prisma.expense.aggregate({
        where: { 
          vencimento: { gte: prevStartDate, lte: prevEndDate },
          status: "Pago"
        },
        _sum: { real: true }
      }),
      prisma.expense.aggregate({
        where: { 
          vencimento: { gte: startDate, lte: endDate }
        },
        _sum: { real: true }
      })
    ])

    const totalCurrent = currentExpenses._sum.real || 0
    const totalPrev = prevExpenses._sum.real || 0
    const totalPrevisto = currentTotalPrevisto._sum.real || 0
    
    let percentageChange = 0
    if (totalPrev > 0) {
      percentageChange = ((totalCurrent - totalPrev) / totalPrev) * 100
    } else if (totalCurrent > 0) {
      percentageChange = 100
    }

    return {
      totalGastos: totalCurrent,
      totalPrevisto,
      percentageChange,
      diffValue: totalCurrent - totalPrev,
      isHigher: totalCurrent > totalPrev
    }
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return { totalGastos: 0, totalPrevisto: 0, percentageChange: 0, diffValue: 0, isHigher: false }
  }
}

export async function importPreviousMonthExpenses(targetMonth: number, targetYear: number) {
  try {
    const user = await requireUser()

    const prevMonth = targetMonth === 0 ? 11 : targetMonth - 1
    const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear

    const startDate = new Date(prevYear, prevMonth, 1, 0, 0, 0, 0)
    const endDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59, 999)

    const prevExpenses = await prisma.expense.findMany({
      where: {
        vencimento: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    if (prevExpenses.length === 0) {
      return { success: false, error: "Nenhuma despesa encontrada no mês anterior." }
    }

    const newExpenses = prevExpenses.map((expense) => {
      const isParcelado = expense.totalParcelas && expense.totalParcelas > 1
      let newDescription = expense.descricao
      
      // Nova data com mesmo dia, mas mês e ano atualizados
      const newVencimento = new Date(expense.vencimento)
      newVencimento.setFullYear(targetYear)
      newVencimento.setMonth(targetMonth)
      newVencimento.setHours(12, 0, 0, 0)

      // Se o dia não existe no mês de destino (ex: 31 de janeiro para fevereiro),
      // o JS ajusta automaticamente para o próximo mês (março). 
      // Vamos garantir que fique no último dia do mês de destino se isso acontecer.
      if (newVencimento.getMonth() !== targetMonth) {
        newVencimento.setDate(0)
      }

      let parcelaAtual = expense.parcelaAtual
      if (isParcelado && parcelaAtual !== null && expense.totalParcelas !== null) {
        if (parcelaAtual < expense.totalParcelas) {
          parcelaAtual += 1
          
          // Se a descrição contém a parcela no formato (XX/YY), atualiza para a nova parcela
          const parcelaRegex = /\((\d+)\/(\d+)\)/
          if (parcelaRegex.test(newDescription)) {
            newDescription = newDescription.replace(parcelaRegex, `(${parcelaAtual}/${expense.totalParcelas})`)
          }
        } else {
          // Se já atingiu o total de parcelas, talvez não devêssemos replicar?
          // O requisito não é explícito aqui, mas geralmente parcelas terminadas não replicam.
          // Vou retornar null e filtrar depois.
          return null
        }
      }

      return {
        descricao: newDescription,
        responsavel: expense.responsavel,
        real: expense.real,
        vencimento: newVencimento,
        status: "Pendente",
        userId: expense.userId,
        typeId: expense.typeId,
        totalParcelas: expense.totalParcelas,
        parcelaAtual: parcelaAtual,
      }
    }).filter(e => e !== null)

    if (newExpenses.length === 0) {
      return { success: false, error: "Nenhuma despesa elegível para replicação encontrada." }
    }

    await prisma.expense.createMany({
      data: newExpenses as any,
    })

    revalidatePath("/dashboard")

    return { success: true, count: newExpenses.length }
  } catch (error) {
    console.error("Erro ao importar despesas:", error)
    return { success: false, error: "Erro ao importar despesas" }
  }
}

export async function getChartData(filter: string, selectedYear: number, selectedMonth: number) {
  try {
    const user = await requireUser()

    let startDate: Date
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999) // Fim do mês selecionado

    if (filter === "30days") {
      startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 30)
    } else if (filter === "6months") {
      startDate = new Date(selectedYear, selectedMonth - 5, 1)
    } else if (filter === "1year") {
      startDate = new Date(selectedYear, selectedMonth - 11, 1)
    } else {
      startDate = new Date(selectedYear, 0, 1)
    }

    const expenses = await prisma.expense.findMany({
      where: {
        vencimento: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        real: true,
        vencimento: true,
        status: true
      },
      orderBy: {
        vencimento: 'asc'
      }
    })

    // Gerar lista de todos os meses/períodos no intervalo para garantir que o gráfico não fique vazio
    const chartData: { name: string, realizado: number, previsto: number }[] = []
    const current = new Date(startDate)
    
    if (filter === "30days") {
        // Iniciar no primeiro dia do mês selecionado
        const current = new Date(Date.UTC(selectedYear, selectedMonth, 1, 12, 0, 0, 0))
        // Fim do mês selecionado
        const monthEndDate = new Date(Date.UTC(selectedYear, selectedMonth + 1, 0, 12, 0, 0, 0))

        while (current <= monthEndDate) {
            const dayLabel = `${current.getUTCDate()}/${current.getUTCMonth() + 1}`
            const filteredExpenses = expenses
                .filter(e => {
                    const d = new Date(e.vencimento)
                    return d.getUTCDate() === current.getUTCDate() && 
                           d.getUTCMonth() === current.getUTCMonth() && 
                           d.getUTCFullYear() === current.getUTCFullYear()
                })
            
            const realizado = filteredExpenses
                .filter(e => e.status === "Pago")
                .reduce((acc, curr) => acc + curr.real, 0)
            
            const previsto = filteredExpenses
                .reduce((acc, curr) => acc + curr.real, 0)
            
            chartData.push({ name: dayLabel, realizado, previsto })
            current.setUTCDate(current.getUTCDate() + 1)
        }
    } else {
        // Agrupar por mês
        while (current <= endDate) {
            const monthLabel = current.toLocaleString('pt-BR', { month: 'short' })
            const filteredExpenses = expenses
                .filter(e => {
                    const d = new Date(e.vencimento)
                    return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()
                })
            
            const realizado = filteredExpenses
                .filter(e => e.status === "Pago")
                .reduce((acc, curr) => acc + curr.real, 0)
            
            const previsto = filteredExpenses
                .reduce((acc, curr) => acc + curr.real, 0)
            
            chartData.push({ name: monthLabel, realizado, previsto })
            current.setMonth(current.getMonth() + 1)
        }
    }

    return chartData
  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error)
    return []
  }
}
