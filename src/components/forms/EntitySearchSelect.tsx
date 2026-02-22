import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface EntitySearchSelectOption {
  id: string;
  label: string;
  sublabel?: string;
  raw?: Record<string, unknown>;
}

interface EntitySearchSelectProps {
  value: string;
  onValueChange: (id: string, option?: EntitySearchSelectOption) => void;
  options: EntitySearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  getOptionLabel?: (opt: EntitySearchSelectOption) => string;
  getOptionValue?: (opt: EntitySearchSelectOption) => string;
}

export function EntitySearchSelect({
  value,
  onValueChange,
  options,
  placeholder = "Auswählen...",
  searchPlaceholder = "Suchen...",
  emptyText = "Keine Ergebnisse.",
  disabled = false,
  className,
  getOptionLabel = (o) => o.label,
  getOptionValue = (o) => o.id,
}: EntitySearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => getOptionValue(o) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? getOptionLabel(selected) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const optValue = getOptionValue(opt);
                const isSelected = value === optValue;
                return (
                  <CommandItem
                    key={opt.id}
                    value={getOptionLabel(opt)}
                    onSelect={() => {
                      onValueChange(isSelected ? "" : optValue, opt);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{getOptionLabel(opt)}</span>
                      {opt.sublabel && (
                        <span className="text-xs text-muted-foreground">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
