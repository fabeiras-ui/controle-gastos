"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Import } from "lucide-react"
import { importPreviousMonthExpenses } from "./actions"
import { toast } from "sonner"

interface ImportExpensesButtonProps {
  month: number
  year: number
  onImportSuccess: () => void
}

export function ImportExpensesButton({ month, year, onImportSuccess }: ImportExpensesButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await importPreviousMonthExpenses(month, year)
      if (result.success) {
        toast.success(`${result.count} despesas importadas com sucesso!`)
        onImportSuccess()
        setOpen(false)
      } else {
        toast.error(result.error || "Erro ao importar despesas")
      }
    } catch (error) {
      toast.error("Erro inesperado ao importar despesas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="gap-2 size-9">
            <Import className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Despesas</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja importar as despesas do mês anterior para o mês atual? 
            As despesas serão replicadas com status pendente e os valores originais serão mantidos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={loading}>
            {loading ? "Importando..." : "Seguir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
