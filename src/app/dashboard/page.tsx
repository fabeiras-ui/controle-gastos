"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {TrendingUp, TrendingDown, Plus} from "lucide-react"
import {ExpenseTable} from "./expense-table"
import {useState, useEffect, Suspense} from "react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useSearchParams, useRouter, usePathname} from "next/navigation"

import { getExpensesByMonth, getDashboardData, getChartData, getStatusList, getCategories } from "./actions"
import type { Expense, Category } from "@/types"
import { CreateExpenseDialog } from "./create-expense-dialog"
import {ImportExpensesButton} from "./import-expenses-button"
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend} from 'recharts'
import {CategorySummary} from "./category-summary"
import {Checkbox} from "@/components/ui/checkbox"
import {Input} from "@/components/ui/input"
import {MultiSelect} from "@/components/ui/multi-select"
import {MonthYearCalendar} from "@/components/ui/month-year-calendar"
import {Filter, Search} from "lucide-react"
import { cn } from "@/lib/utils"

function DashboardContent() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const initialYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear()
	const initialMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth()

	const [selectedYear, setSelectedYear] = useState(initialYear)
	const [activeMonth, setActiveMonth] = useState(initialMonth)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [expenses, setExpenses] = useState<Expense[]>([])
	const [dashboardData, setDashboardData] = useState({totalGastos: 0, totalPrevisto: 0, percentageChange: 0, diffValue: 0, isHigher: false})
	const [chartFilter, setChartFilter] = useState("30days")
	const [chartData, setChartData] = useState<{ name: string, realizado: number, previsto: number }[]>([])
	const [showRealizado, setShowRealizado] = useState(true)
	const [showPrevisto, setShowPrevisto] = useState(true)

	const [searchTerm, setSearchTerm] = useState("")
	const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
	const [selectedCategories, setSelectedCategories] = useState<string[]>([])
	const [allStatuses, setAllStatuses] = useState<string[]>([]) // nomes apenas para filtros
	const [allCategories, setAllCategories] = useState<Category[]>([])

	const months = [
		"Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
		"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
	]

	const updateQueryParams = (month: number, year: number) => {
		const params = new URLSearchParams(searchParams.toString())
		params.set("month", month.toString())
		params.set("year", year.toString())
		router.push(`${pathname}?${params.toString()}`, { scroll: false })
	}

	const handleMonthChange = (m: number) => {
		setActiveMonth(m)
		updateQueryParams(m, selectedYear)
	}

	const handleYearChange = (y: number) => {
		setSelectedYear(y)
		updateQueryParams(activeMonth, y)
	}

	const loadExpenses = async () => {
		const data = await getExpensesByMonth(activeMonth, selectedYear)
		setExpenses(data)
		const dashData = await getDashboardData(activeMonth, selectedYear)
		setDashboardData(dashData)
	}

	const [categoryRefreshKey, setCategoryRefreshKey] = useState(0)

	const loadChartData = async () => {
		const data = await getChartData(chartFilter, selectedYear, activeMonth)
		setChartData(data)
	}

	const refreshData = async () => {
		setCategoryRefreshKey(prev => prev + 1)
		await Promise.all([
			loadExpenses(),
			loadChartData(),
			loadFilterOptions()
		])
	}

 const loadFilterOptions = async () => {
		const [statuses, cats] = await Promise.all([
			getStatusList(),
			getCategories()
		])
		setAllStatuses((statuses as any).map((s: any) => s.name))
		setAllCategories(cats)
	}

	useEffect(() => {
		let cancelled = false
		const load = async () => {
			const [data, dashData, statuses, cats] = await Promise.all([
				getExpensesByMonth(activeMonth, selectedYear),
				getDashboardData(activeMonth, selectedYear),
				getStatusList(),
				getCategories()
			])
			if (cancelled) return
			setExpenses(data as Expense[])
			setDashboardData(dashData)
			setAllStatuses((statuses as { name: string }[]).map(s => s.name))
			setAllCategories(cats as Category[])
		}
		load()
		return () => { cancelled = true }
	}, [activeMonth, selectedYear])

	useEffect(() => {
		let cancelled = false
		getChartData(chartFilter, selectedYear, activeMonth).then(data => {
			if (cancelled) return
			setChartData(data)
		})
		return () => { cancelled = true }
	}, [chartFilter, selectedYear, activeMonth])

	// Sincronizar estado local se a URL mudar (ex: navegação voltar/avançar)
	useEffect(() => {
		const yearParam = searchParams.get("year")
		const monthParam = searchParams.get("month")

		if (yearParam) {
			const y = parseInt(yearParam)
			setSelectedYear(prev => prev !== y ? y : prev)
		}
		if (monthParam) {
			const m = parseInt(monthParam)
			setActiveMonth(prev => prev !== m ? m : prev)
		}
	}, [searchParams])

	const filteredExpenses = expenses.filter(expense => {
		const matchesSearch = expense.descricao.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(expense.status)
		const categoryId = expense.type?.categoryRef?.id
		const matchesCategory = selectedCategories.length === 0 || (categoryId && selectedCategories.includes(categoryId.toString()))
		return matchesSearch && matchesStatus && matchesCategory
	})

	return (
		<div className="p-8 space-y-8">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold">Painel de Controle</h1>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
				<div className="xl:col-span-3 space-y-8">
					{/* 4 Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium text-zinc-500">Total Gastos</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL'
									}).format(dashboardData.totalGastos)}
								</div>
								<p className="text-xs text-zinc-400 mt-1">
									Previsto: {new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL'
									}).format(dashboardData.totalPrevisto)}
								</p>
								<p className="text-xs text-zinc-500 mt-4">
									Soma de todas as despesas pagas no mês.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium text-zinc-500">Variação Mensal</CardTitle>
								<div
									className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${dashboardData.isHigher ? 'text-red-900 bg-red-100' : 'text-green-900 bg-green-100'}`}>
									{dashboardData.isHigher ? <TrendingUp className="mr-1 h-3 w-3"/> :
										<TrendingDown className="mr-1 h-3 w-3"/>}
									{Math.abs(dashboardData.percentageChange).toFixed(1)}%
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{new Intl.NumberFormat('pt-BR', {
										style: 'currency',
										currency: 'BRL'
									}).format(dashboardData.diffValue)}
								</div>
								<p className="text-xs text-zinc-500 mt-4 flex items-center">
									{dashboardData.isHigher ? 'Aumento' : 'Redução'} em relação ao mês
									anterior {dashboardData.isHigher ? <TrendingUp className="ml-1 h-3 w-3"/> :
									<TrendingDown className="ml-1 h-3 w-3"/>}
								</p>
								<p className="text-xs text-zinc-400">Diferença em relação ao mês anterior</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium text-zinc-500">Quantidade Despesas</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold">
									{expenses.length}
								</div>
								<p className="text-xs text-zinc-400 mt-4">Total de itens registrados</p>
							</CardContent>
						</Card>
					</div>

					{/* Chart Section */}
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<div>
									<CardTitle className="text-lg font-bold">Evolução dos Gastos</CardTitle>
									<p className="text-sm text-zinc-500">
										{(() => {
											if (chartFilter === "30days") {
												return months[activeMonth]
											}
											if (chartData.length > 0) {
												// Se for 1 ano ou 6 meses, pegamos o primeiro e o último mês do chartData
												// Como o chartData tem labels curtas ('jan', 'fev'), vamos inferir a partir do período
												let monthsToSubtract = 0
												if (chartFilter === "1year") monthsToSubtract = 11
												else if (chartFilter === "6months") monthsToSubtract = 5

												const startMonth = new Date(selectedYear, activeMonth - monthsToSubtract, 1)
												const endMonth = new Date(selectedYear, activeMonth, 1)

												const startLabel = startMonth.toLocaleString('pt-BR', {month: 'long'})
												const endLabel = endMonth.toLocaleString('pt-BR', {month: 'long'})

												return `${startLabel.charAt(0).toUpperCase() + startLabel.slice(1)} - ${endLabel.charAt(0).toUpperCase() + endLabel.slice(1)}`
											}
											return 'Sem dados para o período selecionado'
										})()}
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant={chartFilter === "1year" ? "outline" : "ghost"}
										size="sm"
										onClick={() => setChartFilter("1year")}
										className={cn("rounded-4xl", chartFilter === "1year" && "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300")}
									>
										Último Ano
									</Button>
									<Button
										variant={chartFilter === "6months" ? "outline" : "ghost"}
										size="sm"
										onClick={() => setChartFilter("6months")}
										className={cn("rounded-4xl", chartFilter === "6months" && "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300")}
									>
										Últimos 6 meses
									</Button>
									<Button
										variant={chartFilter === "30days" ? "outline" : "ghost"}
										size="sm"
										onClick={() => setChartFilter("30days")}
										className={cn("rounded-4xl", chartFilter === "30days" && "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300")}
									>
										Últimos 30 dias
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-[300px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData} margin={{top: 10, right: 10, left: 10, bottom: 0}}>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
										<XAxis
											dataKey="name"
											axisLine={false}
											tickLine={false}
											tick={({ x, y, payload, index }) => {
												const totalPoints = chartData.length;
												const showTick = chartFilter === "30days" 
													? (index % 2 === 0 || index === totalPoints - 1)
													: true;
												
												if (!showTick) return null;

												return (
													<g transform={`translate(${x},${y})`}>
														<text
															x={0}
															y={0}
															dy={10}
															fill="var(--muted-foreground)"
															fontSize={10}
															textAnchor="middle"
														>
															{payload.value}
														</text>
													</g>
												);
											}}
											height={30}
											interval={0}
											padding={{ left: 0, right: 0 }}
										/>
										<YAxis
											hide
										/>
										<Tooltip
											contentStyle={{
												backgroundColor: 'var(--card)',
												color: 'var(--card-foreground)',
												borderRadius: 'var(--radius)',
												border: '1px solid var(--border)',
												boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
											}}
											formatter={(value: number | string, name: string) => [
												new Intl.NumberFormat('pt-BR', {
													style: 'currency',
													currency: 'BRL'
												}).format(Number(value) || 0),
												name.toLowerCase() === 'realizado' ? 'Pago' : 'Previsto'
											]}
										/>
										{showRealizado && (
											<Line
												type="monotone"
												dataKey="realizado"
												name="realizado"
												stroke="#3b82f6"
												strokeWidth={2}
												dot={false}
												isAnimationActive={false}
											/>
										)}
										{showPrevisto && (
											<Line
												type="monotone"
												dataKey="previsto"
												name="previsto"
												stroke="#94a3b8"
												strokeWidth={2}
												strokeDasharray="5 5"
												dot={false}
												isAnimationActive={false}
											/>
										)}
									</LineChart>
								</ResponsiveContainer>
							</div>
							<div className="flex items-center justify-center gap-6 mt-6 pt-4">
								<div className="flex items-center gap-2">
									<Checkbox
										id="realizado"
										checked={showRealizado}
										onCheckedChange={(checked) => setShowRealizado(!!checked)}
									/>
									<label
										htmlFor="realizado"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										Pago
									</label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="previsto"
										checked={showPrevisto}
										onCheckedChange={(checked) => setShowPrevisto(!!checked)}
									/>
									<label
										htmlFor="previsto"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										Previsto
									</label>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Expenses Filter and Table */}
					<div className="space-y-4">
						<div className="flex justify-between items-center gap-4 ">
							<div className="flex items-center gap-4 flex-1">
								<div className="relative w-full max-w-[300px]">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
									<Input
										placeholder="Pesquisar..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 bg-white"
									/>
								</div>
							</div>
							
							<div className="flex items-center gap-2">
								<MonthYearCalendar
									month={activeMonth}
									year={selectedYear}
									onMonthChange={handleMonthChange}
									onYearChange={handleYearChange}
									isActive={activeMonth !== new Date().getMonth() || selectedYear !== new Date().getFullYear()}
								/>

								<MultiSelect
									label="Status"
									options={allStatuses.map(s => ({ label: s, value: s }))}
									selected={selectedStatuses}
									onChange={setSelectedStatuses}
									width="w-[160px]"
								/>

								<MultiSelect
									label="Categoria"
									icon={Filter}
									options={allCategories.map(c => ({ 
										label: c.name, 
										value: c.id.toString(),
										icon: c.icon || undefined
									}))}
									selected={selectedCategories}
									onChange={setSelectedCategories}
									disableScroll
								/>

								<div className="flex items-center gap-2 ml-2">
									<Button
										onClick={() => setIsDialogOpen(true)}
										className="size-9">
										<Plus className="h-4 w-4"/>
									</Button>

									<ImportExpensesButton
										month={activeMonth}
										year={selectedYear}
										onImportSuccess={refreshData}
									/>
								</div>
							</div>
						</div>

						<ExpenseTable 
							month={activeMonth} 
							year={selectedYear} 
							data={filteredExpenses} 
							onUpdate={refreshData}
						/>
					</div>
				</div>

				<div className="xl:col-span-1">
					<CategorySummary month={activeMonth} year={selectedYear} key={categoryRefreshKey} />
				</div>
			</div>
			<CreateExpenseDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSuccess={refreshData}
			/>
		</div>
	)
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<div className="p-8">Carregando Dashboard...</div>}>
			<DashboardContent />
		</Suspense>
	)
}
