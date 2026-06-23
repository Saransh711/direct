import { prisma } from '../../database/prisma';

export const loanProductService = {
  async listActiveProducts() {
    return prisma.loanProduct.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });
  },
};
