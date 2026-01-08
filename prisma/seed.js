// prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
	const adminPassword = await bcrypt.hash('admin123', 10); // Mude essa senha depois!

	await prisma.user.upsert({
		where: { email: 'admin@home.com' },
		update: {},
		create: {
			nickname: 'Admin',
			email: 'admin@home.com',
			password: adminPassword,
		},
	});

	console.log('Usuário admin criado: admin@home.com / admin123');
	console.log('Acesse /login e troque a senha depois!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});