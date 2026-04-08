"use client"

import { useEffect, useState, useCallback } from "react"
import { getExpensesByMonth, getStatusList, getCategories, getUsers } from "./actions"
import { DataTable } from "@/components/ui/data-table"
import { getColumns, Expense } from "./columns"

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
  const [loading, setLoading] = useState(!data)
  const [statusList, setStatusList] = useState<{ name: string; color?: string }[]>([])
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])
  const [users, setUsers] = useState<{id: number, nickname: string}[]>([])

  const loadExpenses = useCallback(async () => {
    if (data) return
    setLoading(true)
    const result = await getExpensesByMonth(month, year)
    setInternalExpenses(result as any)
    setLoading(false)
  }, [month, year, data])

  const handleUpdate = useCallback(() => {
    if (onUpdate) {
      onUpdate()
    } else {
      loadExpenses()
    }
  }, [onUpdate, loadExpenses])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const expenses = data || internalExpenses

  useEffect(() => {
    async function loadInitialData() {
      const [statuses, cats, userData] = await Promise.all([
        getStatusList(),
        getCategories(),
        getUsers()
      ])
      setStatusList(statuses as any)
      setCategories(cats)
      setUsers(userData)
    }
    loadInitialData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Carregando despesas...</div>
  }

  const columns = getColumns(statusList as any, categories, handleUpdate, month, year, users)

  return (
    <div className="">
      <DataTable columns={columns} data={expenses} />
    </div>
  )
}
