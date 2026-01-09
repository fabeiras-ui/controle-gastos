"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {TrendingUp, TrendingDown, Plus} from "lucide-react"
import {ExpenseTable} from "./expense-table"
import {useState, useEffect, Suspense} from "react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {useSearchParams, useRouter, usePathname} from "next/navigation"

import {getExpensesByMonth, getDashboardData, getChartData} from "./actions"
import {CreateExpenseDialog} from "./create-expense-dialog"
import {ImportExpensesButton} from "./import-expenses-button"
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts'
import {CategorySummary} from "./category-summary"

function DashboardContent() {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()

	const initialYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear()
	const initialMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth()

	const [selectedYear, setSelectedYear] = useState(initialYear)
	const [activeMonth, setActiveMonth] = useState(initialMonth)
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [expenses, setExpenses] = useState<any[]>([])
	const [dashboardData, setDashboardData] = useState({totalGastos: 0, percentageChange: 0, diffValue: 0, isHigher: false})
	const [chartFilter, setChartFilter] = useState("30days")
	const [chartData, setChartData] = useState<{ name: string, total: number }[]>([])

	const years = [2024, 2025, 2026]

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

	const handleMonthChange = (v: string | null) => {
    if (!v) return
		const m = parseInt(v)
		setActiveMonth(m)
		updateQueryParams(m, selectedYear)
	}

	const handleYearChange = (v: string | null) => {
    if (!v) return
		const y = parseInt(v)
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
			loadChartData()
		])
	}

	useEffect(() => {
		loadExpenses()
	}, [activeMonth, selectedYear])

	useEffect(() => {
		loadChartData()
	}, [chartFilter, selectedYear, activeMonth])

	// Sincronizar estado local se a URL mudar (ex: navegação voltar/avançar)
	useEffect(() => {
		const yearParam = searchParams.get("year")
		const monthParam = searchParams.get("month")
		
		if (yearParam) {
			const y = parseInt(yearParam)
			if (y !== selectedYear) setSelectedYear(y)
		}
		if (monthParam) {
			const m = parseInt(monthParam)
			if (m !== activeMonth) setActiveMonth(m)
		}
	}, [searchParams])

	return (
		<div className="p-8 space-y-8 min-h-screen">
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
								<p className="text-xs text-zinc-400 mt-4">Total de gastos no mês selecionado</p>
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
									<CardTitle className="text-lg font-bold">Gastos ao longo do tempo</CardTitle>
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
									>
										Último Ano
									</Button>
									<Button
										variant={chartFilter === "6months" ? "outline" : "ghost"}
										size="sm"
										onClick={() => setChartFilter("6months")}
									>
										Últimos 6 meses
									</Button>
									<Button
										variant={chartFilter === "30days" ? "outline" : "ghost"}
										size="sm"
										onClick={() => setChartFilter("30days")}
									>
										Últimos 30 dias
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-[300px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
										<defs>
											<linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="100%">
												<stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
												<stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)"/>
										<XAxis
											dataKey="name"
											axisLine={false}
											tickLine={false}
											tick={{fill: 'var(--muted-foreground)', fontSize: 12}}
											dy={10}
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
           formatter={(value: any) => [new Intl.NumberFormat('pt-BR', {
                                                                          style: 'currency',
                                                                          currency: 'BRL'
                                                                        }).format(Number(value) || 0), 'Total']}
										/>
										<Area
											type="monotone"
											dataKey="total"
											stroke="var(--primary)"
											strokeWidth={2}
											fillOpacity={1}
											fill="url(#colorTotal)"
											isAnimationActive={false}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Expenses Filter and Table */}
					<div className="space-y-4">
						<div className="flex justify-between items-center gap-4 ">
							<div className="flex items-center gap-4">
								<h1 className="text-xl font-bold">Filtro</h1>
								<Select value={selectedYear.toString()} onValueChange={handleYearChange}>
									<SelectTrigger className="w-[120px] bg-white">
										<SelectValue>{selectedYear.toString() || "Ano"}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{years.map(year => (
											<SelectItem key={year} value={year.toString()}>{year}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={activeMonth.toString()} onValueChange={handleMonthChange}>
									<SelectTrigger className="w-[180px] bg-white">
										<SelectValue>{months[activeMonth] || "Mês"}</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{months.map((month, index) => (
											<SelectItem key={month} value={index.toString()}>{month}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center gap-3">
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

						<ExpenseTable 
							month={activeMonth} 
							year={selectedYear} 
							data={expenses} 
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
