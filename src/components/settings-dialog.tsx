"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus, HelpCircle, Settings, Tag, ListChecks, Layers } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { 
  createExpenseType, 
  deleteExpenseType, 
  getExpenseTypes, 
  updateExpenseTypeStatus,
  createStatus,
  deleteStatus,
  getStatuses,
  createCategory,
  deleteCategory,
  getCategories
} from "@/app/settings/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const AVAILABLE_ICONS = [
  "Home", "Zap", "Droplets", "Wifi", "Tv", "ShoppingCart", "Coffee", "Utensils", 
  "Car", "Bus", "Wrench", "ShieldCheck", "HeartPulse", "Pill", "GraduationCap", 
  "Book", "Film", "Plane", "Gamepad2", "Shirt", "Smile", "Gift", "CreditCard", 
  "Banknote", "Dog", "TrendingUp", "AlertTriangle", "Smartphone"
]

const IconRenderer = ({ iconName }: { iconName?: string | null }) => {
  if (!iconName) return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  const Icon = (LucideIcons as any)[iconName]
  if (!Icon) return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  return <Icon className="h-4 w-4" />
}

export function SettingsDialog({ trigger }: { trigger?: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"categories" | "status" | "expenseTypes">("categories")
  
  const [expenseTypes, setExpenseTypes] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [statuses, setStatuses] = useState<any[]>([])
  
  const [newCategory, setNewCategory] = useState({ name: "", icon: "HelpCircle" })
  const [newExpenseType, setNewExpenseType] = useState({ name: "", categoryId: "", isActive: true })
  const [newStatus, setNewStatus] = useState("")

  const fetchData = async () => {
    const [types, stats, cats] = await Promise.all([getExpenseTypes(), getStatuses(), getCategories()])
    setExpenseTypes(types)
    setStatuses(stats)
    setCategories(cats)
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name) {
      toast.error("Nome da categoria é obrigatório")
      return
    }
    const res = await createCategory(newCategory)
    if (res.success) {
      setNewCategory({ name: "", icon: "HelpCircle" })
      fetchData()
      toast.success("Categoria criada com sucesso")
    } else {
      toast.error(res.error || "Erro ao criar categoria")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    const res = await deleteCategory(id)
    if (res.success) {
      fetchData()
      toast.success("Categoria excluída")
    } else {
      toast.error(res.error || "Erro ao excluir categoria")
    }
  }

  const handleCreateExpenseType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpenseType.name || !newExpenseType.categoryId) {
      toast.error("Nome e Categoria são obrigatórios")
      return
    }
    const res = await createExpenseType({
      name: newExpenseType.name,
      categoryId: parseInt(newExpenseType.categoryId),
      isActive: newExpenseType.isActive
    })
    if (res.success) {
      setNewExpenseType({ name: "", categoryId: "", isActive: true })
      fetchData()
      toast.success("Tipo de despesa criado com sucesso")
    } else {
      toast.error(res.error || "Erro ao criar tipo de despesa")
    }
  }

  const handleDeleteExpenseType = async (id: number) => {
    const res = await deleteExpenseType(id)
    if (res.success) {
      fetchData()
      toast.success("Tipo de despesa excluído")
    } else {
      toast.error(res.error || "Erro ao excluir tipo de despesa")
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const res = await updateExpenseTypeStatus(id, !currentStatus)
    if (res.success) {
      fetchData()
    } else {
      toast.error(res.error || "Erro ao atualizar status")
    }
  }

  const handleCreateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStatus) return
    const res = await createStatus(newStatus)
    if (res.success) {
      setNewStatus("")
      fetchData()
      toast.success("Status criado com sucesso")
    } else {
      toast.error(res.error || "Erro ao criar status")
    }
  }

  const handleDeleteStatus = async (id: number) => {
    const res = await deleteStatus(id)
    if (res.success) {
      fetchData()
      toast.success("Status excluído")
    } else {
      toast.error(res.error || "Erro ao excluir status")
    }
  }

  const groupedExpenseTypes = expenseTypes.reduce((acc: any, curr) => {
    const categoryName = curr.categoryRef?.name || "Sem Categoria"
    if (!acc[categoryName]) acc[categoryName] = []
    acc[categoryName].push(curr)
    return acc
  }, {})

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          trigger || (
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          )
        }
      />
      <DialogContent className="max-w-[425px] sm:max-w-5xl h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Configurações</DialogTitle>
        <DialogDescription className="sr-only">
          Gerencie categorias, status e tipos de despesa.
        </DialogDescription>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </h2>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              <button
                onClick={() => setActiveTab("categories")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "categories" 
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Tag className="h-4 w-4" />
                Categorias
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "status"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <ListChecks className="h-4 w-4" />
                Status
              </button>
              <button
                onClick={() => setActiveTab("expenseTypes")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "expenseTypes" 
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Layers className="h-4 w-4" />
                Tipos de Despesa
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "categories" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Categorias</h2>
                  <p className="text-sm text-muted-foreground">Gerencie as categorias principais de suas despesas.</p>
                </div>
                
                <form onSubmit={handleCreateCategory} className="space-y-4 max-w-md pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Nome</Label>
                      <Input 
                        id="category-name" 
                        value={newCategory.name} 
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        placeholder="Ex: Alimentação"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-icon">Ícone</Label>
                      <Select 
                        value={newCategory.icon} 
                        onValueChange={(value) => value && setNewCategory({...newCategory, icon: value})}
                      >
                        <SelectTrigger id="category-icon">
                          <div className="flex items-center gap-2">
                            <IconRenderer iconName={newCategory.icon} />
                            <SelectValue>{newCategory.icon || "Ícone"}</SelectValue>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <div className="grid grid-cols-6 gap-1 p-2">
                            {AVAILABLE_ICONS.map((icon) => (
                              <SelectItem key={icon} value={icon} className="flex items-center justify-center p-2 cursor-pointer hover:bg-accent rounded-md [&>span:last-child]:pr-0">
                                <IconRenderer iconName={icon} />
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Criar Categoria
                  </Button>
                </form>

                <div className="border rounded-md divide-y max-w-2xl">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-full">
                          <IconRenderer iconName={cat.icon} />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <Button 
                        variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={cat._count.types > 0}
                        title={cat._count.types > 0 ? "Não é possível excluir: existem tipos vinculados" : "Excluir"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">Nenhuma categoria cadastrada.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "status" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Status</h2>
                  <p className="text-sm text-muted-foreground">Defina os estados possíveis para suas despesas.</p>
                </div>

                <form onSubmit={handleCreateStatus} className="space-y-4 max-w-md pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="status-name">Nome do Status</Label>
                    <Input 
                      id="status-name" 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)}
                      placeholder="Ex: Pago, Pendente"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Cadastrar Status
                  </Button>
                </form>

                <div className="border rounded-md divide-y max-w-2xl">
                  {statuses.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <span className="font-medium">{item.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteStatus(item.id)}
                        disabled={item._count.expenses > 0}
                        title={item._count.expenses > 0 ? "Não é possível excluir: existem despesas atreladas" : "Excluir"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {statuses.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">Nenhum status cadastrado.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "expenseTypes" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Tipos de Despesa</h2>
                  <p className="text-sm text-zinc-500">Especifique os tipos de gastos dentro de cada categoria.</p>
                </div>

                <form onSubmit={handleCreateExpenseType} className="space-y-4 max-w-md pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-name">Nome da Despesa</Label>
                    <Input 
                      id="expense-name" 
                      value={newExpenseType.name} 
                      onChange={(e) => setNewExpenseType({...newExpenseType, name: e.target.value})}
                      placeholder="Ex: Aluguel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expense-category">Categoria</Label>
                    <Select 
                      value={newExpenseType.categoryId} 
                      onValueChange={(value) => value && setNewExpenseType({...newExpenseType, categoryId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {categories.find(c => c.id.toString() === newExpenseType.categoryId)?.name || "Selecione uma categoria"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <IconRenderer iconName={cat.icon} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Cadastrar Tipo
                  </Button>
                </form>

                <div className="space-y-6 max-w-2xl">
                  {Object.entries(groupedExpenseTypes).map(([categoryName, items]: [string, any]) => (
                    <div key={categoryName} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2 px-1">
                        <IconRenderer iconName={items[0]?.categoryRef?.icon} />
                        {categoryName}
                      </h4>
                      <div className="border rounded-md divide-y bg-white">
                        {items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                              <Switch 
                                checked={item.isActive} 
                                onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                              />
                              <span className={cn("font-medium", !item.isActive && "text-zinc-400 line-through")}>
                                {item.name}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteExpenseType(item.id)}
                              disabled={item._count.expenses > 0}
                              title={item._count.expenses > 0 ? "Não é possível excluir: existem despesas atreladas" : "Excluir"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(groupedExpenseTypes).length === 0 && (
                    <div className="p-8 text-center text-zinc-500 border rounded-md">Nenhum tipo cadastrado.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
