"use client"

import { signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    signOut({ callbackUrl: "/" })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Deslogando...</p>
    </div>
  )
}
