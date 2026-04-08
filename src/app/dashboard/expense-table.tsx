"use client"

import { useEffect, useState, useCallback } from "react"
import { getExpensesByMonth, getStatusList, getCategories, getUsers } from "./actions"
import { DataTable } from "@/components/ui/data-table"
import { getColumns, Expense } from "./columns"
import type { Status, Category, AppUser } from "@/types"

export function ExpenseTable({ 
  month, 
  year, 
  data,
  onUpdate
}: { 
  month: number; 
  year: number; 
  data?: Expense[];
  onUpdate?: () => void;
}) {
  const [internalExpenses, setInternalExpenses] = useState<Expense[]>([])
  const [statusList, setStatusList] = useState<Status[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<AppUser[]>([])

  const loadExpenses = useCallback(async () => {
    if (data) return
    const result = await getExpensesByMonth(month, year)
    setInternalExpenses(result as unknown as Expense[])
  }, [month, year, data])

  const handleUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate()
    } else {
      loadExpenses()
    }
  }, [onUpdate, loadExpenses])

  useEffect(() => {
    if (data) return
    let cancelled = false
    getExpensesByMonth(month, year).then((result) => {
      if (cancelled) return
      setInternalExpenses(result as unknown as Expense[])
    })
    return () => { cancelled = true }
  }, [month, year, data])

  const expenses = data || internalExpenses
  const loading = !data && internalExpenses.length === 0
  
  const isEmpty = !loading && expenses.length === 0 && !data

  useEffect(() => {
    async function loadInitialData() {
      const [statuses, cats, userData] = await Promise.all([
        getStatusList(),
        getCategories(),
        getUsers()
      ])
      setStatusList(statuses as Status[])
      setCategories(cats as Category[])
      setUsers(userData as AppUser[])
    }
    loadInitialData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse">Carregando despesas...</div>
  }

  if (isEmpty) {
    return (
      <div className="p-12 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Nenhuma despesa encontrada para este mês.</p>
        <p className="text-sm text-muted-foreground mt-2">Clique em "Nova Despesa" para começar!</p>
      </div>
    )
  }

  const columns = getColumns(statusList, categories, handleUpdate, month, year, users)

  return (
    <div className="">
      <DataTable columns={columns} data={expenses} />
    </div>
  )
}
