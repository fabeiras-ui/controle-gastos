"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Category Actions
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { types: true }
        }
      }
    })
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
}

export async function createCategory(data: { name: string, icon?: string }) {
  try {
    const category = await prisma.category.create({
      data
    })
    revalidatePath("/settings")
    return { success: true, data: category }
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return { success: false, error: "Erro ao criar categoria" }
  }
}

export async function deleteCategory(id: number) {
  try {
    const count = await prisma.expenseType.count({
      where: { categoryId: id }
    })
    if (count > 0) {
      return { success: false, error: "Não é possível excluir: existem tipos de despesa vinculados." }
    }
    await prisma.category.delete({ where: { id } })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir categoria:", error)
    return { success: false, error: "Erro ao excluir categoria" }
  }
}

// Expense Type Actions
export async function getExpenseTypes() {
  try {
    return await prisma.expenseType.findMany({
      orderBy: [
        { categoryRef: { name: 'asc' } },
        { name: 'asc' }
      ],
      include: {
        categoryRef: true,
        _count: {
          select: { expenses: true }
        }
      }
    })
  } catch (error) {
    console.error("Erro ao buscar tipos de despesas:", error)
    return []
  }
}

export async function createExpenseType(data: { name: string, categoryId: number, isActive: boolean }) {
  try {
    const expenseType = await prisma.expenseType.create({
      data
    })
    revalidatePath("/settings")
    return { success: true, data: expenseType }
  } catch (error) {
    console.error("Erro ao criar tipo de despesa:", error)
    return { success: false, error: "Erro ao criar tipo de despesa" }
  }
}

export async function deleteExpenseType(id: number) {
  try {
    // Verificar se existem despesas atreladas
    const count = await prisma.expense.count({
      where: { typeId: id }
    })

    if (count > 0) {
      return { success: false, error: "Não é possível excluir: existem despesas atreladas a este tipo." }
    }

    await prisma.expenseType.delete({
      where: { id }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir tipo de despesa:", error)
    return { success: false, error: "Erro ao excluir tipo de despesa" }
  }
}

export async function updateExpenseTypeStatus(id: number, isActive: boolean) {
  try {
    await prisma.expenseType.update({
      where: { id },
      data: { isActive }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar status do tipo de despesa:", error)
    return { success: false, error: "Erro ao atualizar status" }
  }
}

// Status Actions
export async function getStatuses() {
  try {
    return await prisma.status.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    })
  } catch (error) {
    console.error("Erro ao buscar status:", error)
    return []
  }
}

export async function createStatus(name: string) {
  try {
    const status = await prisma.status.create({
      data: { name }
    })
    revalidatePath("/settings")
    return { success: true, data: status }
  } catch (error) {
    console.error("Erro ao criar status:", error)
    return { success: false, error: "Erro ao criar status" }
  }
}

export async function deleteStatus(id: number) {
  try {
    // Verificar se existem despesas atreladas
    const count = await prisma.expense.count({
      where: { statusId: id }
    })

    if (count > 0) {
      return { success: false, error: "Não é possível excluir: existem despesas atreladas a este status." }
    }

    await prisma.status.delete({
      where: { id }
    })
    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Erro ao excluir status:", error)
    return { success: false, error: "Erro ao excluir status" }
  }
}
