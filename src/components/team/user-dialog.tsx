"use client"

import { useState, useRef, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, ShieldCheck, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface UserDialogProps {
  onUserAdded: () => void
  trigger?: React.ReactElement
  user?: {
    id: number
    nickname: string
    name: string | null
    email: string
  }
}

export function UserDialog({ onUserAdded, trigger, user }: UserDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    nickname: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (user && open) {
      setFormData({
        nickname: user.nickname,
        name: user.name || "",
        email: user.email,
        password: "",
        confirmPassword: "",
      })
    } else if (!user && open) {
      setFormData({
        nickname: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [user, open])

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const passwordStrength = calculatePasswordStrength(formData.password)
  const strengthLabels = ["Muito fraca", "Fraca", "Média", "Forte", "Muito forte"]
  const strengthColors = [
    "bg-destructive",
    "bg-destructive",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (!user && formData.password.length === 0) {
      toast.error("A senha é obrigatória para novos usuários")
      return
    }

    if (formData.password.length > 0 && passwordStrength < 3) {
      toast.error("A senha deve ser mais forte")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: user ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          nickname: formData.nickname,
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Erro ao ${user ? "atualizar" : "cadastrar"} usuário`)
      }

      toast.success(`Usuário ${user ? "atualizado" : "cadastrado"} com sucesso!`)
      
      // Se for o próprio usuário sendo editado, disparar evento para atualizar a sidebar
      window.dispatchEvent(new Event('user-updated'))

      setOpen(false)
      onUserAdded()
        if (!user) {
          setFormData({
            nickname: "",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          })
        }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger || <Button>Novo Usuário</Button>}
      />
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Cadastrar Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user 
              ? "Atualize os dados do usuário selecionado abaixo." 
              : "Preencha os dados abaixo para criar um novo usuário no sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
                placeholder="Ex: joaosilva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João da Silva"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha {user && "(deixe em branco para manter)"}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar {user && "Senha"}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required={!user && formData.password.length > 0}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Força da senha: {strengthLabels[passwordStrength]}</span>
              {passwordStrength >= 3 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <ShieldCheck size={12} /> Segura
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1">
                  <ShieldAlert size={12} /> Fraca
                </span>
              )}
            </div>
            <Progress value={(passwordStrength / 4) * 100} className={`h-1 ${strengthColors[passwordStrength]}`} />
            <ul className="text-[10px] text-muted-foreground grid grid-cols-2 gap-x-2">
              <li className={formData.password.length >= 8 ? "text-green-600" : ""}>• Mínimo 8 caracteres</li>
              <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>• Letra maiúscula</li>
              <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>• Pelo menos um número</li>
              <li className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-600" : ""}>• Caractere especial</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? (user ? "Atualizando..." : "Cadastrando...") 
                : (user ? "Salvar Alterações" : "Cadastrar Usuário")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
