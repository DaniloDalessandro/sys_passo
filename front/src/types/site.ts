/**
 * TypeScript type definitions for Site Configuration
 * Matches backend SiteConfiguration model from Django
 */

export interface SiteConfiguration {
  id: number;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  logo: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteConfigAPIResponse {
  success: boolean;
  data: SiteConfiguration;
  message?: string;
}

export interface SiteConfigUpdatePayload {
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  hero_title?: string;
  hero_subtitle?: string;
  about_text?: string;
}

export interface SiteConfigErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
