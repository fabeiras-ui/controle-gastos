import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const colors = [
  '#f43f5e', // rose-500
  '#ec4899', // pink-500
  '#d946ef', // fuchsia-500
  '#a855f7', // purple-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#3b82f6', // blue-500
  '#0ea5e9', // sky-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#10b981', // emerald-500
  '#22c55e', // green-500
  '#84cc16', // lime-500
  '#eab308', // yellow-500
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#ef4444', // red-500
]

async function main() {
  const categories = await prisma.category.findMany()
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    const color = colors[i % colors.length]
    
    await prisma.category.update({
      where: { id: category.id },
      data: { color }
    })
    
    console.log(`Updated category ${category.name} with color ${color}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
