'use client';

import { useEffect, useState } from 'react';
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
  CreditCard
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
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

// Zod validation schemas
const driverSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cnhNumber: z.string().min(5, 'Número da CNH é obrigatório'),
  cnhCategory: z.string().min(1, 'Categoria da CNH é obrigatória'),
  message: z.string().optional(),
});

const vehicleSchema = z.object({
  plate: z.string()
    .min(7, 'Placa deve ter 7 caracteres')
    .max(7, 'Placa deve ter 7 caracteres')
    .toUpperCase(),
  brand: z.string().min(2, 'Marca é obrigatória'),
  model: z.string().min(2, 'Modelo é obrigatório'),
  year: z.string()
    .regex(/^\d{4}$/, 'Ano deve ter 4 dígitos')
    .refine((val) => {
      const year = parseInt(val);
      return year >= 1900 && year <= new Date().getFullYear() + 1;
    }, 'Ano inválido'),
  color: z.string().min(3, 'Cor é obrigatória'),
  fuelType: z.string().min(1, 'Tipo de combustível é obrigatório'),
  message: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function SiteHomePage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);

  // Driver form
  const driverForm = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      fullName: '',
      cpf: '',
      email: '',
      phone: '',
      cnhNumber: '',
      cnhCategory: '',
      message: '',
    },
  });

  // Vehicle form
  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      fuelType: '',
      message: '',
    },
  });

  // Fetch site configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/site/configuration/`);
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

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Driver form submission
  const onDriverSubmit = async (data: DriverFormData) => {
    try {
      console.log('Driver registration data:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Solicitação de cadastro enviada com sucesso!', {
        description: 'Entraremos em contato em breve para concluir o cadastro.',
      });

      driverForm.reset();
      setIsDriverDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao enviar solicitação', {
        description: 'Por favor, tente novamente mais tarde.',
      });
    }
  };

  // Vehicle form submission
  const onVehicleSubmit = async (data: VehicleFormData) => {
    try {
      console.log('Vehicle registration data:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Solicitação de cadastro enviada com sucesso!', {
        description: 'Entraremos em contato em breve para concluir o cadastro.',
      });

      vehicleForm.reset();
      setIsVehicleDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao enviar solicitação', {
        description: 'Por favor, tente novamente mais tarde.',
      });
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {config.logo_url ? (
                <Image
                  src={config.logo_url}
                  alt={config.company_name}
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">
                    {config.company_name}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('servicos')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Serviços
              </button>
              <button
                onClick={() => scrollToSection('cadastro')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Cadastro
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Sobre
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contato
              </button>
              <Link href="/auth/login">
                <Button variant="default" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('servicos')}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Serviços
                </button>
                <button
                  onClick={() => scrollToSection('cadastro')}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cadastro
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sobre
                </button>
                <button
                  onClick={() => scrollToSection('contato')}
                  className="text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Contato
                </button>
                <Link href="/auth/login" className="px-4 py-2">
                  <Button variant="default" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white pt-32">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {config.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
              {config.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={formatWhatsAppLink(
                  config.whatsapp,
                  'Olá! Gostaria de saber mais sobre os serviços da ' + config.company_name
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Fale Conosco
              </a>
              <button
                onClick={() => scrollToSection('about')}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 border border-white/30"
              >
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      {/* Features/Services Section */}
      <section id="servicos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Truck,
                title: 'Controle de Frota',
                description: 'Gerencie todos os seus veículos em um só lugar'
              },
              {
                icon: Users,
                title: 'Gestão de Motoristas',
                description: 'Acompanhe e organize sua equipe de condutores'
              },
              {
                icon: Shield,
                title: 'Segurança Total',
                description: 'Dados protegidos e sistema confiável'
              },
              {
                icon: BarChart3,
                title: 'Relatórios Completos',
                description: 'Análises detalhadas para melhor tomada de decisão'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section id="cadastro" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solicite Seu Cadastro
            </h2>
            <p className="text-xl text-gray-600">
              Cadastre motoristas e veículos de forma rápida e fácil
            </p>
            <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Driver Registration Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-500">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                  <User className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">Cadastrar Motorista</CardTitle>
                <CardDescription className="text-base">
                  Solicite o cadastro de um novo condutor na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsDriverDialogOpen(true)}
                  className="w-full gap-2 text-base py-6"
                  size="lg"
                >
                  <User className="w-5 h-5" />
                  Solicitar Cadastro de Motorista
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Registration Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-blue-500">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                  <Car className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <CardTitle className="text-2xl">Cadastrar Veículo</CardTitle>
                <CardDescription className="text-base">
                  Solicite o cadastro de um novo veículo na frota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setIsVehicleDialogOpen(true)}
                  className="w-full gap-2 text-base py-6"
                  size="lg"
                >
                  <Car className="w-5 h-5" />
                  Solicitar Cadastro de Veículo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Driver Registration Dialog */}
      <Dialog open={isDriverDialogOpen} onOpenChange={setIsDriverDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="w-6 h-6 text-blue-600" />
              Cadastro de Motorista
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para solicitar o cadastro de um novo motorista.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={driverForm.handleSubmit(onDriverSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo *
              </Label>
              <Input
                id="fullName"
                placeholder="Digite o nome completo"
                {...driverForm.register('fullName')}
              />
              {driverForm.formState.errors.fullName && (
                <p className="text-sm text-red-600">
                  {driverForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                CPF *
              </Label>
              <Input
                id="cpf"
                placeholder="00000000000"
                maxLength={11}
                {...driverForm.register('cpf')}
              />
              {driverForm.formState.errors.cpf && (
                <p className="text-sm text-red-600">
                  {driverForm.formState.errors.cpf.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                {...driverForm.register('email')}
              />
              {driverForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {driverForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefone *
              </Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                {...driverForm.register('phone')}
              />
              {driverForm.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {driverForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnhNumber" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Número da CNH *
                </Label>
                <Input
                  id="cnhNumber"
                  placeholder="00000000000"
                  {...driverForm.register('cnhNumber')}
                />
                {driverForm.formState.errors.cnhNumber && (
                  <p className="text-sm text-red-600">
                    {driverForm.formState.errors.cnhNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnhCategory" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Categoria CNH *
                </Label>
                <Select
                  onValueChange={(value) => driverForm.setValue('cnhCategory', value)}
                >
                  <SelectTrigger id="cnhCategory">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
                {driverForm.formState.errors.cnhCategory && (
                  <p className="text-sm text-red-600">
                    {driverForm.formState.errors.cnhCategory.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverMessage" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Mensagem / Observações
              </Label>
              <Textarea
                id="driverMessage"
                placeholder="Informações adicionais (opcional)"
                rows={3}
                {...driverForm.register('message')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDriverDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={driverForm.formState.isSubmitting}
              >
                {driverForm.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vehicle Registration Dialog */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Car className="w-6 h-6 text-blue-600" />
              Cadastro de Veículo
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para solicitar o cadastro de um novo veículo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="plate" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Placa do Veículo *
              </Label>
              <Input
                id="plate"
                placeholder="ABC1D23"
                maxLength={7}
                {...vehicleForm.register('plate')}
                className="uppercase"
              />
              {vehicleForm.formState.errors.plate && (
                <p className="text-sm text-red-600">
                  {vehicleForm.formState.errors.plate.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Marca *
                </Label>
                <Input
                  id="brand"
                  placeholder="Ex: Volkswagen"
                  {...vehicleForm.register('brand')}
                />
                {vehicleForm.formState.errors.brand && (
                  <p className="text-sm text-red-600">
                    {vehicleForm.formState.errors.brand.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Modelo *
                </Label>
                <Input
                  id="model"
                  placeholder="Ex: Gol"
                  {...vehicleForm.register('model')}
                />
                {vehicleForm.formState.errors.model && (
                  <p className="text-sm text-red-600">
                    {vehicleForm.formState.errors.model.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ano *
                </Label>
                <Input
                  id="year"
                  placeholder="2024"
                  maxLength={4}
                  {...vehicleForm.register('year')}
                />
                {vehicleForm.formState.errors.year && (
                  <p className="text-sm text-red-600">
                    {vehicleForm.formState.errors.year.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Cor *
                </Label>
                <Input
                  id="color"
                  placeholder="Ex: Branco"
                  {...vehicleForm.register('color')}
                />
                {vehicleForm.formState.errors.color && (
                  <p className="text-sm text-red-600">
                    {vehicleForm.formState.errors.color.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuelType" className="flex items-center gap-2">
                <Fuel className="w-4 h-4" />
                Tipo de Combustível *
              </Label>
              <Select
                onValueChange={(value) => vehicleForm.setValue('fuelType', value)}
              >
                <SelectTrigger id="fuelType">
                  <SelectValue placeholder="Selecione o tipo de combustível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasolina</SelectItem>
                  <SelectItem value="ethanol">Etanol</SelectItem>
                  <SelectItem value="flex">Flex</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Elétrico</SelectItem>
                  <SelectItem value="hybrid">Híbrido</SelectItem>
                </SelectContent>
              </Select>
              {vehicleForm.formState.errors.fuelType && (
                <p className="text-sm text-red-600">
                  {vehicleForm.formState.errors.fuelType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleMessage" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Mensagem / Observações
              </Label>
              <Textarea
                id="vehicleMessage"
                placeholder="Informações adicionais (opcional)"
                rows={3}
                {...vehicleForm.register('message')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVehicleDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={vehicleForm.formState.isSubmitting}
              >
                {vehicleForm.formState.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitação'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sobre a {config.company_name}
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {config.about_text}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Entre em Contato
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <a
                  href={`tel:${config.phone.replace(/\D/g, '')}`}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors duration-200 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefone</h3>
                    <p className="text-gray-600">{formatPhoneDisplay(config.phone)}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${config.email}`}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-white transition-colors duration-200 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">E-mail</h3>
                    <p className="text-gray-600">{config.email}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Endereço</h3>
                    <p className="text-gray-600">{config.address}</p>
                  </div>
                </div>

                <a
                  href={formatWhatsAppLink(
                    config.whatsapp,
                    'Olá! Gostaria de saber mais sobre os serviços.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="text-gray-600">Clique para conversar</p>
                  </div>
                </a>
              </div>

              {/* Call to Action Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
                <p className="mb-6 text-blue-100">
                  Entre em contato conosco e descubra como podemos ajudar sua empresa
                  a ter mais eficiência e controle sobre sua frota.
                </p>
                <a
                  href={formatWhatsAppLink(
                    config.whatsapp,
                    'Olá! Gostaria de uma demonstração do sistema.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
                >
                  Solicitar Demonstração
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">{config.company_name}</h3>
                <p className="text-gray-400">
                  Gestão Inteligente de Frotas e Veículos
                </p>
              </div>

              {/* Social Media Links */}
              {(config.facebook_url || config.instagram_url || config.linkedin_url) && (
                <div className="flex gap-4">
                  {config.facebook_url && (
                    <a
                      href={config.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {config.instagram_url && (
                    <a
                      href={config.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {config.linkedin_url && (
                    <a
                      href={config.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
