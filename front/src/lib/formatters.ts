/**
 * Format CPF with mask: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  // Remove non-digits
  const cleaned = cpf.replace(/\D/g, '');

  // Apply mask
  if (cleaned.length !== 11) return cpf;

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format phone with mask: (00) 00000-0000 or (00) 0000-0000
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Apply mask based on length
  if (cleaned.length === 11) {
    // Mobile: (00) 00000-0000
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    // Landline: (00) 0000-0000
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}

/**
 * Format vehicle plate with mask: AAA-0000 or AAA0A00 (Mercosul)
 */
export function formatPlate(plate: string): string {
  if (!plate) return '';

  // Remove spaces and convert to uppercase
  const cleaned = plate.replace(/\s/g, '').toUpperCase();

  // Old format: AAA-0000
  if (/^[A-Z]{3}\d{4}$/.test(cleaned)) {
    return cleaned.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }

  // Mercosul format: AAA0A00
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  return plate.toUpperCase();
}

/**
 * Format date to Brazilian format: DD/MM/YYYY HH:mm
 */
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

/**
 * Format date to Brazilian format: DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Get relative time from now (e.g., "há 2 dias", "há 3 horas")
 */
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

/**
 * Format CNH category
 */
export function formatCNHCategory(category: string): string {
  if (!category) return '';
  return category.toUpperCase();
}
