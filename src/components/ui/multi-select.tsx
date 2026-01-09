"use client"

import * as React from "react"
import { ChevronDown, X } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface MultiSelectOption {
  label: string
  value: string
  icon?: string | React.ElementType
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  label?: string
  icon?: React.ElementType
  disableScroll?: boolean
  width?: string
}

const IconRenderer = ({ icon, className }: { icon: string | React.ElementType, className?: string }) => {
  if (typeof icon === 'string') {
    const LucideIcon = (LucideIcons as any)[icon] || LucideIcons.HelpCircle
    return <LucideIcon className={className} />
  }
  const Icon = icon
  return <Icon className={className} />
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecionar...",
  label,
  icon: Icon,
  disableScroll = false,
  width,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((s) => s !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const isSelected = selected.length > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 w-fit justify-between px-3 transition-colors font-normal rounded-4xl",
              isSelected 
                ? "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-900" 
                : "bg-white border-zinc-200"
            )}
          />
        }
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={cn("h-4 w-4", isSelected ? "text-blue-500" : "text-zinc-400")} />}
          <span className="text-sm">
            {label || placeholder}
            {isSelected && (
              <span className="ml-1 text-blue-600/70 font-medium">
                ({selected.length})
              </span>
            )}
          </span>
        </div>
        <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", isSelected && "text-blue-500 opacity-100")} />
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("p-0 rounded-2xl overflow-hidden", width || "w-[250px]")}>
        <Command>
          <CommandList className={cn(disableScroll && "max-h-none overflow-y-visible")}>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isOptionSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleToggle(option.value)}
                    data-checked={isOptionSelected}
                    className={cn(
                      "flex items-center justify-between w-full cursor-pointer py-1.5",
                      isOptionSelected && "bg-zinc-50 data-selected:bg-zinc-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <IconRenderer 
                          icon={option.icon} 
                          className="h-4 w-4 text-muted-foreground"
                        />
                      )}
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
