"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {PieChart, Pie, Cell, Sector} from "recharts"
import {PieSectorDataItem} from "recharts/types/polar/Pie"
import * as LucideIcons from "lucide-react"
import {useEffect, useState, useMemo} from "react"
import {getCategorySpending} from "./category-actions"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"

interface CategorySummaryProps {
	month: number
	year: number
}

interface CategorySpending {
	name: string
	value: number
	color: string
	icon: string
	percentage: number
}

export function CategorySummary({month, year}: CategorySummaryProps) {
	const [data, setData] = useState<CategorySpending[]>([])

	useEffect(() => {
		let cancelled = false
		async function loadData() {
			const spending = await getCategorySpending(month, year)
			if (cancelled) return
			setData(spending as CategorySpending[])
		}

		loadData()
		return () => { cancelled = true }
	}, [month, year])

	const chartConfig = useMemo(() => {
		const config: ChartConfig = {
			value: {
				label: "Valor",
			},
		}
		data.forEach((item) => {
			config[item.name] = {
				label: item.name,
				color: item.color,
			}
		})
		return config
	}, [data])

	// A categoria com maior valor já vem primeiro devido ao .sort((a, b) => b.value - a.value) no category-actions.ts
	const activeIndex = data.length > 0 ? 0 : -1

	const IconComponent = ({name, className}: { name: string, className?: string }) => {
		const LucideIcon = (LucideIcons as any)[name] || LucideIcons.HelpCircle
		return <LucideIcon className={className}/>
	}

	return (
		<Card className="h-fit sticky top-8 bg-white shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg font-bold">Gastos por Categoria</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 flex flex-col gap-6">
				<div className="h-[250px] w-full">
					<ChartContainer
						config={chartConfig}
						className="mx-auto aspect-square max-h-[250px]"
					>
						<PieChart>
							<ChartTooltip
								cursor={false}
								content={
									<ChartTooltipContent
										hideLabel
										formatter={(value) => (
											<div className="flex items-center gap-2 font-medium">
												R$ {Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
											</div>
										)}
									/>
								}
							/>
							<Pie
								data={data}
								dataKey="value"
								nameKey="name"
								innerRadius={60}
								strokeWidth={5}
								activeIndex={activeIndex}
								activeShape={({
									              outerRadius = 0,
									              ...props
								              }: PieSectorDataItem) => (
									<Sector {...props} outerRadius={outerRadius + 10}/>
								)}
							>
								{data.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color}/>
								))}
							</Pie>
						</PieChart>
					</ChartContainer>
				</div>

				<div className="space-y-6 h-fit">
					{data.map((category, index) => (
						<div key={index} className="space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										className="p-2 rounded-lg"
										style={{backgroundColor: `${category.color}20`, color: category.color}}
									>
										<IconComponent name={category.icon} className="h-4 w-4"/>
									</div>
									<div>
										<p className="text-sm font-medium">{category.name}</p>
										<p className="text-xs text-muted-foreground">{category.percentage.toFixed(0)}%
											do total</p>
									</div>
								</div>
								<p className="text-sm font-semibold">
									R$ {category.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
								</p>
							</div>
							<Progress
								value={category.percentage}
								className="h-3"
								style={{
									// @ts-ignore
									'--progress-foreground': category.color
								}}
							/>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
