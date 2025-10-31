"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                title="Baixar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center gap-2 text-center p-6">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Erro ao carregar PDF</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Não foi possível carregar o documento. Verifique se o arquivo existe e tente novamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(false)
                    setIsLoading(true)
                  }}
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {!error && (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              onLoad={handleLoad}
              onError={handleError}
              title={title}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
