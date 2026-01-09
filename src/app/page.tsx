"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError("Email ou senha inválidos")
    } else {
      window.location.href = "/dashboard"
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" })
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
            <h1 className="text-4xl font-semibold tracking-tight">Bem vindo de volta</h1>
            <p className="text-muted-foreground">Por favor, insira suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Usuário</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
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

            <div className="text-sm">
              <Link href="#" className="font-medium underline">
	              Esqueceu sua senha?
              </Link>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-12">
              Conectar
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Ou faça login com</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="h-12"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="text-center text-sm">
            Você é novo no Vault?{" "}
            <Link href="/register" className="font-semibold underline">
              Cadastre-se aqui
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
