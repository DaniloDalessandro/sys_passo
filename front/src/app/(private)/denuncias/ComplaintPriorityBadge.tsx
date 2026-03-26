import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplaintPriorityBadgeProps {
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  className?: string;
}

export function ComplaintPriorityBadge({ priority, className }: ComplaintPriorityBadgeProps) {
  const priorityConfig = {
    baixa: {
      label: 'Baixa',
      className: 'bg-gray-400 hover:bg-gray-500 text-white',
    },
    media: {
      label: 'Média',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    alta: {
      label: 'Alta',
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    urgente: {
      label: 'Urgente',
      className: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const config = priorityConfig[priority] || priorityConfig.baixa;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
