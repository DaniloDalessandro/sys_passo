"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelect = (value: string) => {
    console.log('Selecionando valor:', value);
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value];
    console.log('Novos selecionados:', newSelected);
    onChange(newSelected);
  };

  const handleUnselect = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Removendo valor:', value);
    onChange(selected.filter((s) => s !== value));
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          console.log('Toggle dropdown, open:', !open);
          setOpen(!open);
        }}
        className="w-full min-h-[2.5rem] h-auto px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex gap-1 flex-wrap flex-1">
          {selected.length > 0 ? (
            selected.map((value) => {
              const option = options.find((opt) => opt.value === value);
              return (
                <Badge
                  variant="secondary"
                  key={value}
                  className="mr-1 mb-1"
                >
                  {option?.label}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none hover:bg-gray-500/20"
                    onClick={(e) => handleUnselect(value, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`ml-2 h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              placeholder="Buscar condutor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Nenhum resultado encontrado.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`
                      relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
                      hover:bg-gray-100
                      ${isSelected ? "bg-gray-50" : ""}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center border rounded">
                      {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                    </div>
                    <span>{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
