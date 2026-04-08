"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getUsers, getStatusList, getCategories } from "./actions"
import type { AppUser, Category } from "@/types"
import * as LucideIcons from "lucide-react"
import { HelpCircle } from "lucide-react"

export interface ExpenseFormData {
  descricao: string
  responsavel: string
  real: string
  vencimento: string
  status: string
  userId: string
  totalParcelas: string
  parcelaAtual: string
  categoryId: string
}

interface ExpenseFormProps {
  initialData?: ExpenseFormData
  onSubmit: (data: ExpenseFormData) => Promise<void>
  loading: boolean
  onCancel: () => void
  submitLabel: string
}

const IconRenderer = ({ iconName }: { iconName?: string | null }) => {
  if (!iconName) return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  const Icon = (LucideIcons as any)[iconName]
  if (!Icon) return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  return <Icon className="h-4 w-4" />
}

export function ExpenseForm({
  initialData,
  onSubmit,
  loading,
  onCancel,
  submitLabel,
}: ExpenseFormProps) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [statuses, setStatuses] = useState<{ name: string; color: string | null }[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      descricao: "",
      responsavel: "",
      real: "",
      vencimento: new Date().toISOString().split("T")[0],
      status: "",
      userId: "",
      totalParcelas: "1",
      parcelaAtual: "1",
      categoryId: "",
    }
  )

  useEffect(() => {
    async function loadData() {
      const [userData, statusData, categoryData] = await Promise.all([
        getUsers(),
        getStatusList(),
        getCategories(),
      ])
      setUsers(userData as AppUser[])
      setStatuses(statusData as { name: string; color: string | null }[])
      setCategories(categoryData as Category[])

      if (!initialData) {
        if (userData.length > 0) {
          setFormData(prev => ({ ...prev, userId: userData[0].id.toString(), responsavel: userData[0].nickname }))
        }
        if (statusData.length > 0) {
          setFormData(prev => ({ ...prev, status: statusData[0].name }))
        }
        if (categoryData.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: categoryData[0].id.toString() }))
        }
      }
    }
    loadData()
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="descricao">Nome da Despesa</Label>
        <Input
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Categoria</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => value && setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger id="categoryId" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <IconRenderer iconName={selectedCategory?.icon} />
                <SelectValue>{selectedCategory?.name || "Categoria"}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  <div className="flex items-center gap-2">
                    <IconRenderer iconName={cat.icon} />
                    <span>{cat.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="userId">Responsável</Label>
          <Select
            value={formData.userId}
            onValueChange={(value) => {
              if (value) {
                const user = users.find(u => u.id.toString() === value)
                setFormData({ ...formData, userId: value, responsavel: user?.nickname || "" })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue>{formData.responsavel || "Responsável"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="totalParcelas">Total de Parcelas</Label>
          <Input
            id="totalParcelas"
            type="number"
            min="1"
            value={formData.totalParcelas}
            onChange={(e) => setFormData({ ...formData, totalParcelas: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parcelaAtual">Parcela Atual/Inicial</Label>
          <Input
            id="parcelaAtual"
            type="number"
            min="1"
            value={formData.parcelaAtual}
            onChange={(e) => setFormData({ ...formData, parcelaAtual: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="real">Valor Real</Label>
          <Input
            id="real"
            type="number"
            step="0.01"
            value={formData.real}
            onChange={(e) => setFormData({ ...formData, real: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => value && setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue>{formData.status || "Status"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.name} value={status.name}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vencimento">Vencimento</Label>
          <Input
            id="vencimento"
            type="date"
            value={formData.vencimento}
            onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
