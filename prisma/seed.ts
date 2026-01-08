import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("@dm1nTI127@!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@home.com" },
    update: {
      password: adminPassword,
    },
    create: {
      nickname: "Admin",
      email: "admin@home.com",
      password: adminPassword,
    },
  });

  console.log("Usuário admin criado: admin@home.com / @dm1nTI127@!");

  // Status
  const statusNames = ["Pago", "Pendente", "Débito Aut.", "Cancelado"];
  const createdStatuses: Record<string, any> = {};
  for (const name of statusNames) {
    createdStatuses[name] = await prisma.status.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log("Status cadastrados.");

  // Categorias com seus ícones
  const categoriesData = [
    { name: "Moradia", icon: "Home" },
    { name: "Contas e Serviços Básicos", icon: "Zap" },
    { name: "Alimentação", icon: "ShoppingCart" },
    { name: "Transporte", icon: "Bus" },
    { name: "Saúde", icon: "HeartPulse" },
    { name: "Educação", icon: "GraduationCap" },
    { name: "Lazer e Entretenimento", icon: "Gamepad2" },
    { name: "Pessoal", icon: "Smile" },
    { name: "Seguros e Proteção", icon: "ShieldCheck" },
    { name: "Dívidas e Financiamentos", icon: "CreditCard" },
    { name: "Outros / Variáveis", icon: "TrendingUp" },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    createdCategories[cat.name] = await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon },
      create: { name: cat.name, icon: cat.icon },
    });
  }
  console.log("Categorias cadastradas.");

  // Tipos de Despesas vinculados às Categorias
  const expenseTypeData = [
    { name: "Financiamento AP303", category: "Dívidas e Financiamentos" },
    { name: "Conta de luz - Ap 303", category: "Contas e Serviços Básicos" },
    { name: "IPTU", category: "Moradia" },
    { name: "Planejado Cozinha 11/23", category: "Dívidas e Financiamentos" },
    { name: "Condomínio - Ap 303", category: "Moradia" },
    { name: "Israel - Mesada", category: "Pessoal" },
    { name: "Investimento", category: "Outros / Variáveis" },
    { name: "Condução - Israel", category: "Transporte" },
    { name: "Seguro Cartão Cred.", category: "Seguros e Proteção" },
    { name: "Seguro Samsung", category: "Seguros e Proteção" },
    { name: "Internet Tracecomm", category: "Contas e Serviços Básicos" },
    { name: "Itaú (23/48)", category: "Dívidas e Financiamentos" },
    { name: "Cartão de crédito (Nu)", category: "Dívidas e Financiamentos" },
    { name: "Cartão de Crédito (Itaú Carol)", category: "Dívidas e Financiamentos" },
    { name: "Conta de Gás - Ap 303", category: "Contas e Serviços Básicos" },
    { name: "Cartão de Crédito (Itaú Black)", category: "Dívidas e Financiamentos" },
    { name: "C&A Pay", category: "Dívidas e Financiamentos" },
    { name: "IPTV", category: "Contas e Serviços Básicos" },
    { name: "Cartão Uniclass (Itaú Fábio)", category: "Dívidas e Financiamentos" },
    { name: "Cartão de crédito (MP Fábio)", category: "Dívidas e Financiamentos" },
    { name: "Casa & Video", category: "Outros / Variáveis" },
    { name: "Cartão de Click (Itaú Fábio)", category: "Dívidas e Financiamentos" },
    { name: "Internet TIM", category: "Contas e Serviços Básicos" },
    { name: "Samsung pra sempre 6/21", category: "Dívidas e Financiamentos" },
    { name: "Supermercado (1/2)", category: "Alimentação" },
    { name: "Supermercado (2/2)", category: "Alimentação" },
  ];

  const createdTypes: Record<string, any> = {};
  for (const item of expenseTypeData) {
    const category = createdCategories[item.category];
    createdTypes[item.name] = await prisma.expenseType.upsert({
      where: { id: (await prisma.expenseType.findFirst({ where: { name: item.name } }))?.id || -1 },
      update: { categoryId: category.id },
      create: { name: item.name, categoryId: category.id },
    });
  }
  console.log("Tipos de despesa cadastrados.");

  // Despesas de Dezembro 2025
  const expenses = [
    { descricao: "Financiamento AP303", responsavel: "Carolina Moreira", real: 1135.01, vencimento: new Date(2025, 11, 15), status: "Pago" },
    { descricao: "Conta de luz - Ap 303", responsavel: "Carolina Moreira", real: 649.20, vencimento: new Date(2025, 11, 18), status: "Pago" },
    { descricao: "IPTU", responsavel: "Carolina Moreira", real: 59.18, vencimento: new Date(2025, 11, 30), status: "Pago" },
    { descricao: "Planejado Cozinha 11/23", responsavel: "Carolina Moreira", real: 317.00, vencimento: new Date(2025, 11, 12), status: "Pago" },
    { descricao: "Condomínio - Ap 303", responsavel: "Fábio Moreira", real: 349.47, vencimento: new Date(2025, 11, 10), status: "Pago" },
    { descricao: "Israel - Mesada", responsavel: "Carolina Moreira", real: 29.90, vencimento: new Date(2025, 11, 10), status: "Pago" },
    { descricao: "Investimento", responsavel: "Carolina Moreira", real: 500.00, vencimento: new Date(2025, 11, 15), status: "Pendente" },
    { descricao: "Condução - Israel", responsavel: "Carolina Moreira", real: 200.00, vencimento: new Date(2025, 11, 3), status: "Pago" },
    { descricao: "Seguro Cartão Cred.", responsavel: "Carolina Moreira", real: 45.77, vencimento: new Date(2025, 11, 3), status: "Débito Aut." },
    { descricao: "Seguro Samsung", responsavel: "Carolina Moreira", real: 43.77, vencimento: new Date(2025, 11, 3), status: "Débito Aut." },
    { descricao: "Internet Tracecomm", responsavel: "Carolina Moreira", real: 99.90, vencimento: new Date(2025, 11, 22), status: "Pago" },
    { descricao: "Itaú (23/48)", responsavel: "Carolina Moreira", real: 1439.69, vencimento: new Date(2025, 11, 1), status: "Pago", totalParcelas: 48, parcelaAtual: 23 },
    { descricao: "Cartão de crédito (Nu)", responsavel: "Carolina Moreira", real: 746.46, vencimento: new Date(2025, 11, 2), status: "Pago" },
    { descricao: "Cartão de Crédito (Itaú Carol)", responsavel: "Carolina Moreira", real: 1632.00, vencimento: new Date(2025, 11, 15), status: "Pago" },
    { descricao: "Conta de Gás - Ap 303", responsavel: "Fábio Moreira", real: 70.85, vencimento: new Date(2025, 11, 5), status: "Pago" },
    { descricao: "Cartão de Crédito (Itaú Black)", responsavel: "Carolina Moreira", real: 902.67, vencimento: new Date(2025, 11, 15), status: "Pago" },
    { descricao: "C&A Pay", responsavel: "Carolina Moreira", real: 100.00, vencimento: new Date(2025, 11, 3), status: "Pago" },
    { descricao: "IPTV", responsavel: "Fábio Moreira", real: 25.00, vencimento: new Date(2025, 11, 5), status: "" },
    { descricao: "Cartão Uniclass (Itaú Fábio)", responsavel: "Fábio Moreira", real: 666.71, vencimento: new Date(2025, 11, 5), status: "Pago" },
    { descricao: "Cartão de crédito (MP Fábio)", responsavel: "Fábio Moreira", real: 0.00, vencimento: new Date(2025, 11, 5), status: "Pago" },
    { descricao: "Casa & Video", responsavel: "Carolina Moreira", real: 91.10, vencimento: new Date(2025, 11, 1), status: "Pago" },
    { descricao: "Cartão de Click (Itaú Fábio)", responsavel: "Fábio Moreira", real: 0.00, vencimento: new Date(2025, 11, 8), status: "Cancelado" },
    { descricao: "Internet TIM", responsavel: "Fábio Moreira", real: 139.99, vencimento: new Date(2025, 11, 7), status: "Pago" },
    { descricao: "Planejado Cozinha 11/23", responsavel: "Fábio Moreira", real: 317.00, vencimento: new Date(2025, 11, 12), status: "Pago" },
    { descricao: "Samsung pra sempre 6/21", responsavel: "Fábio Moreira", real: 220.00, vencimento: new Date(2025, 11, 15), status: "Pago", totalParcelas: 21, parcelaAtual: 6 },
    { descricao: "Israel - Mesada", responsavel: "Fábio Moreira", real: 0.00, vencimento: new Date(2025, 11, 10), status: "" },
    { descricao: "Investimento", responsavel: "Fábio Moreira", real: 0.00, vencimento: new Date(2025, 11, 15), status: "" },
    { descricao: "Supermercado (1/2)", responsavel: "FAROL", real: 0.00, vencimento: new Date(2025, 11, 2), status: "", totalParcelas: 2, parcelaAtual: 1 },
    { descricao: "Supermercado (2/2)", responsavel: "FAROL", real: 0.00, vencimento: new Date(2025, 11, 16), status: "", totalParcelas: 2, parcelaAtual: 2 },
  ];

  for (const exp of expenses) {
    const type = createdTypes[exp.descricao];
    const status = createdStatuses[exp.status] || null;

    await prisma.expense.create({
      data: {
        descricao: exp.descricao,
        responsavel: exp.responsavel,
        previsto: 0,
        real: exp.real,
        vencimento: exp.vencimento,
        status: exp.status,
        userId: admin.id,
        typeId: type?.id,
        statusId: status?.id,
        totalParcelas: (exp as any).totalParcelas || 1,
        parcelaAtual: (exp as any).parcelaAtual || 1,
      },
    });
  }
  console.log("Despesas de Dezembro/2025 importadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
