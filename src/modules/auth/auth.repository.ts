import type { Role } from '../../common/roles';
import { prisma } from '../../database/prisma';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    role?: Role;
  }) {
    return prisma.user.create({ data });
  },

  createRefreshToken(data: {
    userId: string;
    tokenIdentifier: string;
    expiresAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findActiveRefreshToken(userId: string, tokenIdentifier: string) {
    return prisma.refreshToken.findFirst({
      where: {
        userId,
        tokenIdentifier,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  },

  revokeRefreshToken(tokenIdentifier: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenIdentifier, revoked: false },
      data: { revoked: true },
    });
  },

  revokeAllRefreshTokensForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },
};
