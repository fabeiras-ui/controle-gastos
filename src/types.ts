export type Status = {
  id: number
  name: string
  color?: string | null
}

export type Category = {
  id: number
  name: string
  icon?: string | null
  _count?: {
    types: number
  }
}

export type AppUser = {
  id: number
  nickname: string
  email?: string
  image?: string | null
}

export type Expense = {
  id: number
  descricao: string
  responsavel: string
  real: number
  vencimento: Date | string
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