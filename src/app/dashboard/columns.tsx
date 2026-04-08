"use client"

import {ColumnDef} from "@tanstack/react-table"
import {ArrowUpDown, ArrowDownAZ, ArrowDownZA, Trash2, HelpCircle, Pencil} from "lucide-react"
import * as LucideIcons from "lucide-react"
import {Button} from "@/components/ui/button"
import {
	updateExpenseStatus,
	deleteExpense,
	updateExpenseDescription,
	updateExpenseCategory,
	updateExpense,
	updateExpenseResponsavel,
	updateExpenseVencimento,
	updateExpenseReal
} from "./actions"
import {toast} from "sonner"
import {Input} from "@/components/ui/input"
import * as React from "react"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {ExpenseForm, ExpenseFormData} from "./expense-form"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {Calendar} from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {format} from "date-fns"
import {ptBR} from "date-fns/locale"
import {cn} from "@/lib/utils"

export type Expense = {
	id: number
	descricao: string
	responsavel: string
	real: number
	vencimento: Date
	status: string
	userId: number
	totalParcelas?: number | null
	parcelaAtual?: number | null
	type?: {
		name: string
		categoryRef?: {
			id: number
			icon?: string | null
			name: string
		} | null
	} | null
}

const IconRenderer = ({iconName}: { iconName?: string | null }) => {
	if (!iconName) return <HelpCircle className="h-4 w-4 text-muted-foreground"/>

	const Icon = (LucideIcons as any)[iconName]
	if (!Icon) return <HelpCircle className="h-4 w-4 text-muted-foreground"/>

	return <Icon className="h-4 w-4"/>
}

const SortButton = ({column, label}: { column: any, label: string }) => {
	const isSorted = column.getIsSorted()

	const getIcon = () => {
		if (isSorted === "asc") return <ArrowDownAZ className="ml-2 h-4 w-4"/>
		if (isSorted === "desc") return <ArrowDownZA className="ml-2 h-4 w-4"/>
		return <ArrowUpDown className="ml-2 h-4 w-4"/>
	}

	return (
		<Button
			variant="ghost"
			onClick={() => {
				if (isSorted === "asc") {
					column.toggleSorting(true)
				} else if (isSorted === "desc") {
					column.clearSorting()
				} else {
					column.toggleSorting(false)
				}
			}}
		>
			{label}
			{getIcon()}
		</Button>
	)
}

const DescriptionCell = ({expense, onUpdate}: { expense: Expense, onUpdate: () => void }) => {
	const [isEditing, setIsEditing] = React.useState(false)
	const [value, setValue] = React.useState(expense.descricao)

	const handleBlur = async () => {
		setIsEditing(false)
		if (value !== expense.descricao) {
			const result = await updateExpenseDescription(expense.id, value)
			if (result.success) {
				toast.success("Descrição atualizada")
				onUpdate()
			} else {
				toast.error("Erro ao atualizar descrição")
				setValue(expense.descricao)
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleBlur()
		}
		if (e.key === "Escape") {
			setIsEditing(false)
			setValue(expense.descricao)
		}
	}

	return (
		<div className="flex items-center gap-2 group min-h-[32px]">
			<IconRenderer iconName={expense.type?.categoryRef?.icon}/>
			{isEditing ? (
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					autoFocus
					className="h-8 py-0 px-2"
				/>
			) : (
				<span
					onClick={() => setIsEditing(true)}
					className="cursor-pointer hover:bg-accent px-1 rounded transition-colors"
				>
          {expense.descricao}
        </span>
			)}
		</div>
	)
}

const RealValueCell = ({expense, onUpdate}: { expense: Expense, onUpdate: () => void }) => {
	const [isEditing, setIsEditing] = React.useState(false)
	const [value, setValue] = React.useState(expense.real.toString())

	const handleBlur = async () => {
		setIsEditing(false)
		const numericValue = parseFloat(value)
		if (isNaN(numericValue)) {
			toast.error("Valor inválido")
			setValue(expense.real.toString())
			return
		}

		if (numericValue !== expense.real) {
			const result = await updateExpenseReal(expense.id, numericValue)
			if (result.success) {
				toast.success("Valor atualizado")
				onUpdate()
			} else {
				toast.error("Erro ao atualizar valor")
				setValue(expense.real.toString())
			}
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleBlur()
		}
		if (e.key === "Escape") {
			setIsEditing(false)
			setValue(expense.real.toString())
		}
	}

	const formatted = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(expense.real)

	return (
		<div className="flex items-center min-h-[32px]">
			{isEditing ? (
				<Input
					type="number"
					step="0.01"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					autoFocus
					className="h-8 py-0 px-2 w-[100px]"
				/>
			) : (
				<span
					onClick={() => setIsEditing(true)}
					className="cursor-pointer hover:bg-accent px-1 rounded transition-colors font-medium"
				>
          {formatted}
        </span>
			)}
		</div>
	)
}

const ResponsavelCell = ({expense, users, onUpdate}: { expense: Expense, users: {id: number, nickname: string}[], onUpdate: () => void }) => {
	const handleUpdate = async (userId: string | null) => {
    if (userId === null) return
		const user = users.find(u => u.id.toString() === userId)
		if (!user) return

		const result = await updateExpenseResponsavel(expense.id, user.id, user.nickname)
		if (result.success) {
			toast.success("Responsável atualizado")
			onUpdate()
		} else {
			toast.error("Erro ao atualizar responsável")
		}
	}

	return (
		<Select value={expense.userId.toString()} onValueChange={handleUpdate}>
			<SelectTrigger className="h-8 w-fit border-none shadow-none bg-transparent hover:bg-accent transition-colors">
				<SelectValue>{expense.responsavel || "Responsável"}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{users.map((user) => (
					<SelectItem key={user.id} value={user.id.toString()}>
						{user.nickname}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

const StatusCell = ({expense, statusList, onUpdate}: { expense: Expense, statusList: { name: string; color?: string }[], onUpdate: () => void }) => {
	const handleStatusUpdate = async (newStatus: string | null) => {
    if (newStatus === null) return
		if (newStatus === expense.status) return
		const result = await updateExpenseStatus(expense.id, newStatus)
		if (result.success) {
			toast.success(`Status atualizado para ${newStatus}`)
			onUpdate()
		} else {
			toast.error("Erro ao atualizar status")
		}
	}

	let colorClass = "bg-gray-100 text-gray-800"
	const matched = statusList.find(s => s.name?.toLowerCase() === expense.status?.toLowerCase())
	const style: React.CSSProperties = {}
	if (matched?.color) {
		style.backgroundColor = matched.color
		style.color = "#111827" // zinc-900 default; manter simples para legibilidade
	} else {
		switch (expense.status.toLowerCase()) {
			case "pago":
				colorClass = "bg-green-100 text-green-800"
				break
			case "cancelado":
				colorClass = "bg-red-100 text-red-800"
				break
			case "a vencer":
			case "pendente":
				colorClass = "bg-yellow-100 text-yellow-800"
				break
			case "debito automatico":
			case "débito automático":
				colorClass = "bg-blue-100 text-blue-800"
				break
		}
	}

	return (
		<Select value={expense.status} onValueChange={handleStatusUpdate}>
			<SelectTrigger style={style} className={cn("h-7 w-fit border-none shadow-none rounded-full px-2.5 py-0.5 text-xs font-medium focus:ring-0", colorClass)}>
				<SelectValue>{expense.status}</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{statusList.map((s) => (
					<SelectItem key={s.name} value={s.name}>
						{s.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}

const VencimentoCell = ({expense, onUpdate}: { expense: Expense, onUpdate: () => void }) => {
	const date = new Date(expense.vencimento)
	const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

	const handleDateSelect = async (newDate: Date | undefined) => {
		if (!newDate) return
		
		const result = await updateExpenseVencimento(expense.id, newDate)
		if (result.success) {
			toast.success("Vencimento atualizado")
			onUpdate()
		} else {
			toast.error("Erro ao atualizar vencimento")
		}
	}

	return (
		<Popover>
			<PopoverTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "h-8 justify-start text-left font-normal px-2 hover:bg-accent min-w-[100px]",
              !utcDate && "text-muted-foreground"
            )}
          >
            {format(utcDate, "dd/MM/yyyy")}
          </Button>
        }
      />
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={utcDate}
					onSelect={handleDateSelect}
					initialFocus
					locale={ptBR}
					fromDate={new Date(new Date().getFullYear() - 10, 0, 1)}
					toDate={new Date(new Date().getFullYear() + 10, 11, 31)}
					month={utcDate}
				/>
			</PopoverContent>
		</Popover>
	)
}

export const getColumns = (
	statusList: { name: string; color?: string }[],
	categories: { id: number, name: string }[],
	onUpdate: () => void,
	currentMonth?: number,
	currentYear?: number,
	users: { id: number, nickname: string }[] = []
): ColumnDef<Expense>[] => [
	{
		accessorKey: "descricao",
		header: ({column}) => <SortButton column={column} label="Despesas"/>,
		cell: ({row}) => <DescriptionCell expense={row.original} onUpdate={onUpdate}/>
	},
	{
		accessorKey: "responsavel",
		header: ({column}) => <SortButton column={column} label="Responsável"/>,
		cell: ({row}) => <ResponsavelCell expense={row.original} users={users} onUpdate={onUpdate}/>
	},
	{
		accessorKey: "parcelaAtual",
		header: ({column}) => <SortButton column={column} label="Parcelas"/>,
		cell: ({row}) => {
			const total = row.original.totalParcelas
			let atual = row.original.parcelaAtual || 1
			
			if (!total || total <= 1) return <div className="text-muted-foreground">-</div>

			// Lógica automática: 
			// Se temos o mês/ano que estamos visualizando, comparamos com o mês/ano do vencimento desta despesa
			if (currentMonth !== undefined && currentYear !== undefined) {
				const dataVencimento = new Date(row.original.vencimento)
				const mesVencimento = dataVencimento.getUTCMonth()
				const anoVencimento = dataVencimento.getUTCFullYear()

				// Se a despesa é de um mês anterior ao que estamos visualizando,
				// calculamos a diferença para mostrar a parcela correta.
				// Se a despesa já é do mês atual, usamos o valor do banco.
				if (anoVencimento < currentYear || (anoVencimento === currentYear && mesVencimento < currentMonth)) {
					const diffMeses = (currentYear - anoVencimento) * 12 + (currentMonth - mesVencimento)
					atual = atual + diffMeses
				}
			}

			// Se a parcela calculada for maior que o total ou menor que 1, 
			// tecnicamente a despesa não deveria estar aparecendo se o filtro de data funcionou,
			// mas vamos garantir que mostramos um valor coerente.
			if (atual > total) return <div className="text-muted-foreground">Finalizada ({total}/{total})</div>
			if (atual < 1) return <div className="text-muted-foreground">Programada (1/{total})</div>

			return <div>{atual} de {total}</div>
		}
	},
	{
		accessorKey: "status",
		header: ({column}) => <SortButton column={column} label="Status"/>,
		cell: ({row}) => <StatusCell expense={row.original} statusList={statusList} onUpdate={onUpdate}/>
	},
	{
		accessorKey: "real",
		header: ({column}) => <SortButton column={column} label="Valor (Real)"/>,
		cell: ({row}) => <RealValueCell expense={row.original} onUpdate={onUpdate}/>
	},
	{
		accessorKey: "vencimento",
		header: ({column}) => <SortButton column={column} label="Vencimento"/>,
		cell: ({row}) => <VencimentoCell expense={row.original} onUpdate={onUpdate}/>
	},
	{
		id: "actions",
		header: "Ações",
		cell: ({row}) => {
			const expense = row.original
			const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
			const [isSaving, setIsSaving] = React.useState(false)

			const handleSave = async (formData: ExpenseFormData) => {
				if (formData.descricao !== expense.descricao) {
					if (!confirm("Alterar o nome da despesa irá replicar esta mudança em todos os demais meses. Deseja continuar?")) {
						return
					}
				}

				setIsSaving(true)
				const result = await updateExpense(expense.id, {
					descricao: formData.descricao,
					responsavel: formData.responsavel,
					real: parseFloat(formData.real),
					vencimento: new Date(formData.vencimento),
					status: formData.status,
					userId: parseInt(formData.userId),
					totalParcelas: parseInt(formData.totalParcelas),
					parcelaAtual: parseInt(formData.parcelaAtual),
					categoryId: parseInt(formData.categoryId),
				})
				setIsSaving(false)

				if (result.success) {
					toast.success("Despesa atualizada com sucesso")
					setIsEditDialogOpen(false)
					onUpdate()
				} else {
					toast.error("Erro ao atualizar despesa")
				}
			}

			const handleDelete = async () => {
				if (confirm("Tem certeza que deseja excluir esta despesa?")) {
					const result = await deleteExpense(expense.id)
					if (result.success) {
						toast.success("Despesa excluída com sucesso")
						onUpdate()
					} else {
						toast.error("Erro ao excluir despesa")
					}
				}
			}

			const initialData: ExpenseFormData = {
				descricao: expense.descricao,
				responsavel: expense.responsavel,
				real: expense.real.toString(),
				vencimento: new Date(expense.vencimento).toISOString().split("T")[0],
				status: expense.status,
				userId: expense.userId.toString(),
				totalParcelas: expense.totalParcelas?.toString() || "1",
				parcelaAtual: expense.parcelaAtual?.toString() || "1",
				categoryId: (expense as any).type?.categoryRef?.id?.toString() || "",
			}

			return (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						onClick={() => setIsEditDialogOpen(true)}
					>
						<Pencil className="h-4 w-4"/>
						<span className="sr-only">Editar</span>
					</Button>

					<Button
						variant="ghost"
						className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
						onClick={handleDelete}
					>
						<Trash2 className="h-4 w-4"/>
						<span className="sr-only">Deletar</span>
					</Button>

					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className="sm:max-w-[625px]" >
							<DialogHeader>
								<DialogTitle>Editar Despesa</DialogTitle>
								<DialogDescription className="sr-only">
									Faça alterações nas informações da despesa selecionada.
								</DialogDescription>
							</DialogHeader>
							<ExpenseForm
								initialData={initialData}
								onSubmit={handleSave}
								loading={isSaving}
								onCancel={() => setIsEditDialogOpen(false)}
								submitLabel="Salvar Alterações"
							/>
						</DialogContent>
					</Dialog>
				</div>
			)
		},
	},
]
