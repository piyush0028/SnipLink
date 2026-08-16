import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seed script starting...');
  console.log('Connecting with DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

  const roles = ['USER', 'ADMIN'];

  for (const name of roles) {
    const result = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log('Upserted role:', result);
  }

  const count = await prisma.role.count();
  console.log(`Total roles in DB right after seeding: ${count}`);

  console.log('Roles seeded successfully');
}

main()
  .catch((e) => {
    console.error('Seed script threw an error:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
