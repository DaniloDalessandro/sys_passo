import { cn } from "@/lib/utils"

interface CarEmojiProps {
  className?: string
}

export function CarEmoji({ className }: CarEmojiProps) {
  return (
    <span className={cn("text-blue-700", className)}>
      🚗
    </span>
  )
}

// Mantendo compatibilidade com nome antigo
export function AnchorEmoji({ className }: CarEmojiProps) {
  return <CarEmoji className={className} />
}