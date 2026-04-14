export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return cpf;

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

export function formatPlate(plate: string): string {
  if (!plate) return '';

  const cleaned = plate.replace(/\s/g, '').toUpperCase();

  if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return cleaned.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }

  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  return plate.toUpperCase();
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function getRelativeTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return dateString;

  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'agora';
  } else if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays < 30) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return formatDate(dateString);
  }
}

export function formatCNHCategory(category: string): string {
  if (!category) return '';
  return category.toUpperCase();
}
