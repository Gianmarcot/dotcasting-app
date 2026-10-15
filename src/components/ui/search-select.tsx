import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from "./command";

export interface SearchSelectOption { value: string; label: string }

/** Search and multi-value selection are comboboxes, never nested Radix Selects. */
export function SearchSelect({ label, options, values, onValuesChange, multiple = false, disabled = false }: {
  label: string;
  options: SearchSelectOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === values[0]);
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      {/* Campo nativo: nessun Button, le sue utility sovrascriverebbero .dc-select-trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        data-placeholder={values.length === 0 ? "" : undefined}
        className="dc-select-trigger w-full justify-between"
      >
        <span className="truncate">{multiple && values.length ? `${values.length} selezionati` : selected?.label ?? label}</span>
        <ChevronDown className="h-5 w-5 shrink-0" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)]">
      <Command className="dc-menu-flat">
        <CommandInput aria-label={`Cerca: ${label}`} placeholder="Cerca…" />
        <CommandList>
          <CommandEmpty>Nessun risultato</CommandEmpty>
          {options.map((option) => {
            const checked = values.includes(option.value);
            return <CommandItem key={option.value} value={option.label} data-state={checked ? "checked" : "unchecked"} onSelect={() => {
              onValuesChange(multiple ? checked ? values.filter((value) => value !== option.value) : [...values, option.value] : [option.value]);
              if (!multiple) setOpen(false);
            }}>
              <span>{option.label}</span>
              {multiple ? <span className="dc-menu-indicator" aria-label={checked ? "Selezionato" : "Non selezionato"}>
                <span className="dc-menu-check-box">{checked && <Check className="h-4 w-4" />}</span>
              </span> : checked && <Check className="dc-menu-indicator" />}
            </CommandItem>;
          })}
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>;
}