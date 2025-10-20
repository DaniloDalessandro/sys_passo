"use client";
import { ConductorForm } from "@/components/conductors/conductor-form";
import { useConductors } from "@/hooks/useConductors";
import { Conductor } from "@/types/conductor";
import { useRouter } from "next/navigation";

export default function RegisterConductor() {
  const { createConductor } = useConductors();
  const router = useRouter();

  const handleSubmit = async (data: Partial<Conductor>) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      const value = data[key as keyof typeof data];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    await createConductor(formData);
    router.push("/conductors");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Novo Condutor</h1>
      <ConductorForm onSubmit={handleSubmit} />
    </div>
  );
}