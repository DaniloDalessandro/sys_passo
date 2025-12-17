'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Truck,
  Users,
  Shield,
  BarChart3,
  User,
  Car,
  Menu,
  X,
  LogIn,
  FileText,
  Hash,
  Calendar,
  Palette,
  Fuel,
  AlertTriangle,
  TrendingUp,
  Activity,
  Camera,
  Settings,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { buildApiUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LICENSE_CATEGORIES } from '@/constants/license-categories';
import { ConductorForm } from '@/components/conductors/conductor-form';
import { VehicleForm } from '@/components/vehicles/vehicle-form';

// Types for site configuration
interface SiteConfig {
  company_name: string;
  logo_url?: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
}

// Helper functions
const formatWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Authenticated fetch helper (for client-side authenticated API calls)
const fetchWithAuth = async (pathOrUrl: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('access_token');
  const url = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : buildApiUrl(pathOrUrl);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  return response;
};

// Helper function to validate CPF
const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length !== 11 || /^(\d)\1+$/.test(numbers)) return false;
  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(numbers.substring(10, 11));
};

// Helper function to validate age (minimum 18 years)
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

// Zod validation schemas
const complaintSchema = z.object({
  vehiclePlate: z.string()
    .min(7, 'Placa deve ter pelo menos 7 caracteres')
    .max(10, 'Placa deve ter no máximo 10 caracteres')
    .toUpperCase(),
  complaintType: z.string().min(1, 'Selecione o tipo de denúncia'),
  description: z.string()
    .min(20, 'A descrição deve ter pelo menos 20 caracteres')
    .max(1000, 'A descrição deve ter no máximo 1000 caracteres'),
  occurrenceDate: z.string().optional(),
  occurrenceLocation: z.string().optional(),
  complainantName: z.string().optional(),
  complainantEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  complainantPhone: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, label }: { end: number; duration?: number; label: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <div ref={counterRef}>
      {count.toLocaleString('pt-BR')}
      {label && <div className="text-xl text-blue-100">{label}</div>}
    </div>
  );
}

export default function SiteHomePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [isCheckComplaintDialogOpen, setIsCheckComplaintDialogOpen] = useState(false);
  const [isVehicleSearchDialogOpen, setIsVehicleSearchDialogOpen] = useState(false);
  const [plateOptions, setPlateOptions] = useState<Array<{plate: string, label: string}>>([]);
  const [isLoadingPlates, setIsLoadingPlates] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [conductorCount, setConductorCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [searchPlate, setSearchPlate] = useState('');
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [plateSuggestions, setPlateSuggestions] = useState<Array<{plate: string, brand: string, model: string}>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [complaintPlateSuggestions, setComplaintPlateSuggestions] = useState<Array<{plate: string, brand: string, model: string}>>([]);
  const [isLoadingComplaintSuggestions, setIsLoadingComplaintSuggestions] = useState(false);
  const [showComplaintSuggestions, setShowComplaintSuggestions] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [checkProtocol, setCheckProtocol] = useState('');
  const [complaintData, setComplaintData] = useState<any>(null);
  const [isCheckingComplaint, setIsCheckingComplaint] = useState(false);
  const [checkComplaintError, setCheckComplaintError] = useState('');
  const [driverProtocolNumber, setDriverProtocolNumber] = useState<number | null>(null);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [vehicleProtocolNumber, setVehicleProtocolNumber] = useState<number | null>(null);
  const [isVehicleProtocolModalOpen, setIsVehicleProtocolModalOpen] = useState(false);
  const [complaintProtocolNumber, setComplaintProtocolNumber] = useState<number | null>(null);
  const [isComplaintProtocolModalOpen, setIsComplaintProtocolModalOpen] = useState(false);

  // Complaint form
  const complaintForm = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      vehiclePlate: '',
      complaintType: '',
      description: '',
      occurrenceDate: '',
      occurrenceLocation: '',
      complainantName: '',
      complainantEmail: '',
      complainantPhone: '',
    },
  });

  // Fetch site configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(buildApiUrl('api/site/configuration/'));
        if (response.ok) {
          const result = await response.json();
          const data = result.success ? result.data : result;
          setConfig(data);
        }
      } catch (error) {
        console.error('Error fetching site config:', error);
        // Set default config if API fails
        setConfig({
          company_name: 'Sys Passo',
          hero_title: 'Gestão Inteligente de Frotas',
          hero_subtitle: 'Controle completo da sua frota com tecnologia de ponta',
          about_text: 'Sistema de gestão de frotas e veículos',
          phone: '(00) 00000-0000',
          email: 'contato@syspasso.com',
          address: 'Endereço da empresa',
          whatsapp: '00000000000',
        });
      }
    };

    fetchConfig();
  }, []);

  // Fetch vehicle and conductor counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Try to fetch counts with authentication (will work if user is logged in)
        // If not authenticated, these will gracefully fail and show 0
        try {
          const vehiclesResponse = await fetchWithAuth('api/vehicles/');
          if (vehiclesResponse.ok) {
            const vehiclesData = await vehiclesResponse.json();
            const count = vehiclesData.count || vehiclesData.length || 0;
            setVehicleCount(count);
          }
        } catch (error) {
          console.log('Could not fetch vehicle count (may require authentication)');
        }

        try {
          const conductorsResponse = await fetchWithAuth('api/conductors/');
          if (conductorsResponse.ok) {
            const conductorsData = await conductorsResponse.json();
            const count = conductorsData.count || conductorsData.length || 0;
            setConductorCount(count);
          }
        } catch (error) {
          console.log('Could not fetch conductor count (may require authentication)');
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced plate search for autocomplete
  useEffect(() => {
    // Only search if there are at least 2 characters
    if (searchPlate.length < 2) {
      setPlateSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      try {
        const url = buildApiUrl(`api/vehicles/search-by-plate/?search=${encodeURIComponent(searchPlate)}`);

        // Use the new public endpoint for plate search
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();

          // The response is already in the correct format: [{plate, brand, model}]
          setPlateSuggestions(data || []);
        } else {
          setPlateSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching plate suggestions:', error);
        setPlateSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      setIsLoadingSuggestions(false);
    };
  }, [searchPlate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside the search input and suggestions dropdown
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Debounced plate search for complaint form autocomplete
  useEffect(() => {
    const complaintPlate = complaintForm.watch('vehiclePlate');

    // Only search if there are at least 2 characters
    if (!complaintPlate || complaintPlate.length < 2) {
      setComplaintPlateSuggestions([]);
      setIsLoadingComplaintSuggestions(false);
      return;
    }

    setIsLoadingComplaintSuggestions(true);

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      try {
        const url = buildApiUrl(`api/vehicles/search-by-plate/?search=${encodeURIComponent(complaintPlate)}`);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setComplaintPlateSuggestions(data || []);
        } else {
          setComplaintPlateSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching complaint plate suggestions:', error);
        setComplaintPlateSuggestions([]);
      } finally {
        setIsLoadingComplaintSuggestions(false);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      setIsLoadingComplaintSuggestions(false);
    };
  }, [complaintForm.watch('vehiclePlate')]);

  // Close complaint suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.complaint-plate-container')) {
        setShowComplaintSuggestions(false);
      }
    };

    if (showComplaintSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showComplaintSuggestions]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Handle plate selection from autocomplete
  const handleSelectPlate = async (plate: string) => {
    setShowSuggestions(false);
    setIsSearchingVehicle(true);
    setSearchError('');
    setVehicleData(null);

    try {
      const response = await fetch(buildApiUrl(`api/vehicles/plate/${plate}/`));

      if (!response.ok) {
        if (response.status === 404) {
          setSearchError('Veículo não encontrado');
          toast.error('Veículo não encontrado');
        } else {
          setSearchError('Erro ao consultar veículo');
          toast.error('Erro ao consultar veículo');
        }
        return;
      }

      const data = await response.json();
      setVehicleData(data);
      setSearchPlate('');
      toast.success('Veículo encontrado!');

      // Scroll to vehicle data section
      setTimeout(() => {
        const vehicleSection = document.getElementById('vehicle-result-section');
        if (vehicleSection) {
          vehicleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (error) {
      setSearchError('Erro ao conectar com o servidor');
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSearchingVehicle(false);
    }
  };

  // Driver form submission
  const onDriverSubmit = async (data: any) => {
    const formData = new FormData();

    // Campos obrigatórios
    const requiredFields = ['name', 'cpf', 'birth_date', 'gender', 'nationality',
                           'street', 'number', 'neighborhood', 'city',
                           'phone', 'email', 'license_number', 'license_category', 'license_expiry_date'];

    // Campos opcionais
    const optionalFields = ['reference_point', 'whatsapp', 'document', 'cnh_digital', 'photo'];

    // Append campos obrigatórios
    requiredFields.forEach(key => {
      const value = data[key as keyof typeof data];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    // Append campos opcionais apenas se tiverem valor
    optionalFields.forEach(key => {
      const value = data[key as keyof typeof data];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value && value !== '') {
        formData.append(key, String(value));
      }
    });

    // Log para debug
    console.log('Dados do formulário:', data);
    console.log('FormData sendo enviado:', Array.from(formData.entries()));

    try {
      const response = await fetch(buildApiUrl('api/requests/drivers/'), {
        method: 'POST',
        body: formData,
        // Headers are not needed for FormData; browser sets them automatically
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do backend:', errorData);
        const errorMessage = Object.values(errorData).flat().join(' ') || 'Erro ao enviar solicitação.';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const protocolNumber = responseData.data?.id;

      if (protocolNumber) {
        setDriverProtocolNumber(protocolNumber);
        setIsDriverDialogOpen(false);
        setIsProtocolModalOpen(true);
      } else {
        toast.success('Solicitação enviada com sucesso!', {
          description: 'Sua solicitação de cadastro de motorista será analisada em breve.',
        });
        setIsDriverDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting driver request:', error);
      toast.error('Erro ao enviar solicitação', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  // Vehicle form submission
  const onVehicleSubmit = async (data: any) => {
    const formData = new FormData();

    // Mapeamento de campos português -> inglês
    const fieldMapping: Record<string, string> = {
      placa: 'plate',
      marca: 'brand',
      modelo: 'model',
      ano: 'year',
      cor: 'color',
      chassi: 'chassis_number',
      renavam: 'renavam',
      combustivel: 'fuel_type',
      categoria: 'category',
      capacidade: 'passenger_capacity',
    };

    // Mapeamento de valores de combustível português -> inglês
    const fuelTypeMapping: Record<string, string> = {
      'Diesel': 'diesel',
      'Gasolina': 'gasoline',
      'Etanol': 'ethanol',
      'Flex': 'flex',
      'GNV': 'hybrid',
    };

    // Adicionar campos básicos
    Object.entries(fieldMapping).forEach(([ptKey, enKey]) => {
      let value = data[ptKey];

      if (value !== undefined && value !== null && value !== '') {
        // Converter placa para maiúsculas
        if (ptKey === 'placa') {
          value = value.toUpperCase();
        }

        // Converter combustível para inglês
        if (ptKey === 'combustivel' && fuelTypeMapping[value]) {
          value = fuelTypeMapping[value];
        }

        formData.append(enKey, value.toString());
      }
    });

    // Fotos (opcionais)
    ['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'].forEach(photoKey => {
      const photo = data[photoKey];
      if (photo && photo instanceof File) {
        formData.append(photoKey, photo);
      }
    });

    console.log('Enviando dados:', Array.from(formData.entries()));

    try {
      const response = await fetch(buildApiUrl('api/requests/vehicles/'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro do servidor:', errorData);
        const errorMessage = errorData.detail || errorData.plate?.[0] || 'Erro ao enviar solicitação.';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const protocolNumber = responseData.data?.id;

      if (protocolNumber) {
        setVehicleProtocolNumber(protocolNumber);
        setIsVehicleDialogOpen(false);
        setIsVehicleProtocolModalOpen(true);
      } else {
        toast.success('Solicitação enviada com sucesso!', {
          description: 'Sua solicitação de cadastro de veículo será analisada em breve.',
        });
        setIsVehicleDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting vehicle request:', error);
      toast.error('Erro ao enviar solicitação', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  // Autocomplete de placas
  const searchPlates = async (query: string) => {
    if (query.length < 2) {
      setPlateOptions([]);
      return;
    }

    setIsLoadingPlates(true);
    try {
      const response = await fetch(buildApiUrl(`api/complaints/vehicles/autocomplete/?q=${encodeURIComponent(query)}`));

      if (response.ok) {
        const data = await response.json();
        setPlateOptions(data);
      }
    } catch (error) {
      console.error('Error searching plates:', error);
    } finally {
      setIsLoadingPlates(false);
    }
  };

  // Debounce para autocomplete
  const debouncedSearchPlates = useCallback((query: string) => {
    const timer = setTimeout(() => searchPlates(query), 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle photo upload
  const handlePhotoFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    const totalPhotos = selectedPhotos.length + imageFiles.length;
    if (totalPhotos > 5) {
      toast.error('Máximo de 5 fotos permitidas');
      return;
    }

    setSelectedPhotos(prev => [...prev, ...imageFiles.slice(0, 5 - prev.length)]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      handlePhotoFiles(e.dataTransfer.files);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Complaint form submission
  const onComplaintSubmit = async (data: ComplaintFormData) => {
    try {
      // Criar FormData para enviar com fotos
      const formData = new FormData();
      formData.append('vehicle_plate', data.vehiclePlate.toUpperCase());
      formData.append('complaint_type', data.complaintType);
      formData.append('description', data.description);

      if (data.occurrenceDate) formData.append('occurrence_date', data.occurrenceDate);
      if (data.occurrenceLocation) formData.append('occurrence_location', data.occurrenceLocation);
      if (data.complainantName) formData.append('complainant_name', data.complainantName);
      if (data.complainantEmail) formData.append('complainant_email', data.complainantEmail);
      if (data.complainantPhone) formData.append('complainant_phone', data.complainantPhone);

      // Adicionar fotos
      selectedPhotos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await fetch(buildApiUrl('api/complaints/'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 400) {
          const errorMessage = errorData.error ||
                             errorData.detail ||
                             errorData.vehicle_plate?.[0] ||
                             errorData.description?.[0] ||
                             'Erro na validação dos dados. Verifique as informações.';
          throw new Error(errorMessage);
        }

        throw new Error('Erro ao enviar denúncia. Tente novamente.');
      }

      const responseData = await response.json();
      const protocolNumber = responseData.complaint?.id;

      if (protocolNumber) {
        setComplaintProtocolNumber(protocolNumber);
        complaintForm.reset();
        setSelectedPhotos([]);
        setShowComplaintSuggestions(false);
        setComplaintPlateSuggestions([]);
        setIsComplaintDialogOpen(false);
        setIsComplaintProtocolModalOpen(true);
      } else {
        toast.success('Denúncia enviada com sucesso!', {
          description: 'Sua denúncia será analisada pela equipe responsável.',
        });
        complaintForm.reset();
        setSelectedPhotos([]);
        setShowComplaintSuggestions(false);
        setComplaintPlateSuggestions([]);
        setIsComplaintDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);

      toast.error('Erro ao enviar denúncia', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  const handleCheckComplaint = async () => {
    if (!checkProtocol.trim()) {
      setCheckComplaintError('Por favor, informe o número do protocolo.');
      return;
    }

    setIsCheckingComplaint(true);
    setCheckComplaintError('');
    setComplaintData(null);

    try {
      const response = await fetch(
        buildApiUrl(`api/complaints/check-by-protocol/?protocol=${encodeURIComponent(checkProtocol)}`),
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Usar mensagem detalhada do backend se disponível
        const errorMessage = errorData.message || errorData.error || 'Erro ao consultar protocolo';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setComplaintData(data);
      setCheckComplaintError('');
    } catch (error) {
      console.error('Error checking complaint:', error);
      setCheckComplaintError(error instanceof Error ? error.message : 'Erro ao consultar protocolo');
      setComplaintData(null);
    } finally {
      setIsCheckingComplaint(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Minimalista */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-md'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {config.logo_url ? (
                <Image
                  src={config.logo_url}
                  alt={config.company_name}
                  width={100}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              ) : (
                <span className="text-lg font-semibold text-gray-900">
                  {config.company_name}
                </span>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => scrollToSection('inicio')}
                className="relative text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
              >
                Início
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="relative text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
              >
                Sobre
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection('cadastro')}
                className="relative text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
              >
                Cadastros
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></span>
              </button>
              <button
                onClick={() => scrollToSection('denuncias')}
                className="relative text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
              >
                Denúncias
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></span>
              </button>
              <button
                onClick={() => {
                  const section = document.querySelector('section.py-20.bg-gradient-to-br.from-gray-50.to-white');
                  if (section) {
                    const offset = 80;
                    const elementPosition = section.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
                className="relative text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all group"
              >
                Contato
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-3/4 transition-all duration-300"></span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left text-sm px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left text-sm px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Sobre
                </button>
                <button
                  onClick={() => scrollToSection('cadastro')}
                  className="text-left text-sm px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Cadastros
                </button>
                <button
                  onClick={() => scrollToSection('denuncias')}
                  className="text-left text-sm px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Denúncias
                </button>
                <button
                  onClick={() => {
                    const section = document.querySelector('section.py-20.bg-gradient-to-br.from-gray-50.to-white');
                    if (section) {
                      const offset = 80;
                      const elementPosition = section.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth',
                      });
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-sm px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Contato
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-[75vh] bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-12 overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-200/15 to-purple-200/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

          {/* Animated gradient mesh overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-shift"></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 animate-float-icon-1">
            <Users className="w-12 h-12 text-blue-300/20" />
          </div>

          <div className="absolute bottom-1/4 right-1/4 animate-float-icon-2">
            <Shield className="w-10 h-10 text-purple-300/20" />
          </div>

          <div className="absolute top-2/3 left-1/3 animate-float-icon-3" style={{ animationDelay: '2s' }}>
            <Activity className="w-10 h-10 text-indigo-300/20" />
          </div>

          <div className="absolute top-1/4 right-1/3 animate-float-icon-1" style={{ animationDelay: '1s' }}>
            <Car className="w-16 h-16 text-blue-300/10" />
          </div>

          <div className="absolute bottom-1/3 left-1/2 animate-float-icon-2" style={{ animationDelay: '3s' }}>
            <Car className="w-10 h-10 text-purple-300/10" />
          </div>

          <div className="absolute top-1/2 right-1/2 animate-float-icon-3" style={{ animationDelay: '4s' }}>
            <Car className="w-12 h-12 text-indigo-300/10" />
          </div>

          <div className="absolute bottom-1/2 left-1/4 animate-float-icon-1" style={{ animationDelay: '5s' }}>
            <Car className="w-8 h-8 text-blue-300/10" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight animate-slide-up">
                {config.hero_title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {config.hero_subtitle}
              </p>
            </div>

            <div className="w-full max-w-2xl mx-auto pt-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative search-container">
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Digite a placa do veículo"
                    className="w-full pl-6 pr-6 py-5 text-lg text-gray-700 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-500 transition-all uppercase"
                    value={searchPlate}
                    onChange={(e) => {
                      setSearchPlate(e.target.value.toUpperCase());
                      if (e.target.value.length >= 2) {
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && plateSuggestions.length > 0) {
                        // Select first suggestion on Enter
                        const firstSuggestion = plateSuggestions[0];
                        handleSelectPlate(firstSuggestion.plate);
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (searchPlate.length >= 2 && plateSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {isLoadingSuggestions && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && plateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
                    {plateSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectPlate(suggestion.plate)}
                        className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b last:border-b-0 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{suggestion.plate}</div>
                            <div className="text-sm text-gray-600 mt-1">{suggestion.brand} {suggestion.model}</div>
                          </div>
                          <Car className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Animated Counters */}
            {!isLoadingCounts && (vehicleCount > 0 || conductorCount > 0) && (
              <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto pt-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                {vehicleCount > 0 && (
                  <div className="group relative text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>

                    {/* Rotating border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm animate-spin-slow"></div>

                    <div className="relative z-10">
                      <Car className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                      <div className="text-5xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform">
                        <AnimatedCounter end={vehicleCount} label="" />
                      </div>
                      <div className="text-sm font-medium text-gray-600">Veículos Cadastrados</div>
                    </div>
                  </div>
                )}
                {conductorCount > 0 && (
                  <div className="group relative text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* Animated background pulse */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>

                    {/* Rotating border effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm animate-spin-slow"></div>

                    <div className="relative z-10">
                      <Users className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                      <div className="text-5xl font-bold text-gray-800 mb-2 group-hover:scale-110 transition-transform">
                        <AnimatedCounter end={conductorCount} label="" />
                      </div>
                      <div className="text-sm font-medium text-gray-600">Motoristas Ativos</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Search Result Section */}
            {vehicleData && (
              <div id="vehicle-result-section" className="w-full max-w-3xl mx-auto pt-12 animate-slide-up">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Car className="w-7 h-7" />
                        Informações do Veículo
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVehicleData(null)}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Placa</div>
                        <div className="text-2xl font-bold text-gray-900">{vehicleData.plate}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Marca</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.brand}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Modelo</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.model}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ano</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.year}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cor</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.color}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Combustível</div>
                        <div className="text-xl font-semibold text-gray-900">
                          {vehicleData.fuel_type === 'gasoline' ? 'Gasolina' :
                           vehicleData.fuel_type === 'ethanol' ? 'Etanol' :
                           vehicleData.fuel_type === 'flex' ? 'Flex' :
                           vehicleData.fuel_type === 'diesel' ? 'Diesel' :
                           vehicleData.fuel_type === 'electric' ? 'Elétrico' :
                           vehicleData.fuel_type === 'hybrid' ? 'Híbrido' : vehicleData.fuel_type}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoria</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.category}</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Capacidade</div>
                        <div className="text-xl font-semibold text-gray-900">{vehicleData.passenger_capacity} passageiros</div>
                      </div>
                    </div>

                    {/* Driver Information */}
                    {vehicleData.current_conductor ? (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                          <User className="w-6 h-6 text-purple-600" />
                          Motorista Atual
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Nome Completo</div>
                            <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.full_name}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">CPF</div>
                            <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.cpf}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">CNH</div>
                            <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.cnh_number}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Categoria CNH</div>
                            <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.cnh_category}</div>
                          </div>
                          {vehicleData.current_conductor.phone && (
                            <div>
                              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Telefone</div>
                              <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.phone}</div>
                            </div>
                          )}
                          {vehicleData.current_conductor.email && (
                            <div>
                              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">E-mail</div>
                              <div className="text-lg font-semibold text-gray-900">{vehicleData.current_conductor.email}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          <div>
                            <h3 className="font-semibold text-yellow-900 mb-1">Sem motorista vinculado</h3>
                            <p className="text-sm text-yellow-700">Este veículo não possui motorista cadastrado no momento.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float-main {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
          }
          33% {
            transform: translateY(-25px) translateX(8px) scale(1.015);
          }
          66% {
            transform: translateY(-15px) translateX(-5px) scale(1.008);
          }
        }

        @keyframes float-secondary {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) translateX(-10px) rotate(-1deg);
          }
        }

        @keyframes float-tertiary {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) translateX(12px) rotate(1deg);
          }
        }

        @keyframes float-icon-1 {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-22px) rotate(8deg) scale(1.1);
          }
        }

        @keyframes float-icon-2 {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-18px) rotate(-8deg) scale(1.08);
          }
        }

        @keyframes float-icon-3 {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-20px) rotate(5deg) scale(1.12);
          }
        }

        

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out backwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }

        .animate-float-main {
          animation: float-main 10s ease-in-out infinite;
        }

        .animate-float-secondary {
          animation: float-secondary 12s ease-in-out infinite;
        }

        .animate-float-tertiary {
          animation: float-tertiary 14s ease-in-out infinite 1s;
        }

        .animate-float-icon-1 {
          animation: float-icon-1 7s ease-in-out infinite;
        }

        .animate-float-icon-2 {
          animation: float-icon-2 8s ease-in-out infinite 0.5s;
        }

        .animate-float-icon-3 {
          animation: float-icon-3 9s ease-in-out infinite 1s;
        }

        

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>

      {/* About Section - Moderno (Logo após Hero) */}
      <section id="about" className="py-16 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Sobre Nós
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 hover:border-transparent transition-all duration-500">
                <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {config.about_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="cadastro" className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Cadastros
              </h2>
              <p className="text-lg text-gray-600">
                Solicite cadastro de motoristas e veículos de forma rápida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Registration Card */}
              <button
                onClick={() => setIsDriverDialogOpen(true)}
                className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 border-2 border-gray-200 hover:border-transparent rounded-3xl p-8 text-left transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 group-hover:bg-white/20 mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-300">
                    Cadastrar Motorista
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Solicite o cadastro de um novo condutor para sua frota
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-white transition-colors">
                    <span>Iniciar cadastro</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </button>

              {/* Vehicle Registration Card */}
              <button
                onClick={() => setIsVehicleDialogOpen(true)}
                className="group relative bg-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 border-2 border-gray-200 hover:border-transparent rounded-3xl p-8 text-left transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 group-hover:bg-white/20 mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Car className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors duration-300">
                    Cadastrar Veículo
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Adicione um novo veículo à sua frota de forma simples
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-purple-600 group-hover:text-white transition-colors">
                    <span>Iniciar cadastro</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Denúncias Section - Compacto */}
      <section id="denuncias" className="py-12 bg-gradient-to-br from-red-50 via-orange-50 to-white relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-48 h-48 bg-red-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-2xl mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Canal de Denúncias
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ajude a manter a segurança no trânsito
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 mb-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Como funciona?</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-red-600">1</span>
                  </div>
                  <p>Identifique a placa do veículo envolvido na situação irregular</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-red-600">2</span>
                  </div>
                  <p>Selecione o tipo de denúncia (excesso de velocidade, direção perigosa, etc.)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-red-600">3</span>
                  </div>
                  <p>Descreva detalhadamente o ocorrido (data, local e circunstâncias)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-red-600">4</span>
                  </div>
                  <p>Você pode fazer a denúncia de forma anônima ou identificada</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-900">
                  <strong>Importante:</strong> Todas as denúncias são analisadas pela equipe responsável.
                  Denúncias falsas podem ser enquadradas como crime de denunciação caluniosa.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsComplaintDialogOpen(true)}
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <AlertTriangle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Fazer Denúncia
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button
                onClick={() => setIsCheckComplaintDialogOpen(true)}
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Consultar Denúncia
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Completo e Expandido */}
      <section id="contato" className="py-14 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Entre em Contato
              </h2>
              <p className="text-lg text-gray-600">
                Estamos prontos para atender você
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Telefone */}
              <a
                href={`tel:${config.phone.replace(/\D/g, '')}`}
                className="group flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Telefone</div>
                  <div className="text-lg font-bold text-gray-900">{formatPhoneDisplay(config.phone)}</div>
                </div>
              </a>

              {/* E-mail */}
              <a
                href={`mailto:${config.email}`}
                className="group flex items-center gap-4 p-6 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-500 mb-1">E-mail</div>
                  <div className="text-lg font-bold text-gray-900 break-all">{config.email}</div>
                </div>
              </a>

              {/* Endereço */}
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white border border-gray-100">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Endereço</div>
                  <div className="text-lg font-bold text-gray-900">{config.address}</div>
                </div>
              </div>

              {/* WhatsApp */}
              <a
                href={formatWhatsAppLink(
                  config.whatsapp,
                  'Olá! Gostaria de saber mais sobre os serviços.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-green-100 mb-1">WhatsApp</div>
                  <div className="text-lg font-bold text-white">Iniciar conversa agora</div>
                </div>
                <span className="text-white text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Registration Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-blue-600" />
              Cadastro de Motorista
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para solicitar o cadastro de um novo motorista.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ConductorForm
              onSubmit={onDriverSubmit}
              showPhotoPreview={true}
              submitButtonText="Enviar Solicitação"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Registration Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Car className="w-6 h-6 text-blue-600" />
              Cadastro de Veículo
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para solicitar o cadastro de um novo veículo.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <VehicleForm
              onSubmit={onVehicleSubmit}
              showPhotoPreview={true}
              submitButtonText="Enviar Solicitação"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Complaint Dialog */}
      <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Fazer Denúncia
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para registrar sua denúncia. Todas as denúncias são analisadas pela equipe responsável.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)} className="space-y-6">
            {/* Placa do Veículo */}
            <div className="space-y-2">
              <Label htmlFor="vehiclePlate" className="text-sm font-medium">
                Placa do Veículo *
              </Label>
              <div className="complaint-plate-container relative">
                <Input
                  id="vehiclePlate"
                  placeholder="ABC1D23"
                  maxLength={10}
                  className="uppercase"
                  {...complaintForm.register('vehiclePlate', {
                    onChange: (e) => {
                      const value = e.target.value.toUpperCase();
                      complaintForm.setValue('vehiclePlate', value);
                      if (value.length >= 2) {
                        setShowComplaintSuggestions(true);
                      } else {
                        setShowComplaintSuggestions(false);
                      }
                    },
                  })}
                  onFocus={() => {
                    const plate = complaintForm.watch('vehiclePlate');
                    if (plate && plate.length >= 2 && complaintPlateSuggestions.length > 0) {
                      setShowComplaintSuggestions(true);
                    }
                  }}
                />
                {isLoadingComplaintSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Autocomplete Suggestions Dropdown */}
                {showComplaintSuggestions && complaintPlateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {complaintPlateSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          complaintForm.setValue('vehiclePlate', suggestion.plate);
                          setShowComplaintSuggestions(false);
                        }}
                        className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b last:border-b-0 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {suggestion.plate}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {suggestion.brand} {suggestion.model}
                            </div>
                          </div>
                          <Car className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {complaintForm.formState.errors.vehiclePlate && (
                <p className="text-sm text-red-600">
                  {complaintForm.formState.errors.vehiclePlate.message}
                </p>
              )}
            </div>

            {/* Tipo de Denúncia */}
            <div className="space-y-2">
              <Label htmlFor="complaintType" className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                Tipo de Denúncia *
              </Label>
              <Select
                value={complaintForm.watch('complaintType')}
                onValueChange={(value) => complaintForm.setValue('complaintType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de denúncia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excesso_velocidade">Excesso de Velocidade</SelectItem>
                  <SelectItem value="direcao_perigosa">Direção Perigosa</SelectItem>
                  <SelectItem value="uso_celular">Uso de Celular ao Dirigir</SelectItem>
                  <SelectItem value="veiculo_mal_conservado">Veículo Mal Conservado</SelectItem>
                  <SelectItem value="desrespeito_sinalizacao">Desrespeito à Sinalização</SelectItem>
                  <SelectItem value="embriaguez">Suspeita de Embriaguez</SelectItem>
                  <SelectItem value="estacionamento_irregular">Estacionamento Irregular</SelectItem>
                  <SelectItem value="poluicao_sonora">Poluição Sonora</SelectItem>
                  <SelectItem value="poluicao_ambiental">Poluição Ambiental</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {complaintForm.formState.errors.complaintType && (
                <p className="text-sm text-red-600">
                  {complaintForm.formState.errors.complaintType.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Descrição da Denúncia *
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o que aconteceu (mínimo 20 caracteres)"
                rows={5}
                maxLength={1000}
                {...complaintForm.register('description')}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {complaintForm.formState.errors.description?.message}
                </span>
                <span>
                  {complaintForm.watch('description')?.length || 0}/1000
                </span>
              </div>
            </div>

            {/* Data e Local da Ocorrência */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occurrenceDate" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Data da Ocorrência
                </Label>
                <Input
                  id="occurrenceDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...complaintForm.register('occurrenceDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occurrenceLocation" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Local da Ocorrência
                </Label>
                <Input
                  id="occurrenceLocation"
                  placeholder="Endereço ou local"
                  {...complaintForm.register('occurrenceLocation')}
                />
              </div>
            </div>

            {/* Informações do Denunciante (Opcionais) */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">
                  Suas Informações (Opcional)
                </h4>
              </div>
              <p className="text-xs text-blue-700">
                Se preferir, você pode se identificar. Caso contrário, a denúncia será anônima.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complainantName" className="text-sm">Nome Completo</Label>
                  <Input
                    id="complainantName"
                    placeholder="Seu nome (opcional)"
                    {...complaintForm.register('complainantName')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="complainantEmail" className="text-sm">Email</Label>
                    <Input
                      id="complainantEmail"
                      type="email"
                      placeholder="seu@email.com (opcional)"
                      {...complaintForm.register('complainantEmail')}
                    />
                    {complaintForm.formState.errors.complainantEmail && (
                      <p className="text-sm text-red-600">
                        {complaintForm.formState.errors.complainantEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complainantPhone" className="text-sm">Telefone</Label>
                    <Input
                      id="complainantPhone"
                      placeholder="(00) 00000-0000 (opcional)"
                      {...complaintForm.register('complainantPhone')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fotos com Drag and Drop */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Camera className="w-4 h-4" />
                Fotos (opcional - máximo 5)
              </Label>

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-400'
                } ${selectedPhotos.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={selectedPhotos.length >= 5}
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Upload className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Arraste fotos aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo de 5 fotos • PNG, JPG até 10MB cada
                    </p>
                  </div>
                  {selectedPhotos.length > 0 && (
                    <p className="text-xs font-medium text-orange-600 mt-1">
                      {selectedPhotos.length} de 5 foto{selectedPhotos.length !== 1 ? 's' : ''} selecionada{selectedPhotos.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Photos Preview */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent group-hover:border-orange-400 transition-all">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="truncate">{photo.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-900">
                <strong>Atenção:</strong> Denúncias falsas podem ser enquadradas como crime de denunciação caluniosa (Art. 339 do Código Penal).
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsComplaintDialogOpen(false);
                  complaintForm.reset();
                  setSelectedPhotos([]);
                  setShowComplaintSuggestions(false);
                  setComplaintPlateSuggestions([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                disabled={complaintForm.formState.isSubmitting}
              >
                {complaintForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Enviar Denúncia
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Check Complaint Dialog */}
      <Dialog open={isCheckComplaintDialogOpen} onOpenChange={(open) => {
        setIsCheckComplaintDialogOpen(open);
        if (!open) {
          setCheckProtocol('');
          setComplaintData(null);
          setCheckComplaintError('');
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
              Consultar Denúncia
            </DialogTitle>
            <DialogDescription>
              Digite o número do protocolo para consultar o status da sua denúncia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Protocol Input */}
            <div className="space-y-2">
              <Label htmlFor="checkProtocol" className="flex items-center gap-2 text-sm font-medium">
                <Hash className="w-4 h-4" />
                Número do Protocolo
              </Label>
              <div className="flex gap-2">
                <Input
                  id="checkProtocol"
                  placeholder="Ex: 20250001"
                  value={checkProtocol}
                  onChange={(e) => setCheckProtocol(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCheckComplaint();
                    }
                  }}
                  className="uppercase"
                />
                <Button
                  onClick={handleCheckComplaint}
                  disabled={isCheckingComplaint}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isCheckingComplaint ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Consultar'
                  )}
                </Button>
              </div>
              {checkComplaintError && (
                <p className="text-sm text-red-600">{checkComplaintError}</p>
              )}
            </div>

            {/* Complaint Data Display */}
            {complaintData && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-lg text-gray-900">Informações da Denúncia</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Protocolo</Label>
                    <p className="text-sm font-mono font-bold">{complaintData.protocol}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Status</Label>
                    <p className="text-sm font-semibold">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaintData.status === 'proposto' ? 'bg-yellow-100 text-yellow-800' :
                        complaintData.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaintData.status_display}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Tipo de Denúncia</Label>
                    <p className="text-sm">{complaintData.complaint_type_display}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Placa do Veículo</Label>
                    <p className="text-sm font-mono font-bold">{complaintData.vehicle_plate}</p>
                  </div>

                  {complaintData.occurrence_date && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Data da Ocorrência</Label>
                      <p className="text-sm">
                        {new Date(complaintData.occurrence_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {complaintData.occurrence_location && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Local da Ocorrência</Label>
                      <p className="text-sm">{complaintData.occurrence_location}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Data de Registro</Label>
                    <p className="text-sm">
                      {new Date(complaintData.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Última Atualização</Label>
                    <p className="text-sm">
                      {new Date(complaintData.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {complaintData.vehicle && (
                  <div className="pt-3 border-t border-gray-200">
                    <Label className="text-xs text-gray-500 mb-2 block">Informações do Veículo</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Marca:</span>
                        <p className="font-medium">{complaintData.vehicle.brand}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Modelo:</span>
                        <p className="font-medium">{complaintData.vehicle.model}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Ano:</span>
                        <p className="font-medium">{complaintData.vehicle.year}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Cor:</span>
                        <p className="font-medium">{complaintData.vehicle.color}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-xs text-blue-900">
                      <strong>Status:</strong> {
                        complaintData.status === 'proposto' ? 'Sua denúncia foi recebida e aguarda análise.' :
                        complaintData.status === 'em_analise' ? 'Sua denúncia está sendo analisada pela equipe responsável.' :
                        'Sua denúncia foi analisada e concluída.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!complaintData && !checkComplaintError && !isCheckingComplaint && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Digite o número do protocolo para consultar</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Search Dialog */}
      <Dialog open={isVehicleSearchDialogOpen} onOpenChange={setIsVehicleSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Car className="w-6 h-6 text-blue-600" />
              Consultar Veículo
            </DialogTitle>
            <DialogDescription>
              Digite a placa do veículo para consultar suas informações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="searchPlate">
                Placa do Veículo
              </Label>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <Input
                    id="searchPlate"
                    placeholder="ABC1D23"
                    maxLength={7}
                    value={searchPlate}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setSearchPlate(value);
                      setSearchError('');
                      setVehicleData(null);

                      // Start searching after 2 characters
                      if (value.length >= 2) {
                        setShowSuggestions(true);
                        // Debounce will be handled by useEffect
                      } else {
                        setShowSuggestions(false);
                        setPlateSuggestions([]);
                      }
                    }}
                    onFocus={() => {
                      if (searchPlate.length >= 2 && plateSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow click on suggestion
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="uppercase"
                  />

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && plateSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {plateSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchPlate(suggestion.plate);
                            setShowSuggestions(false);
                            // Auto-trigger search when selecting from suggestions
                            setTimeout(() => {
                              document.getElementById('searchPlateButton')?.click();
                            }, 100);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{suggestion.plate}</div>
                              <div className="text-sm text-gray-600">{suggestion.brand} {suggestion.model}</div>
                            </div>
                            <Car className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLoadingSuggestions && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                <Button
                  id="searchPlateButton"
                  onClick={async () => {
                    if (!searchPlate || searchPlate.length < 7) {
                      setSearchError('Digite uma placa válida');
                      return;
                    }

                    setIsSearchingVehicle(true);
                    setSearchError('');
                    setVehicleData(null);

                    try {
                      const response = await fetch(buildApiUrl(`api/vehicles/plate/${searchPlate}/`));

                      if (!response.ok) {
                        if (response.status === 404) {
                          setSearchError('Veículo não encontrado');
                        } else {
                          setSearchError('Erro ao consultar veículo');
                        }
                        return;
                      }

                      const data = await response.json();
                      setVehicleData(data);
                      setIsVehicleSearchDialogOpen(false);
                      setSearchPlate('');
                    } catch (error) {
                      setSearchError('Erro ao conectar com o servidor');
                    } finally {
                      setIsSearchingVehicle(false);
                    }
                  }}
                  disabled={isSearchingVehicle}
                  className="px-6"
                >
                  {isSearchingVehicle ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
              {searchError && (
                <p className="text-sm text-red-600">{searchError}</p>
              )}
            </div>

            {vehicleData && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Informações do Veículo
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Placa</div>
                      <div className="text-sm font-semibold text-gray-900">{vehicleData.plate}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Marca</div>
                      <div className="text-sm font-semibold text-gray-900">{vehicleData.brand}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Modelo</div>
                      <div className="text-sm font-semibold text-gray-900">{vehicleData.model}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Ano</div>
                      <div className="text-sm font-semibold text-gray-900">{vehicleData.year}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Cor</div>
                      <div className="text-sm font-semibold text-gray-900">{vehicleData.color}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Combustível</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {vehicleData.fuel_type === 'gasoline' ? 'Gasolina' :
                         vehicleData.fuel_type === 'ethanol' ? 'Etanol' :
                         vehicleData.fuel_type === 'flex' ? 'Flex' :
                         vehicleData.fuel_type === 'diesel' ? 'Diesel' :
                         vehicleData.fuel_type === 'electric' ? 'Elétrico' :
                         vehicleData.fuel_type === 'hybrid' ? 'Híbrido' : vehicleData.fuel_type}
                      </div>
                    </div>
                  </div>
                </div>

                {vehicleData.current_conductor && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      Motorista Atual
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Nome</div>
                        <div className="text-sm font-semibold text-gray-900">{vehicleData.current_conductor.full_name}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">CPF</div>
                        <div className="text-sm font-semibold text-gray-900">{vehicleData.current_conductor.cpf}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">CNH</div>
                        <div className="text-sm font-semibold text-gray-900">{vehicleData.current_conductor.cnh_number}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Categoria</div>
                        <div className="text-sm font-semibold text-gray-900">{vehicleData.current_conductor.cnh_category}</div>
                      </div>
                    </div>
                  </div>
                )}

                {!vehicleData.current_conductor && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-sm text-yellow-900">Este veículo não possui motorista vinculado no momento.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Protocol Number Modal - Driver */}
      <Dialog open={isProtocolModalOpen} onOpenChange={setIsProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua solicitação de cadastro de motorista foi registrada e será analisada em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Protocol Number Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Número do Protocolo
                </div>
                <div className="text-4xl font-bold text-blue-600 font-mono">
                  #{driverProtocolNumber?.toString().padStart(8, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Guarde este número para acompanhar sua solicitação
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>Sua solicitação será analisada por nossa equipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>Você será contatado através do email e telefone informados</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <span>O prazo médio de análise é de 3 a 5 dias úteis</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsProtocolModalOpen(false)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Protocol Number Modal - Vehicle */}
      <Dialog open={isVehicleProtocolModalOpen} onOpenChange={setIsVehicleProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua solicitação de cadastro de veículo foi registrada e será analisada em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Protocol Number Display */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Número do Protocolo
                </div>
                <div className="text-4xl font-bold text-purple-600 font-mono">
                  #{vehicleProtocolNumber?.toString().padStart(8, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Guarde este número para acompanhar sua solicitação
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                  <span>Sua solicitação será analisada por nossa equipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                  <span>Verificaremos a documentação do veículo</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                  <span>O prazo médio de análise é de 3 a 5 dias úteis</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsVehicleProtocolModalOpen(false)}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Protocol Number Modal - Complaint */}
      <Dialog open={isComplaintProtocolModalOpen} onOpenChange={setIsComplaintProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Denúncia Registrada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua denúncia foi registrada e será analisada pela equipe responsável.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Protocol Number Display */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Número do Protocolo
                </div>
                <div className="text-4xl font-bold text-orange-600 font-mono">
                  #{complaintProtocolNumber?.toString().padStart(8, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Guarde este número para consultar o andamento da denúncia
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                  <span>Sua denúncia será analisada por nossa equipe</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                  <span>Você pode consultar o status usando o número do protocolo</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                  <span>As providências cabíveis serão tomadas conforme necessário</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setIsComplaintProtocolModalOpen(false)}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sobre */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{config.company_name}</h3>
              <p className="text-sm text-gray-400">
                {config.about_text}
              </p>
            </div>

            {/* Links Rápidos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('inicio')} className="text-sm text-gray-400 hover:text-white">Início</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-sm text-gray-400 hover:text-white">Sobre</button></li>
                <li><button onClick={() => scrollToSection('cadastro')} className="text-sm text-gray-400 hover:text-white">Cadastros</button></li>
                <li><button onClick={() => scrollToSection('denuncias')} className="text-sm text-gray-400 hover:text-white">Denúncias</button></li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Siga-nos</h3>
              <div className="flex gap-4">
                {config.facebook_url && <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Facebook /></a>}
                {config.instagram_url && <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram /></a>}
                {config.linkedin_url && <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Linkedin /></a>}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
''
