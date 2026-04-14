"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/AuthContext"

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthContext()

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router, isAuthenticated, isLoading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-100 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
