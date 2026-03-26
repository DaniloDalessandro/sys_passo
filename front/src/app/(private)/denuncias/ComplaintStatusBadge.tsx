import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplaintStatusBadgeProps {
  status: 'proposto' | 'em_analise' | 'concluido';
  className?: string;
}

export function ComplaintStatusBadge({ status, className }: ComplaintStatusBadgeProps) {
  const statusConfig = {
    proposto: {
      label: 'Proposto',
      className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
    em_analise: {
      label: 'Em Análise',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    concluido: {
      label: 'Concluído',
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
  };

  const config = statusConfig[status] || statusConfig.proposto;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
