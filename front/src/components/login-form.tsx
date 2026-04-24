"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuthContext } from "@/contexts/AuthContext"
import { buildApiUrl } from "@/lib/api-client"

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
      const normalizedEmail = email.trim()
      const response = await fetch(buildApiUrl("/api/auth/login/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: normalizedEmail, email: normalizedEmail, password }),
      })

      const data = await response.json()

      if (response.ok) {
        login({
          user: data.user,
        })
        router.push("/dashboard")
      } else {
        const errorMessage =
          data?.detail || data?.non_field_errors?.[0] || "Credenciais inválidas"
        setError(errorMessage)
      }
    } catch {
      setError("Erro de conexão com o servidor. Tente novamente mais tarde.")
    }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setForgotPasswordError("")
    setForgotPasswordSuccess("")
    setIsSubmittingForgotPassword(true)

    try {
      const response = await fetch(buildApiUrl("/api/auth/password/reset/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setForgotPasswordSuccess(
          data.message || "Instruções de recuperação de senha foram enviadas para seu email."
        )
        setForgotPasswordEmail("")

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
    } catch {
      setForgotPasswordError("Erro de conexão com o servidor. Tente novamente mais tarde.")
    } finally {
      setIsSubmittingForgotPassword(false)
    }
  }

  return (
    <div className={cn("space-y-8", className)} {...props}>
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="mx-auto w-20 h-20 sidebar-logo-gradient rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 animate-float">
          <Car className="w-10 h-10 text-white" />
        </div>
        <div className="animate-fade-in-up animate-delay-150">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">
            ViaLumiar
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">
            Sistema de Gestão
          </p>
        </div>
      </div>

      <Card className="shadow-2xl rounded-2xl border-border animate-fade-in-up animate-delay-225">
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-destructive mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-destructive text-sm">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="animate-fade-in-up animate-delay-300">
                <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-muted border-input rounded-lg transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="animate-fade-in-up animate-delay-400">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
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
                  className="w-full h-12 px-4 bg-muted border-input rounded-lg transition-colors text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="animate-fade-in-up animate-delay-500">
              <Button
                type="submit"
                className="w-full sidebar-logo-gradient text-white border-0 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                size="xl"
              >
                Acessar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground text-sm animate-fade-in-up animate-delay-600">
        <p>© 2024 ViaLumiar. Todos os direitos reservados.</p>
      </div>

      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <svg
                className="w-6 h-6 text-primary"
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
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-destructive mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-destructive text-sm">{forgotPasswordError}</span>
                </div>
              </div>
            )}

            {forgotPasswordSuccess && (
              <div className="bg-success/10 dark:bg-success/15 border-l-4 border-success p-4 rounded-md">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-success mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-success text-sm">{forgotPasswordSuccess}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="forgotPasswordEmail"
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full h-12 px-4 bg-muted border-input rounded-lg transition-colors text-foreground placeholder:text-muted-foreground"
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
                className="flex-1"
                size="xl"
                disabled={isSubmittingForgotPassword}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                size="xl"
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
