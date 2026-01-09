"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthYearCalendarProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  isActive?: boolean
}

export function MonthYearCalendar({
  month,
  year,
  onMonthChange,
  onYearChange,
  isActive = false,
}: MonthYearCalendarProps) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 2024 + 1 }, (_, i) => 2024 + i)

  const date = new Date(year, month)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={"outline"}
            className={cn(
              "w-fit justify-start text-left font-normal transition-colors rounded-4xl",
              isActive 
                ? "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 text-blue-900" 
                : "bg-white border-zinc-200",
              !date && "text-muted-foreground"
            )}
          />
        }
      >
        <CalendarIcon className={cn("mr-2 h-4 w-4", isActive ? "text-blue-500" : "text-zinc-400")} />
        {date ? (
          <span className="">
            {format(date, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        ) : (
          <span>Selecione o mês/ano</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <Select
              value={year.toString()}
              onValueChange={(v) => onYearChange(parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m, index) => (
              <Button
                key={m}
                variant={month === index ? "default" : "ghost"}
                size="sm"
                className="text-xs"
                onClick={() => onMonthChange(index)}
              >
                {m.substring(0, 3)}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
