"use server"
import prisma from "@/lib/prisma"
import { requireUser } from "@/lib/auth-utils"

export async function getCategorySpending(month: number, year: number) {
  try {
    const user = await requireUser()
    const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

    const expenses = await prisma.expense.findMany({
      where: {
        vencimento: {
          gte: startDate,
          lte: endDate,
        },
        status: "Pago",
      },
      include: {
        type: {
          include: {
            categoryRef: true
          }
        },
      },
    })

    const categoryTotals: Record<string, { total: number, color: string, icon: string }> = {}
    let grandTotal = 0

    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#eab308', '#8b5cf6', 
      '#f97316', '#06b6d4', '#ec4899', '#6366f1', '#f43f5e', 
      '#14b8a6', '#f59e0b', '#d946ef', '#a855f7', '#0ea5e9', 
      '#22c55e', '#84cc16'
    ]

    const getDeterministicColor = (name: string) => {
      let hash = 0
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
      const index = Math.abs(hash) % colors.length
      return colors[index]
    }

    expenses.forEach(expense => {
      const category = expense.type?.categoryRef?.name || "Outros"
      const color = expense.type?.categoryRef?.color || getDeterministicColor(category)
      const icon = expense.type?.categoryRef?.icon || "HelpCircle"
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, color, icon }
      }
      categoryTotals[category].total += expense.real
      grandTotal += expense.real
    })

    const result = Object.entries(categoryTotals).map(([name, data]) => ({
      name,
      value: data.total,
      percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      color: data.color,
      icon: data.icon
    })).sort((a, b) => b.value - a.value)

    return result
  } catch (error) {
    console.error("Erro ao buscar gastos por categoria:", error)
    return []
  }
}
