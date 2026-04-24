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
      {label && <div className="text-lg text-indigo-100">{label}</div>}
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

  // Scroll-reveal: adiciona .visible aos elementos .sh-reveal quando entram na viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );
    const targets = document.querySelectorAll('.sh-reveal');
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 sidebar-logo-gradient rounded-2xl flex items-center justify-center shadow-xl animate-pulse-glow">
            <Car className="w-8 h-8 text-white animate-float" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-gray-200/80 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-2">
              <div className="sidebar-logo-gradient rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                <Car className="w-4 h-4 text-white" />
              </div>
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
                <span className="text-lg font-bold gradient-text">
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
                  className="text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium"
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
                className="text-sm text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 font-medium"
              >
                Contato
              </button>
              <Link
                href="/login"
                className="ml-2 inline-flex items-center gap-2 sidebar-logo-gradient text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md shadow-indigo-500/25 hover:opacity-90 transition-opacity"
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
            <div className="lg:hidden py-3 border-t border-gray-100 animate-fade-in">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Sobre
                </button>
                <button
                  onClick={() => scrollToSection('cadastro')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Cadastros
                </button>
                <button
                  onClick={() => scrollToSection('denuncias')}
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
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
                  className="text-left text-sm px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Contato
                </button>
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 sidebar-logo-gradient text-white text-sm px-4 py-2 rounded-full font-semibold shadow-sm"
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

      <section id="inicio" className="relative pt-24 pb-32 overflow-hidden bg-[#070c1b]">

        {/* Decorative grid background */}
        <div className="absolute inset-0 sitehome-grid-bg" aria-hidden="true" />

        {/* Radial vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Neon orbs */}
        <div
          className="hero-orb w-[600px] h-[600px] top-[-150px] left-[-150px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '0s',
          }}
          aria-hidden="true"
        />
        <div
          className="hero-orb w-[500px] h-[500px] bottom-[-100px] right-[-120px]"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animationDelay: '5s',
          }}
          aria-hidden="true"
        />
        <div
          className="hero-orb w-[350px] h-[350px] top-[35%] left-[55%]"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.20) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animationDelay: '9s',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center sitehome-fade-in">

            {/* Badge com borda glow */}
            <div className="inline-flex items-center gap-2 mb-8 sitehome-fade-in">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/30 badge-glow">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" aria-hidden="true" />
                Gestão de Frotas
              </span>
            </div>

            {/* Título com gradiente animado e word-reveal */}
            <h1
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-0"
              style={{ perspective: '800px' }}
            >
              {config.hero_title.split(' ').map((word, i) => (
                <span
                  key={i}
                  className={`hero-word hero-word-${Math.min(i + 1, 4)} mr-[0.2em] last:mr-0`}
                >
                  {i === 0 ? (
                    <span
                      className="animate-gradient-x"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee, #60a5fa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {word}
                    </span>
                  ) : i === 1 ? (
                    <span className="text-white">{word}</span>
                  ) : (
                    <span
                      className="animate-gradient-x"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #a78bfa, #22d3ee, #818cf8, #a78bfa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animationDelay: '1.5s',
                      }}
                    >
                      {word}
                    </span>
                  )}
                </span>
              ))}
            </h1>

            <p className="mt-7 text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed sitehome-slide-up-delay-1">
              {config.hero_subtitle}
            </p>

            {/* Barra de busca adaptada para fundo escuro */}
            <div className="mt-10 w-full max-w-2xl mx-auto sitehome-slide-up-delay-1">
              <div className="relative search-container rounded-full shadow-[0_8px_40px_rgba(99,102,241,0.2)]">
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Digite a placa do veículo"
                    className="w-full pl-6 pr-12 py-5 text-base rounded-full transition-all uppercase hero-search-input focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    </div>
                  )}
                </div>

                {showSuggestions && plateSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#0e1529] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 max-h-72 overflow-y-auto">
                    {plateSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectPlate(suggestion.plate)}
                        className="px-5 py-4 hover:bg-indigo-500/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{suggestion.plate}</div>
                            <div className="text-sm text-slate-400 mt-0.5">
                              {suggestion.brand} {suggestion.model}
                              {suggestion.color && <span className="ml-1">· {suggestion.color}</span>}
                            </div>
                          </div>
                          <Car className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cards de estatísticas — dark glass */}
            {!isLoadingCounts && (vehicleCount > 0 || conductorCount > 0) && (
              <div className="mt-10 flex items-center justify-center gap-4 sitehome-slide-up-delay-2">
                {vehicleCount > 0 && (
                  <div className="text-center hero-stat-card rounded-2xl px-7 py-5 transition-all duration-300 sitehome-card-lift cursor-default">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-400/20 mb-2">
                      <Car className="w-4 h-4 text-blue-400" />
                    </div>
                    <div
                      className="text-3xl font-bold animate-gradient-x"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #60a5fa, #818cf8, #22d3ee)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      <AnimatedCounter end={vehicleCount} label="" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Veículos Cadastrados</div>
                  </div>
                )}
                {conductorCount > 0 && (
                  <div className="text-center hero-stat-card rounded-2xl px-7 py-5 transition-all duration-300 sitehome-card-lift cursor-default">
                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-400/20 mb-2">
                      <Users className="w-4 h-4 text-violet-400" />
                    </div>
                    <div
                      className="text-3xl font-bold animate-gradient-x"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #a78bfa, #c084fc, #818cf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animationDelay: '2s',
                      }}
                    >
                      <AnimatedCounter end={conductorCount} label="" />
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Motoristas Ativos</div>
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

        {/* Estrada */}
        <div className="hero-car-road" aria-hidden="true">
          <div className="hero-car-road-line" />
        </div>

        {/* Carro passando atrás do título */}
        <div className="hero-car" aria-hidden="true">
          <svg width="280" height="80" viewBox="0 0 280 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="140" cy="76" rx="100" ry="6" fill="rgba(0,0,0,0.35)" />
            <rect x="4" y="38" width="14" height="8" rx="2" fill="#ef4444" opacity="0.9" />
            <ellipse cx="8" cy="42" rx="10" ry="8" fill="#ef4444" opacity="0.25" />
            <path d="M20 55 L20 35 Q22 28 40 22 L80 16 Q100 12 120 12 L180 12 Q210 12 230 20 L258 30 Q268 34 270 42 L270 55 Z" fill="url(#carBody)" />
            <path d="M75 22 Q80 10 100 6 L190 6 Q210 8 220 22 Z" fill="url(#carRoof)" />
            <path d="M88 21 Q92 10 106 8 L150 8 L148 21 Z" fill="rgba(34,211,238,0.35)" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
            <path d="M152 8 L190 8 Q206 10 215 21 L155 21 Z" fill="rgba(34,211,238,0.25)" stroke="rgba(34,211,238,0.5)" strokeWidth="1" />
            <line x1="22" y1="44" x2="268" y2="44" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <circle cx="72" cy="58" r="18" fill="#1e293b" />
            <circle cx="72" cy="58" r="12" fill="#334155" />
            <circle cx="72" cy="58" r="5" fill="#64748b" />
            <line x1="72" y1="47" x2="72" y2="51" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="78.9" y1="49.5" x2="76.1" y2="52.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="81" y1="58" x2="77" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="78.9" y1="66.5" x2="76.1" y2="63.7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="72" y1="69" x2="72" y2="65" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65.1" y1="66.5" x2="67.9" y2="63.7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="63" y1="58" x2="67" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="65.1" y1="49.5" x2="67.9" y2="52.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="210" cy="58" r="18" fill="#1e293b" />
            <circle cx="210" cy="58" r="12" fill="#334155" />
            <circle cx="210" cy="58" r="5" fill="#64748b" />
            <line x1="210" y1="47" x2="210" y2="51" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="216.9" y1="49.5" x2="214.1" y2="52.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="219" y1="58" x2="215" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="216.9" y1="66.5" x2="214.1" y2="63.7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="210" y1="69" x2="210" y2="65" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="203.1" y1="66.5" x2="205.9" y2="63.7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="201" y1="58" x2="205" y2="58" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="203.1" y1="49.5" x2="205.9" y2="52.3" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <rect x="262" y="36" width="16" height="10" rx="3" fill="#e0f2fe" opacity="0.95" />
            <ellipse cx="272" cy="41" rx="18" ry="10" fill="rgba(224,242,254,0.20)" />
            <ellipse cx="285" cy="41" rx="28" ry="8" fill="rgba(148,210,255,0.12)" />
            <defs>
              <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              <linearGradient id="carRoof" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </section>

      {/* Wave divider: hero escuro → about claro */}
      <div className="sh-wave" style={{ background: 'white', marginTop: '-1px' }}>
        <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '72px' }}>
          <path d="M0,0 C360,72 720,0 1080,48 C1260,72 1380,36 1440,24 L1440,0 Z" fill="#070c1b" />
        </svg>
      </div>

      {/* ── ABOUT ── */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="sh-orb w-96 h-96 bg-indigo-200/30 top-0 -right-24 opacity-40" style={{ position: 'absolute' }} aria-hidden="true" />
        <div className="sh-orb w-72 h-72 bg-purple-200/20 bottom-0 -left-16 opacity-30" style={{ position: 'absolute' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16 sh-reveal">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full border border-indigo-200/80 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              Quem somos
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Sobre{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Nós</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0,4 Q50,0 100,4" stroke="url(#underline-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — text */}
            <div className="sh-reveal sh-reveal-delay-1">
              <div className="sh-gradient-border p-8 md:p-10 shadow-xl shadow-indigo-500/5">
                <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                  {config.about_text}
                </p>
              </div>

              {/* Feature bullets */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', label: 'Gestão Completa', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
                  { icon: '🔬', label: 'Tecnologia Avançada', color: 'bg-purple-50 border-purple-100 text-purple-700' },
                  { icon: '🛡️', label: 'Suporte 24/7', color: 'bg-blue-50 border-blue-100 text-blue-700' },
                ].map((f) => (
                  <div key={f.label} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${f.color} shadow-sm`}>
                    <span className="text-xl leading-none">{f.icon}</span>
                    <span className="text-sm font-semibold">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — decorative visual */}
            <div className="sh-reveal sh-reveal-delay-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-2xl scale-110" aria-hidden="true" />
                {/* Main card */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl shadow-indigo-500/30">
                  {/* Dots grid decoration */}
                  <div className="absolute inset-0 opacity-10 rounded-3xl overflow-hidden" aria-hidden="true"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                  <div className="relative space-y-5">
                    {[
                      { label: 'Motoristas cadastrados', value: '1.240+', bar: 'w-4/5' },
                      { label: 'Veículos monitorados', value: '860+', bar: 'w-3/5' },
                      { label: 'Denúncias processadas', value: '320+', bar: 'w-2/5' },
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-100 text-xs font-medium">{stat.label}</span>
                          <span className="text-white text-sm font-bold">{stat.value}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r from-white/70 to-indigo-200 ${stat.bar}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
                    {[
                      { val: '99%', label: 'Uptime' },
                      { val: '< 1s', label: 'Resposta' },
                      { val: '24/7', label: 'Suporte' },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="text-white font-black text-lg">{s.val}</div>
                        <div className="text-indigo-200 text-xs">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CADASTROS ── */}
      <section id="cadastro" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f2ff 0%, #fafafa 50%, #f5f0ff 100%)' }}>
        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-40" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
        <div className="sh-orb w-80 h-80 bg-indigo-300/20 top-10 -left-20 opacity-50" style={{ position: 'absolute' }} aria-hidden="true" />
        <div className="sh-orb w-64 h-64 bg-purple-300/20 bottom-10 -right-16 opacity-40" style={{ position: 'absolute' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16 sh-reveal">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 bg-white px-5 py-2 rounded-full border border-indigo-200/80 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
              Cadastros
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Solicite um{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Cadastro</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Registre motoristas e veículos com agilidade — tudo em poucos passos.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card Motorista */}
            <button
              onClick={() => setIsDriverDialogOpen(true)}
              className="group text-left bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 p-8 overflow-hidden relative"
            >
              {/* Step number */}
              <span className="absolute top-6 right-7 text-5xl font-black text-indigo-50 select-none leading-none" aria-hidden="true">01</span>

              {/* Icon */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                <User className="w-7 h-7 text-white" />
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" aria-hidden="true" />
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3">
                Cadastrar Motorista
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-7">
                Solicite o cadastro de um novo condutor para a frota. Processo rápido, seguro e totalmente digital.
              </p>

              {/* CTA */}
              <div className="inline-flex items-center gap-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 rounded-2xl shadow-md shadow-indigo-500/25 group-hover:gap-4 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
                Iniciar cadastro
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            {/* Card Veículo */}
            <button
              onClick={() => setIsVehicleDialogOpen(true)}
              className="group text-left bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 p-8 overflow-hidden relative sh-reveal sh-reveal-delay-1"
            >
              {/* Step number */}
              <span className="absolute top-6 right-7 text-5xl font-black text-emerald-50 select-none leading-none" aria-hidden="true">02</span>

              {/* Icon */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Car className="w-7 h-7 text-white" />
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" aria-hidden="true" />
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-3">
                Cadastrar Veículo
              </h3>
              <p className="text-base text-gray-500 leading-relaxed mb-7">
                Adicione um novo veículo à frota com todos os dados necessários de forma simples e organizada.
              </p>

              {/* CTA */}
              <div className="inline-flex items-center gap-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 rounded-2xl shadow-md shadow-emerald-500/25 group-hover:gap-4 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300">
                Iniciar cadastro
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── DENÚNCIAS ── */}
      <section id="denuncias" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        {/* Background decoration orbs */}
        <div className="sh-orb w-96 h-96 opacity-20 top-0 -right-32" style={{ position: 'absolute', background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)' }} aria-hidden="true" />
        <div className="sh-orb w-80 h-80 opacity-15 bottom-0 -left-24" style={{ position: 'absolute', background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)' }} aria-hidden="true" />

        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16 sh-reveal">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-5 py-2 rounded-full border border-orange-500/25 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block animate-pulse" />
              Denúncias
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Canal de{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Denúncias</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Sua contribuição torna o trânsito mais seguro para todos. Denuncie com sigilo e responsabilidade.
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[
              {
                num: '01',
                title: 'Identifique a placa',
                desc: 'Anote a placa do veículo envolvido na situação irregular.',
                color: 'from-orange-500 to-amber-500',
                glow: 'rgba(249,115,22,0.25)',
              },
              {
                num: '02',
                title: 'Escolha o tipo',
                desc: 'Selecione a categoria: excesso de velocidade, direção perigosa, etc.',
                color: 'from-red-500 to-orange-500',
                glow: 'rgba(239,68,68,0.25)',
              },
              {
                num: '03',
                title: 'Descreva o ocorrido',
                desc: 'Informe data, local e detalhes das circunstâncias do ocorrido.',
                color: 'from-violet-500 to-purple-500',
                glow: 'rgba(139,92,246,0.25)',
              },
              {
                num: '04',
                title: 'Envie com sigilo',
                desc: 'Você pode denunciar de forma anônima ou identificada.',
                color: 'from-indigo-500 to-blue-500',
                glow: 'rgba(99,102,241,0.25)',
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className={`sh-reveal sh-reveal-delay-${i + 1} relative p-6 rounded-3xl sh-dark-glass hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`}
                style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px ${step.glow}` }}
              >
                {/* Number */}
                <div className={`text-4xl font-black mb-4 sh-step-num bg-gradient-to-br ${step.color} bg-clip-text`}
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Warning note */}
          <div className="sh-reveal max-w-2xl mx-auto mb-12">
            <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-white">Importante:</strong> Todas as denúncias são analisadas pela equipe responsável.
                Denúncias falsas podem ser enquadradas como crime de denunciação caluniosa.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="sh-reveal flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setIsComplaintDialogOpen(true)}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <AlertTriangle className="w-5 h-5" />
              Fazer Denúncia
              <svg className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => setIsCheckComplaintDialogOpen(true)}
              className="group inline-flex items-center gap-3 text-slate-200 hover:text-white px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <FileText className="w-5 h-5 opacity-70" />
              Consultar Denúncia
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTATO ── */}
      <section id="contato" className="py-24 bg-white relative overflow-hidden">
        <div className="sh-orb w-96 h-96 bg-indigo-100/60 -top-16 -right-32 opacity-70" style={{ position: 'absolute' }} aria-hidden="true" />
        <div className="sh-orb w-64 h-64 bg-emerald-100/50 bottom-0 -left-16 opacity-60" style={{ position: 'absolute' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16 sh-reveal">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-200/80 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Contato
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Fale{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Conosco</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Estamos prontos para atender você pelo canal que preferir.
            </p>
          </div>

          {/* Contact grid — 2x2 asymmetric */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* WhatsApp — destaque principal */}
            <a
              href={formatWhatsAppLink(config.whatsapp, 'Olá! Gostaria de saber mais sobre os serviços.')}
              target="_blank"
              rel="noopener noreferrer"
              className="group lg:col-span-1 relative flex flex-col justify-between p-8 rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 sh-reveal"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)' }}
            >
              {/* Pulsing ring behind icon */}
              <div className="relative w-16 h-16 mb-6">
                <span className="absolute inset-0 rounded-2xl bg-white/30 sh-whatsapp-ping" aria-hidden="true" />
                <div className="relative w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">WhatsApp</div>
                <div className="text-white text-xl font-black mb-1">Conversa instantânea</div>
                <div className="text-emerald-100 text-sm mb-6">Atendimento rápido pelo WhatsApp. Clique para iniciar agora.</div>
              </div>

              <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-2xl transition-colors backdrop-blur-sm w-fit">
                Iniciar conversa
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" aria-hidden="true" />
              <div className="absolute -bottom-12 -right-4 w-40 h-40 rounded-full bg-white/5" aria-hidden="true" />
            </a>

            {/* Right column — 3 cards stacked */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Telefone */}
              <a
                href={`tel:${config.phone.replace(/\D/g, '')}`}
                className="group flex flex-col gap-5 p-7 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 sh-reveal sh-reveal-delay-1"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5">Telefone</div>
                  <div className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{formatPhoneDisplay(config.phone)}</div>
                  <div className="text-sm text-gray-400 mt-1">Ligue para nós</div>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${config.email}`}
                className="group flex flex-col gap-5 p-7 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-black/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 sh-reveal sh-reveal-delay-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5">E-mail</div>
                  <div className="text-base font-black text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{config.email}</div>
                  <div className="text-sm text-gray-400 mt-1">Envie uma mensagem</div>
                </div>
              </a>

              {/* Endereço — full width on the right */}
              <div className="sm:col-span-2 flex items-center gap-6 p-7 bg-gradient-to-br from-slate-50 to-gray-50 rounded-3xl border border-gray-100 shadow-xl shadow-black/5 sh-reveal sh-reveal-delay-3">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1.5">Endereço</div>
                  <div className="text-base font-black text-gray-900">{config.address}</div>
                  <div className="text-sm text-gray-400 mt-1">Nossa localização</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#070c1b' }} className="relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
        />
        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent)' }} aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          <div className="flex flex-col items-center gap-6">
            {/* Logo / company name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black sh-footer-logo tracking-tight">{config.company_name}</span>
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} aria-hidden="true" />

            {/* Links + copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-slate-500">
              <span>© {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</span>
              <span className="hidden sm:inline text-slate-700" aria-hidden="true">·</span>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200"
              >
                <LogIn className="w-3.5 h-3.5" />
                Área Restrita
              </Link>
            </div>
          </div>
        </div>
      </footer>

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

      <footer className="bg-gradient-to-br from-gray-900 to-indigo-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">{config.company_name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {config.about_text}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Links Rápidos</h3>
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
                      className="text-sm text-gray-400 hover:text-indigo-300 transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Siga-nos</h3>
              <div className="flex gap-3">
                {config.facebook_url && (
                  <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="sidebar-logo-gradient text-white rounded-xl p-2 hover:opacity-80 transition-opacity">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {config.instagram_url && (
                  <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="sidebar-logo-gradient text-white rounded-xl p-2 hover:opacity-80 transition-opacity">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {config.linkedin_url && (
                  <a href={config.linkedin_url} target="_blank" rel="noopener noreferrer" className="sidebar-logo-gradient text-white rounded-xl p-2 hover:opacity-80 transition-opacity">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
