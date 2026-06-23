import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';
import { PrismaClient, Role } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await argon2.hash('Admin@123456789', {
    type: argon2.argon2id,
  });

  await prisma.user.upsert({
    where: { email: 'admin@loan.local' },
    create: {
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@loan.local',
      phoneNumber: '+10000000000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    update: {
      firstName: 'Platform',
      lastName: 'Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: 'ACTIVE',
    },
  });

  const products = [
    {
      productName: 'Salaried Personal Loan',
      minAmount: 50000,
      maxAmount: 1500000,
      interestRate: 11.5,
      minTenure: 12,
      maxTenure: 60,
      eligibilityRules: {
        minCreditScore: 650,
        maxDti: 0.5,
      },
      active: true,
    },
    {
      productName: 'Business Expansion Loan',
      minAmount: 200000,
      maxAmount: 5000000,
      interestRate: 13.25,
      minTenure: 12,
      maxTenure: 84,
      eligibilityRules: {
        minCreditScore: 680,
        maxDti: 0.55,
      },
      active: true,
    },
  ];

  for (const product of products) {
    await prisma.loanProduct.upsert({
      where: {
        id: `00000000-0000-0000-0000-${String(products.indexOf(product) + 1).padStart(12, '0')}`,
      },
      create: {
        id: `00000000-0000-0000-0000-${String(products.indexOf(product) + 1).padStart(12, '0')}`,
        ...product,
      },
      update: {
        ...product,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
