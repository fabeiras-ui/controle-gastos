"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createExpense } from "./actions"
import { toast } from "sonner"
import { ExpenseForm, ExpenseFormData } from "./expense-form"

interface CreateExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateExpenseDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: ExpenseFormData) => {
    setLoading(true)

    try {
      const result = await createExpense({
        descricao: formData.descricao,
        responsavel: formData.responsavel,
        real: parseFloat(formData.real) || 0,
        vencimento: new Date(formData.vencimento),
        status: formData.status,
        userId: parseInt(formData.userId),
        totalParcelas: parseInt(formData.totalParcelas) || 1,
        parcelaAtual: parseInt(formData.parcelaAtual) || 1,
        categoryId: parseInt(formData.categoryId),
      })

      if (result.success) {
        toast.success("Despesa criada com sucesso!")
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error("Erro ao criar despesa")
      }
    } catch (error) {
      toast.error("Erro ao criar despesa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
          <DialogDescription className="sr-only">
            Preencha os dados abaixo para criar uma nova despesa.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => onOpenChange(false)}
          submitLabel="Salvar"
        />
      </DialogContent>
    </Dialog>
  )
}
