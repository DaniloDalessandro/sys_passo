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
  Users,
  User,
  Car,
  Menu,
  X,
  LogIn,
  FileText,
  Hash,
  Calendar,
  AlertTriangle,
  Activity,
  Camera,
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

const fetchWithAuth = async (pathOrUrl: string, options: RequestInit = {}) => {
  const url = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : buildApiUrl(pathOrUrl);

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
};

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

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

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
  complainantName: z.string().optional(),
  complainantEmail: z.string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido')
    .optional()
    .or(z.literal('')),
  complainantPhone: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

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
  const [plateSuggestions, setPlateSuggestions] = useState<Array<{plate: string, brand: string, model: string, color: string}>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [complaintPlateSuggestions, setComplaintPlateSuggestions] = useState<Array<{plate: string, brand: string, model: string, color: string}>>([]);
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
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  const complaintForm = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      vehiclePlate: '',
      complaintType: '',
      description: '',
      occurrenceDate: '',
      complainantName: '',
      complainantEmail: '',
      complainantPhone: '',
    },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(buildApiUrl('api/site/configuration/'));
        if (response.ok) {
          const result = await response.json();
          const data = result.success ? result.data : result;
          setConfig({
            company_name: data.company_name || 'ViaLumiar',
            logo_url: data.logo_url,
            hero_title: data.hero_title || 'Gestão Inteligente de Frotas',
            hero_subtitle: data.hero_subtitle || 'Controle completo da sua frota com tecnologia de ponta',
            about_text: data.about_text || 'Sistema de gestão de frotas e veículos.',
            phone: data.phone || '(00) 00000-0000',
            email: data.email || 'contato@vialumiar.com.br',
            address: data.address || 'São Paulo, SP',
            whatsapp: data.whatsapp || '00000000000',
            facebook_url: data.facebook_url,
            instagram_url: data.instagram_url,
            linkedin_url: data.linkedin_url,
          });
        }
      } catch {
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        try {
          const vehiclesResponse = await fetchWithAuth('api/vehicles/');
          if (vehiclesResponse.ok) {
            const vehiclesData = await vehiclesResponse.json();
            const count = vehiclesData.count || vehiclesData.length || 0;
            setVehicleCount(count);
          }
        } catch {
          // Contagem de veículos requer autenticação; falha silenciosa é esperada para usuários não autenticados
        }

        try {
          const conductorsResponse = await fetchWithAuth('api/conductors/');
          if (conductorsResponse.ok) {
            const conductorsData = await conductorsResponse.json();
            const count = conductorsData.count || conductorsData.length || 0;
            setConductorCount(count);
          }
        } catch {
          // Contagem de condutores requer autenticação; falha silenciosa é esperada para usuários não autenticados
        }
      } catch {
        // Contagens são informativas; erro no bloco externo não deve interromper a página
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchPlate.length < 2) {
      setPlateSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    const timeoutId = setTimeout(async () => {
      try {
        const url = buildApiUrl(`api/vehicles/search-by-plate/?search=${encodeURIComponent(searchPlate)}`);
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setPlateSuggestions(data || []);
        } else {
          setPlateSuggestions([]);
        }
      } catch {
        setPlateSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsLoadingSuggestions(false);
    };
  }, [searchPlate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
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

  useEffect(() => {
    const complaintPlate = complaintForm.watch('vehiclePlate');

    if (!complaintPlate || complaintPlate.length < 2) {
      setComplaintPlateSuggestions([]);
      setIsLoadingComplaintSuggestions(false);
      return;
    }

    setIsLoadingComplaintSuggestions(true);

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
      } catch {
        setComplaintPlateSuggestions([]);
      } finally {
        setIsLoadingComplaintSuggestions(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      setIsLoadingComplaintSuggestions(false);
    };
  }, [complaintForm.watch('vehiclePlate')]);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

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

  const onDriverSubmit = async (data: any) => {
    const formData = new FormData();

    const requiredFields = ['name', 'cpf', 'birth_date', 'gender', 'nationality',
                           'street', 'number', 'neighborhood', 'city',
                           'phone', 'email', 'license_number', 'license_category', 'license_expiry_date'];

    const optionalFields = ['reference_point', 'whatsapp', 'document', 'cnh_digital', 'photo'];

    requiredFields.forEach(key => {
      const value = data[key as keyof typeof data];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    optionalFields.forEach(key => {
      const value = data[key as keyof typeof data];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value && value !== '') {
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch(buildApiUrl('api/requests/drivers/'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.values(errorData).flat().join(' ') || 'Erro ao enviar solicitação.';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const protocolNumber = responseData.data?.protocol;

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
      toast.error('Erro ao enviar solicitação', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  const onVehicleSubmit = async (data: any) => {
    const formData = new FormData();

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

    const fuelTypeMapping: Record<string, string> = {
      'Diesel': 'diesel',
      'Gasolina': 'gasoline',
      'Etanol': 'ethanol',
      'Flex': 'flex',
      'GNV': 'hybrid',
    };

    Object.entries(fieldMapping).forEach(([ptKey, enKey]) => {
      let value = data[ptKey];

      if (value !== undefined && value !== null && value !== '') {
        if (ptKey === 'placa') {
          value = value.toUpperCase();
        }

        if (ptKey === 'combustivel' && fuelTypeMapping[value]) {
          value = fuelTypeMapping[value];
        }

        formData.append(enKey, value.toString());
      }
    });

    ['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'].forEach(photoKey => {
      const photo = data[photoKey];
      if (photo && photo instanceof File) {
        formData.append(photoKey, photo);
      }
    });

    try {
      const response = await fetch(buildApiUrl('api/requests/vehicles/'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || errorData.plate?.[0] || 'Erro ao enviar solicitação.';
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const protocolNumber = responseData.data?.protocol;

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
      toast.error('Erro ao enviar solicitação', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente mais tarde.',
      });
    }
  };

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
    } catch {
      // Erros de autocomplete de placas são ignorados silenciosamente para não bloquear o formulário
    } finally {
      setIsLoadingPlates(false);
    }
  };

  const debouncedSearchPlates = useCallback((query: string) => {
    const timer = setTimeout(() => searchPlates(query), 300);
    return () => clearTimeout(timer);
  }, []);

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

  const onComplaintSubmit = async (data: ComplaintFormData) => {
    try {
      const formData = new FormData();
      formData.append('vehicle_plate', data.vehiclePlate.toUpperCase());
      formData.append('complaint_type', data.complaintType);
      formData.append('description', data.description);

      if (data.occurrenceDate) formData.append('occurrence_date', data.occurrenceDate);
      if (data.complainantName) formData.append('complainant_name', data.complainantName);
      if (data.complainantEmail) formData.append('complainant_email', data.complainantEmail);
      if (data.complainantPhone) formData.append('complainant_phone', data.complainantPhone);

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
        buildApiUrl(`api/complaints/_check-protocol/?protocol=${encodeURIComponent(checkProtocol)}`),
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error || 'Erro ao consultar protocolo';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setComplaintData(data);
      setCheckComplaintError('');
    } catch (error) {
      setCheckComplaintError(error instanceof Error ? error.message : 'Erro ao consultar protocolo');
      setComplaintData(null);
    } finally {
      setIsCheckingComplaint(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm'
          : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

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

            <div className="hidden lg:flex items-center gap-1">
              {[
                { label: 'Início', id: 'inicio' },
                { label: 'Sobre', id: 'about' },
                { label: 'Cadastros', id: 'cadastro' },
                { label: 'Denúncias', id: 'denuncias' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
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
                className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contato
              </button>
              <Link
                href="/login"
                className="ml-2 inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Link>
            </div>

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

          {isMobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-gray-100">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Sobre
                </button>
                <button
                  onClick={() => scrollToSection('cadastro')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cadastros
                </button>
                <button
                  onClick={() => scrollToSection('denuncias')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
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
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Contato
                </button>
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-700 px-3 py-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section id="inicio" className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="sitehome-orb w-[500px] h-[500px] bg-blue-200/40 top-[-80px] left-[-100px]" style={{ animationDelay: '0s' }} />
        <div className="sitehome-orb w-[400px] h-[400px] bg-indigo-200/30 bottom-[-60px] right-[-80px]" style={{ animationDelay: '4s' }} />
        <div className="sitehome-orb w-[280px] h-[280px] bg-purple-100/40 top-[40%] left-[55%]" style={{ animationDelay: '8s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center sitehome-fade-in">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-100/70 px-3 py-1 rounded-full mb-5 sitehome-fade-in">
              Gestão de Frotas
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              {config.hero_title}
            </h1>
            <p className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              {config.hero_subtitle}
            </p>

            <div className="mt-8 w-full max-w-2xl mx-auto sitehome-slide-up-delay-1">
              <div className="relative search-container">
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Digite a placa do veículo"
                    className="w-full pl-6 pr-12 py-5 text-base text-gray-700 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all uppercase shadow-sm"
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
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>

                {showSuggestions && plateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto">
                    {plateSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectPlate(suggestion.plate)}
                        className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{suggestion.plate}</div>
                            <div className="text-sm text-gray-500 mt-0.5">
                              {suggestion.brand} {suggestion.model}
                              {suggestion.color && <span className="ml-1">· {suggestion.color}</span>}
                            </div>
                          </div>
                          <Car className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!isLoadingCounts && (vehicleCount > 0 || conductorCount > 0) && (
              <div className="mt-8 flex items-center justify-center gap-4 sitehome-slide-up-delay-2">
                {vehicleCount > 0 && (
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-blue-100/50 px-7 py-5 sitehome-card-lift">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 mb-2">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter end={vehicleCount} label="" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium tracking-wide">Veículos Cadastrados</div>
                  </div>
                )}
                {conductorCount > 0 && (
                  <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-indigo-100/50 px-7 py-5 sitehome-card-lift">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 mb-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      <AnimatedCounter end={conductorCount} label="" />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 font-medium tracking-wide">Motoristas Ativos</div>
                  </div>
                )}
              </div>
            )}

            {vehicleData && (
              <div id="vehicle-result-section" className="mt-10 text-left">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-600">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Car className="w-5 h-5" />
                      Informações do Veículo
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVehicleData(null)}
                      className="text-white hover:bg-white/20 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Placa', value: vehicleData.plate, highlight: true },
                        { label: 'Marca', value: vehicleData.brand },
                        { label: 'Modelo', value: vehicleData.model },
                        { label: 'Ano', value: vehicleData.year },
                        { label: 'Cor', value: vehicleData.color },
                        {
                          label: 'Combustível',
                          value: vehicleData.fuel_type === 'gasoline' ? 'Gasolina' :
                                 vehicleData.fuel_type === 'ethanol' ? 'Etanol' :
                                 vehicleData.fuel_type === 'flex' ? 'Flex' :
                                 vehicleData.fuel_type === 'diesel' ? 'Diesel' :
                                 vehicleData.fuel_type === 'electric' ? 'Elétrico' :
                                 vehicleData.fuel_type === 'hybrid' ? 'Híbrido' : vehicleData.fuel_type,
                        },
                        { label: 'Categoria', value: vehicleData.category },
                        { label: 'Capacidade', value: `${vehicleData.passenger_capacity} passageiros` },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className={`rounded-xl p-4 border ${field.highlight ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}
                        >
                          <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${field.highlight ? 'text-blue-600' : 'text-gray-400'}`}>
                            {field.label}
                          </div>
                          <div className="text-base font-semibold text-gray-900">{field.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-blue-600" />
                        Fotos do Veículo
                      </h3>
                      {vehicleData.photos && vehicleData.photos.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {vehicleData.photos.map((photo: { id: number; url: string }) => (
                            <button
                              key={photo.id}
                              onClick={() => setSelectedPhotoUrl(photo.url)}
                              className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                            >
                              <img
                                src={photo.url}
                                alt={`Foto ${photo.id} do veículo`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-white/90 rounded-full p-1.5">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 text-center">
                          <Camera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Nenhuma foto disponível para este veículo.</p>
                        </div>
                      )}
                    </div>

                    {vehicleData.current_conductor ? (
                      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          Motorista Atual
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Nome Completo', value: vehicleData.current_conductor.full_name },
                            { label: 'CPF', value: vehicleData.current_conductor.cpf },
                            { label: 'CNH', value: vehicleData.current_conductor.cnh_number },
                            { label: 'Categoria CNH', value: vehicleData.current_conductor.cnh_category },
                            ...(vehicleData.current_conductor.phone ? [{ label: 'Telefone', value: vehicleData.current_conductor.phone }] : []),
                            ...(vehicleData.current_conductor.email ? [{ label: 'E-mail', value: vehicleData.current_conductor.email }] : []),
                          ].map((field) => (
                            <div key={field.label}>
                              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">{field.label}</div>
                              <div className="text-sm font-semibold text-gray-900">{field.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Sem motorista vinculado</p>
                          <p className="text-xs text-amber-700">Este veículo não possui motorista cadastrado no momento.</p>
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

      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
              Quem somos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Sobre Nós
            </h2>
            <p className="mt-6 text-base text-gray-600 leading-relaxed whitespace-pre-line">
              {config.about_text}
            </p>
          </div>
        </div>
      </section>

      <section id="cadastro" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
              Cadastros
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Solicite um Cadastro
            </h2>
            <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
              Solicite cadastro de motoristas e veículos de forma rápida e simples.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setIsDriverDialogOpen(true)}
              className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm sitehome-card-lift p-7"
            >
              <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 p-3 shadow-md shadow-blue-200">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cadastrar Motorista
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-5">
                Solicite o cadastro de um novo condutor para sua frota de forma rápida.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all duration-200">
                Iniciar cadastro
                <span className="text-base">→</span>
              </span>
            </button>

            <button
              onClick={() => setIsVehicleDialogOpen(true)}
              className="group text-left bg-white rounded-2xl border border-gray-100 shadow-sm sitehome-card-lift p-7"
            >
              <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-5 p-3 shadow-md shadow-purple-200">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cadastrar Veículo
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-5">
                Adicione um novo veículo à frota de forma simples e organizada.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 group-hover:gap-3 transition-all duration-200">
                Iniciar cadastro
                <span className="text-base">→</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      <section id="denuncias" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full mb-4">
                Denúncias
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Canal de Denúncias
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Ajude a manter a segurança no trânsito.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Como funciona?</h3>
              <ol className="space-y-3">
                {[
                  'Identifique a placa do veículo envolvido na situação irregular.',
                  'Selecione o tipo de denúncia (excesso de velocidade, direção perigosa, etc.).',
                  'Descreva detalhadamente o ocorrido (data, local e circunstâncias).',
                  'Você pode fazer a denúncia de forma anônima ou identificada.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-red-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800">
                  <strong>Importante:</strong> Todas as denúncias são analisadas pela equipe responsável.
                  Denúncias falsas podem ser enquadradas como crime de denunciação caluniosa.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsComplaintDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-7 py-3 rounded-full font-semibold transition-all shadow-md shadow-red-200 hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <AlertTriangle className="w-4 h-4" />
                Fazer Denúncia
              </button>
              <button
                onClick={() => setIsCheckComplaintDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-7 py-3 rounded-full font-semibold transition-all"
              >
                <FileText className="w-4 h-4" />
                Consultar Denúncia
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4">
              Contato
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Entre em Contato
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Estamos prontos para atender você.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <a
              href={`tel:${config.phone.replace(/\D/g, '')}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 sitehome-card-lift"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5 font-medium">Telefone</div>
                <div className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{formatPhoneDisplay(config.phone)}</div>
              </div>
            </a>

            <a
              href={`mailto:${config.email}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 sitehome-card-lift"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-400 mb-0.5 font-medium">E-mail</div>
                <div className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{config.email}</div>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 sitehome-card-lift">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-sm shadow-slate-200">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5 font-medium">Endereço</div>
                <div className="text-base font-semibold text-gray-900">{config.address}</div>
              </div>
            </div>

            <a
              href={formatWhatsAppLink(config.whatsapp, 'Olá! Gostaria de saber mais sobre os serviços.')}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl sitehome-card-lift shadow-sm shadow-green-200"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-green-100 mb-0.5 font-medium">WhatsApp</div>
                <div className="text-base font-semibold text-white">Iniciar conversa agora</div>
              </div>
              <span className="text-white/80 text-lg group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-blue-600" />
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

      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Car className="w-5 h-5 text-blue-600" />
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

      <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Fazer Denúncia
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para registrar sua denúncia. Todas as denúncias são analisadas pela equipe responsável.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)} className="space-y-5 mt-2">
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                )}

                {showComplaintSuggestions && complaintPlateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {complaintPlateSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          complaintForm.setValue('vehiclePlate', suggestion.plate);
                          setShowComplaintSuggestions(false);
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {suggestion.plate}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {suggestion.brand} {suggestion.model}
                              {suggestion.color && <span className="ml-1">· {suggestion.color}</span>}
                            </div>
                          </div>
                          <Car className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {complaintForm.formState.errors.vehiclePlate && (
                <p className="text-xs text-red-600">
                  {complaintForm.formState.errors.vehiclePlate.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-red-600">
                    {complaintForm.formState.errors.complaintType.message}
                  </p>
                )}
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Descrição da Denúncia *
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o que aconteceu (mínimo 20 caracteres)"
                rows={4}
                maxLength={1000}
                {...complaintForm.register('description')}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span className="text-red-500">
                  {complaintForm.formState.errors.description?.message}
                </span>
                <span>
                  {complaintForm.watch('description')?.length || 0}/1000
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">
                  Suas Informações (Opcional)
                </h4>
              </div>
              <p className="text-xs text-blue-700">
                Se preferir, você pode se identificar. Caso contrário, a denúncia será anônima.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="complainantName" className="text-sm">Nome Completo</Label>
                  <Input
                    id="complainantName"
                    placeholder="Seu nome (opcional)"
                    {...complaintForm.register('complainantName')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="complainantEmail" className="text-sm">Email</Label>
                    <Input
                      id="complainantEmail"
                      type="email"
                      placeholder="seu@email.com (opcional)"
                      {...complaintForm.register('complainantEmail')}
                    />
                    {complaintForm.formState.errors.complainantEmail && (
                      <p className="text-xs text-red-600">
                        {complaintForm.formState.errors.complainantEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
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

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Camera className="w-4 h-4" />
                Fotos (opcional — máximo 5)
              </Label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-5 transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
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
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="text-sm text-gray-600 font-medium">
                    Arraste fotos aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-400">
                    Máximo de 5 fotos · PNG, JPG até 10MB cada
                  </p>
                  {selectedPhotos.length > 0 && (
                    <p className="text-xs font-medium text-blue-600">
                      {selectedPhotos.length} de 5 foto{selectedPhotos.length !== 1 ? 's' : ''} selecionada{selectedPhotos.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-400 transition-colors">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-900">
                <strong>Atenção:</strong> Denúncias falsas podem ser enquadradas como crime de denunciação caluniosa (Art. 339 do Código Penal).
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-1">
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
                className="bg-red-600 hover:bg-red-700 text-white"
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
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Consultar Denúncia
            </DialogTitle>
            <DialogDescription>
              Digite o número do protocolo para consultar o status da sua denúncia.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCheckingComplaint ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Consultar'
                  )}
                </Button>
              </div>
              {checkComplaintError && (
                <p className="text-xs text-red-600">{checkComplaintError}</p>
              )}
            </div>

            {complaintData && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900">Informações da Denúncia</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Protocolo</Label>
                    <p className="text-sm font-mono font-bold">{complaintData.protocol}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Status</Label>
                    <p className="text-sm font-semibold">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        complaintData.status === 'proposto' ? 'bg-amber-100 text-amber-800' :
                        complaintData.status === 'em_analise' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaintData.status_display}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Tipo de Denúncia</Label>
                    <p className="text-sm">{complaintData.complaint_type_display}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Placa do Veículo</Label>
                    <p className="text-sm font-mono font-bold">{complaintData.vehicle_plate}</p>
                  </div>

                  {complaintData.occurrence_date && (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Data da Ocorrência</Label>
                      <p className="text-sm">
                        {new Date(complaintData.occurrence_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Data de Registro</Label>
                    <p className="text-sm">
                      {new Date(complaintData.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Última Atualização</Label>
                    <p className="text-sm">
                      {new Date(complaintData.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {complaintData.vehicle && (
                  <div className="pt-3 border-t border-gray-200">
                    <Label className="text-xs text-gray-400 mb-2 block">Informações do Veículo</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-gray-400">Marca:</span>
                        <p className="font-medium">{complaintData.vehicle.brand}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Modelo:</span>
                        <p className="font-medium">{complaintData.vehicle.model}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Ano:</span>
                        <p className="font-medium">{complaintData.vehicle.year}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400">Cor:</span>
                        <p className="font-medium">{complaintData.vehicle.color}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
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
              <div className="text-center py-10 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Digite o número do protocolo para consultar</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVehicleSearchDialogOpen} onOpenChange={setIsVehicleSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Car className="w-5 h-5 text-blue-600" />
              Consultar Veículo
            </DialogTitle>
            <DialogDescription>
              Digite a placa do veículo para consultar suas informações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label htmlFor="searchPlate">Placa do Veículo</Label>
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

                      if (value.length >= 2) {
                        setShowSuggestions(true);
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
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="uppercase"
                  />

                  {showSuggestions && plateSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {plateSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchPlate(suggestion.plate);
                            setShowSuggestions(false);
                            setTimeout(() => {
                              document.getElementById('searchPlateButton')?.click();
                            }, 100);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{suggestion.plate}</div>
                              <div className="text-sm text-gray-500">
                                {suggestion.brand} {suggestion.model}
                                {suggestion.color && <span className="ml-1">· {suggestion.color}</span>}
                              </div>
                            </div>
                            <Car className="w-4 h-4 text-gray-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isLoadingSuggestions && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSearchingVehicle ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Buscar'
                  )}
                </Button>
              </div>
              {searchError && (
                <p className="text-xs text-red-600">{searchError}</p>
              )}
            </div>

            {vehicleData && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    Informações do Veículo
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Placa', value: vehicleData.plate },
                      { label: 'Marca', value: vehicleData.brand },
                      { label: 'Modelo', value: vehicleData.model },
                      { label: 'Ano', value: vehicleData.year },
                      { label: 'Cor', value: vehicleData.color },
                      {
                        label: 'Combustível',
                        value: vehicleData.fuel_type === 'gasoline' ? 'Gasolina' :
                               vehicleData.fuel_type === 'ethanol' ? 'Etanol' :
                               vehicleData.fuel_type === 'flex' ? 'Flex' :
                               vehicleData.fuel_type === 'diesel' ? 'Diesel' :
                               vehicleData.fuel_type === 'electric' ? 'Elétrico' :
                               vehicleData.fuel_type === 'hybrid' ? 'Híbrido' : vehicleData.fuel_type,
                      },
                    ].map((field) => (
                      <div key={field.label} className="bg-white rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">{field.label}</div>
                        <div className="text-sm font-semibold text-gray-900">{field.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {vehicleData.current_conductor && (
                  <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      Motorista Atual
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Nome', value: vehicleData.current_conductor.full_name },
                        { label: 'CPF', value: vehicleData.current_conductor.cpf },
                        { label: 'CNH', value: vehicleData.current_conductor.cnh_number },
                        { label: 'Categoria', value: vehicleData.current_conductor.cnh_category },
                      ].map((field) => (
                        <div key={field.label} className="bg-white rounded-lg p-3">
                          <div className="text-xs text-gray-400 mb-1">{field.label}</div>
                          <div className="text-sm font-semibold text-gray-900">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!vehicleData.current_conductor && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-amber-900">Este veículo não possui motorista vinculado no momento.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProtocolModalOpen} onOpenChange={setIsProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua solicitação de cadastro de motorista foi registrada e será analisada em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Número do Protocolo
              </div>
              <div className="text-4xl font-bold text-blue-600 font-mono">
                #{driverProtocolNumber?.toString().padStart(8, '0')}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Guarde este número para acompanhar sua solicitação
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {[
                  'Sua solicitação será analisada por nossa equipe',
                  'Você será contatado através do email e telefone informados',
                  'O prazo médio de análise é de 3 a 5 dias úteis',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            onClick={() => setIsProtocolModalOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isVehicleProtocolModalOpen} onOpenChange={setIsVehicleProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Solicitação Enviada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua solicitação de cadastro de veículo foi registrada e será analisada em breve.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Número do Protocolo
              </div>
              <div className="text-4xl font-bold text-blue-600 font-mono">
                #{vehicleProtocolNumber?.toString().padStart(8, '0')}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Guarde este número para acompanhar sua solicitação
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {[
                  'Sua solicitação será analisada por nossa equipe',
                  'Verificaremos a documentação do veículo',
                  'O prazo médio de análise é de 3 a 5 dias úteis',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            onClick={() => setIsVehicleProtocolModalOpen(false)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isComplaintProtocolModalOpen} onOpenChange={setIsComplaintProtocolModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">
              Denúncia Registrada com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-center">
              Sua denúncia foi registrada e será analisada pela equipe responsável.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-3">
            <div className="bg-red-50 rounded-xl p-6 border border-red-100 text-center">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Número do Protocolo
              </div>
              <div className="text-4xl font-bold text-red-600 font-mono">
                #{complaintProtocolNumber?.toString().padStart(8, '0')}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Guarde este número para consultar o andamento da denúncia
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-600" />
                Próximos Passos
              </h4>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {[
                  'Sua denúncia será analisada por nossa equipe',
                  'Você pode consultar o status usando o número do protocolo',
                  'As providências cabíveis serão tomadas conforme necessário',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Button
            onClick={() => setIsComplaintProtocolModalOpen(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Entendi
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhotoUrl} onOpenChange={(open) => !open && setSelectedPhotoUrl(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black/95 border-0">
          <div className="relative">
            <button
              onClick={() => setSelectedPhotoUrl(null)}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center justify-center min-h-[60vh] max-h-[85vh] p-4">
              {selectedPhotoUrl && (
                <img
                  src={selectedPhotoUrl}
                  alt="Foto do veículo em tamanho grande"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-semibold">{config.company_name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {config.about_text}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Links Rápidos</h3>
              <ul className="space-y-2">
                {[
                  { label: 'Início', id: 'inicio' },
                  { label: 'Sobre', id: 'about' },
                  { label: 'Cadastros', id: 'cadastro' },
                  { label: 'Denúncias', id: 'denuncias' },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold">Siga-nos</h3>
              <div className="flex gap-4">
                {config.facebook_url && (
                  <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {config.instagram_url && (
                  <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config.linkedin_url && (
                  <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
