export interface Conductor {
  id?: number;
  name: string;
  cpf: string;
  birth_date: string;
  gender: "M" | "F" | "O";
  nationality: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  reference_point?: string;
  phone: string;
  email: string;
  whatsapp?: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  document?: File | string;
  cnh_digital?: File | string;
  photo?: File | string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}
