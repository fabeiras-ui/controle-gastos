"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado")
      }

      router.push("/?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Lado Esquerdo - Formulário */}
        <div className="flex flex-col space-y-8 px-4 md:px-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-black rounded-sm flex items-center justify-center">
               <div className="w-4 h-4 bg-white transform rotate-45"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight">Vault</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight">Criar uma conta.</h1>
            <p className="text-muted-foreground">Junte-se a nós para gerenciar seus gastos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">Apelido</Label>
              <Input
                id="nickname"
                placeholder="Digite seu apelido"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12"
            >
              {loading ? "Criando conta..." : "Cadastrar"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Já possui uma conta?{" "}
            <Link href="/" className="font-semibold underline">
              Entrar
            </Link>
          </div>
        </div>

        {/* Lado Direito - Imagem de Fundo */}
        <div 
          className="hidden md:flex h-full min-h-[600px] relative rounded-3xl overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://img.freepik.com/free-photo/young-happy-freelance-worker-using-mobile-phone-reading-text-message-while-working-office_637285-6493.jpg?t=st=1767805919~exp=1767809519~hmac=ff8db17cb7a7a099000056dafb95290353aa918912e6df690a198834329a8db9&w=2000')" }}
        >
           <div className="absolute inset-0 bg-black/20" />
           <div className="absolute inset-0 flex items-center justify-center p-8">

           </div>
        </div>
      </div>
    </div>
  )
}
