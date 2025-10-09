"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthContext } from "@/context/AuthContext"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("")
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuthContext()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    try {
      console.log("Tentando fazer login com:", { username: email, password: "***" })

      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        login({
          access: data.access,
          refresh: data.refresh,
          user: data.user,
        })
        console.log("Login successful, redirecting...")
        router.push("/dashboard")
      } else {
        const errorMessage =
          data?.detail || data?.non_field_errors?.[0] || "Credenciais inválidas"
        setError(errorMessage)
      }
    } catch (err) {
      console.error("Erro no login:", err)
      setError("Erro de conexão com o servidor. Tente novamente mais tarde.")
    }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setForgotPasswordError("")
    setForgotPasswordSuccess("")
    setIsSubmittingForgotPassword(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
      const response = await fetch(`${API_URL}/api/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordSuccess(
          data.message || "Instruções de recuperação de senha foram enviadas para seu email."
        )
        setForgotPasswordEmail("")

        // Fechar o modal após 3 segundos
        setTimeout(() => {
          setIsForgotPasswordOpen(false)
          setForgotPasswordSuccess("")
        }, 3000)
      } else {
        const errorMessage =
          data?.detail ||
          data?.email?.[0] ||
          "Erro ao enviar email de recuperação. Verifique o endereço informado."
        setForgotPasswordError(errorMessage)
      }
    } catch (err) {
      console.error("Erro ao solicitar recuperação de senha:", err)
      setForgotPasswordError("Erro de conexão com o servidor. Tente novamente mais tarde.")
    } finally {
      setIsSubmittingForgotPassword(false)
    }
  }

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Header com ícone de carro */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.7 10H17M5 17H3c-.6 0-1-.4-1-1v-3c0-.9.7-1.7 1.5-1.9L5.3 10H7" />
            <path d="M5 17a2 2 0 1 0 4 0m10 0a2 2 0 1 0 4 0" />
            <path d="M3 12h18" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            ViaLumiar
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Sistema de Gestão
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="bg-white shadow-2xl rounded-2xl border-0">
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-gray-100 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Acessar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>© 2024 ViaLumiar. Todos os direitos reservados.</p>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <svg
                className="w-6 h-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Recuperar Senha
            </DialogTitle>
            <DialogDescription>
              Digite seu email e enviaremos instruções para recuperar sua senha.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-6 mt-4">
            {forgotPasswordError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-800 text-sm">{forgotPasswordError}</span>
                </div>
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-800 text-sm">{forgotPasswordSuccess}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="forgotPasswordEmail"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmittingForgotPassword}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsForgotPasswordOpen(false)
                  setForgotPasswordEmail("")
                  setForgotPasswordError("")
                  setForgotPasswordSuccess("")
                }}
                className="flex-1 h-12"
                disabled={isSubmittingForgotPassword}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isSubmittingForgotPassword}
              >
                {isSubmittingForgotPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
