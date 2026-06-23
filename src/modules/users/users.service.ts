import { AppError } from '../../common/errors';
import { prisma } from '../../database/prisma';

export const usersService = {
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  async updateMe(
    userId: string,
    payload: { firstName?: string; lastName?: string; phoneNumber?: string },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });
  },

  async getLoanHistory(userId: string) {
    return prisma.loanApplication.findMany({
      where: { userId, status: { in: ['APPROVED', 'DISBURSED', 'REJECTED'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        loanProduct: true,
        decision: true,
        disbursement: true,
      },
    });
  },
};
