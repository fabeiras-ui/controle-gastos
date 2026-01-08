"use client"

import { signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await signOut({ redirect: false })
      router.push("/")
    }
    performLogout()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Deslogando...</p>
    </div>
  )
}
