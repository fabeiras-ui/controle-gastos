import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const expenseTypes = [
  { category: "Moradia", names: ["Aluguel ou prestação da casa", "Condomínio", "IPTU", "Manutenção e reparos", "Material de limpeza"] },
  { category: "Contas e Serviços Básicos", names: ["Energia elétrica", "Água e esgoto", "Gás", "Internet e telefone", "TV por assinatura / Streaming"] },
  { category: "Alimentação", names: ["Supermercado / Compras do mês", "Hortifrúti", "Padaria", "Refeições fora de casa (restaurantes, delivery)"] },
  { category: "Transporte", names: ["Combustível", "Transporte público (ônibus, metrô, Uber)", "Manutenção do carro", "IPVA e licenciamento", "Estacionamento", "Seguro do veículo"] },
  { category: "Saúde", names: ["Plano de saúde", "Medicamentos", "Consultas e exames", "Academia / Atividade física", "Cuidados pessoais (cabeleireiro, estética)"] },
  { category: "Educação", names: ["Mensalidade escolar / Faculdade", "Material escolar", "Cursos extras", "Livros e apostilas"] },
  { category: "Lazer e Entretenimento", names: ["Cinema, teatro, shows", "Viagens e passeios", "Assinaturas (Netflix, Spotify, etc.)", "Hobbies (jogos, esportes)"] },
  { category: "Pessoal", names: ["Roupas e calçados", "Cosméticos e higiene", "Presentes"] },
  { category: "Seguros e Proteção", names: ["Seguro residencial", "Seguro de vida", "Seguro de saúde complementar"] },
  { category: "Dívidas e Financiamentos", names: ["Parcelas de empréstimos", "Cartão de crédito", "Financiamentos (carro, etc.)"] },
  { category: "Outros / Variáveis", names: ["Doações", "Impostos extras", "Emergências", "Pets (ração, veterinário)", "Investimentos (se quiser rastrear aportes)"] },
];

async function main() {
  console.log("Limpando tipos de despesas existentes...");
  // Opcional: deletar apenas se não houver despesas vinculadas, mas para um seed de reestruturação pode ser drástico.
  // Vamos usar upsert para evitar duplicados e não quebrar relações existentes se possível, 
  // mas como o ID é autoincrement, o nome + categoria será nossa chave de "unicidade" lógica para o seed.

  for (const group of expenseTypes) {
    // Busca a categoria pelo nome
    const category = await prisma.category.findUnique({
      where: { name: group.category }
    });

    if (!category) {
      console.log(`Categoria não encontrada: ${group.category}`);
      continue;
    }

    for (const name of group.names) {
      await prisma.expenseType.upsert({
        where: { 
          // Como não temos um campo único composto no schema, vamos buscar por nome e categoria
          id: (await prisma.expenseType.findFirst({ where: { name, categoryId: category.id } }))?.id || -1
        },
        update: {
          isActive: true
        },
        create: {
          name,
          categoryId: category.id,
          isActive: true
        }
      });
    }
  }

  console.log("Tipos de despesas populados com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
