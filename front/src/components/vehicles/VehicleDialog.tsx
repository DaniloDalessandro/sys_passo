"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vehicle } from "@/hooks/useVehicles";

const vehicleSchema = z.object({
  placa: z.string().min(1, "Placa é obrigatória"),
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  ano: z.number().min(1900, "Ano inválido").max(new Date().getFullYear() + 1, "Ano inválido"),
  cor: z.string().min(1, "Cor é obrigatória"),
  chassi: z.string().min(1, "Chassi é obrigatório"),
  renavam: z.string().min(1, "RENAVAM é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  combustivel: z.string().min(1, "Combustível é obrigatório"),
  capacidade: z.string().min(1, "Capacidade é obrigatória"),
  proprietario: z.string().min(1, "Proprietário é obrigatório"),
  status: z.enum(["ativo", "manutencao", "inativo"]),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onSubmit: (data: VehicleFormData) => void;
  isLoading?: boolean;
}

export function VehicleDialog({
  open,
  onOpenChange,
  vehicle,
  onSubmit,
  isLoading = false,
}: VehicleDialogProps) {
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      placa: "",
      marca: "",
      modelo: "",
      ano: new Date().getFullYear(),
      cor: "",
      chassi: "",
      renavam: "",
      categoria: "",
      combustivel: "",
      capacidade: "",
      proprietario: "",
      status: "ativo",
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        ano: vehicle.ano,
        cor: vehicle.cor,
        chassi: vehicle.chassi,
        renavam: vehicle.renavam,
        categoria: vehicle.categoria,
        combustivel: vehicle.combustivel,
        capacidade: vehicle.capacidade,
        proprietario: vehicle.proprietario,
        status: vehicle.status as "ativo" | "manutencao" | "inativo",
      });
    } else {
      form.reset({
        placa: "",
        marca: "",
        modelo: "",
        ano: new Date().getFullYear(),
        cor: "",
        chassi: "",
        renavam: "",
        categoria: "",
        combustivel: "",
        capacidade: "",
        proprietario: "",
        status: "ativo",
      });
    }
  }, [vehicle, form]);

  const handleSubmit = (data: VehicleFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mercedes-Benz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Sprinter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2024"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Branco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Van">Van</SelectItem>
                          <SelectItem value="Caminhão">Caminhão</SelectItem>
                          <SelectItem value="Ônibus">Ônibus</SelectItem>
                          <SelectItem value="Carreta">Carreta</SelectItem>
                          <SelectItem value="Carro">Carro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="combustivel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustível *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o combustível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Gasolina">Gasolina</SelectItem>
                          <SelectItem value="Etanol">Etanol</SelectItem>
                          <SelectItem value="Flex">Flex</SelectItem>
                          <SelectItem value="GNV">GNV</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade *</FormLabel>
                      <FormControl>
                        <Input placeholder="16 lugares" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="manutencao">Em Manutenção</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Documentação */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chassi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassi *</FormLabel>
                      <FormControl>
                        <Input placeholder="9BW123456789ABC01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renavam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RENAVAM *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Proprietário */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Proprietário</h3>
              <FormField
                control={form.control}
                name="proprietario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proprietário *</FormLabel>
                    <FormControl>
                      <Input placeholder="Empresa XYZ Ltda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : vehicle ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}