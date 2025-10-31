"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, X, Download, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PDFViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string
  title: string
}

export function PDFViewer({ open, onOpenChange, pdfUrl, title }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Reset loading state quando o dialog abre
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setError(false)
    }
  }, [open])

  const handleLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError(true)
    toast.error("Erro ao carregar o PDF")
  }

  const handleDownload = () => {
    // Cria um link temporário para download
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Download iniciado")
  }

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank')
    toast.success("PDF aberto em nova aba")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-900 to-gray-900">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-blue-100">Visualizador de PDF</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenNewTab}
              className="bg-white/10 hover:bg-white/20 text-white h-9 px-4 backdrop-blur-sm"
              title="Abrir em nova aba"
            >
              <FileText className="h-4 w-4 mr-2" />
              Nova Aba
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 text-white h-9 px-4 backdrop-blur-sm"
              title="Baixar PDF"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="hover:bg-white/10 text-white h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content área */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <Loader2 className="h-20 w-20 animate-spin text-blue-600 absolute -top-2 -left-2" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-gray-900">Carregando documento...</p>
                  <p className="text-sm text-gray-500 mt-1">Aguarde um momento</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 z-10">
              <div className="flex flex-col items-center gap-4 text-center p-8 max-w-md">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar PDF</h3>
                  <p className="text-base text-gray-600">
                    Não foi possível carregar o documento. Verifique se o arquivo existe e tente novamente.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setError(false)
                      setIsLoading(true)
                    }}
                    className="h-10"
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                    Tentar Novamente
                  </Button>
                  <Button
                    onClick={handleOpenNewTab}
                    className="h-10 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Abrir em Nova Aba
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!error && (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title={title}
            />
          )}
        </div>

        {/* Footer com dica */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            💡 <span className="font-semibold text-gray-300">Dica:</span> Use os controles do visualizador PDF para navegar, ampliar ou imprimir o documento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
