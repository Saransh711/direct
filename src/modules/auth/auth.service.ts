import ms from 'ms';
import { Roles } from '../../common/roles';
import { AppError } from '../../common/errors';
import { env } from '../../config/env';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { authRepository } from './auth.repository';

export const REFRESH_COOKIE_NAME = 'rt';

function refreshExpiryDate(): Date {
  const ttlMs = ms(env.JWT_REFRESH_EXPIRES_IN as ms.StringValue);
  return new Date(Date.now() + ttlMs);
}

export const authService = {
  async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    validatePasswordStrength(payload.password);
    const existing = await authRepository.findUserByEmail(payload.email);
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await authRepository.createUser({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      passwordHash,
      role: Roles.CUSTOMER,
    });

    return user;
  },

  async login(email: string, password: string, deviceInfo?: string, ipAddress?: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const validPassword = await verifyPassword(user.passwordHash, password);
    if (!validPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const { token: refreshToken, jti } = signRefreshToken({ sub: user.id, role: user.role });

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenIdentifier: jti,
      expiresAt: refreshExpiryDate(),
      deviceInfo,
      ipAddress,
    });

    return { accessToken, refreshToken, user };
  },

  async adminLogin(email: string, password: string, deviceInfo?: string, ipAddress?: string) {
    const result = await this.login(email, password, deviceInfo, ipAddress);
    if (result.user.role !== Roles.ADMIN && result.user.role !== Roles.SUPER_ADMIN) {
      throw new AppError('Forbidden', 403);
    }
    return result;
  },

  async refresh(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
    const payload = verifyRefreshToken(refreshToken);
    const activeToken = await authRepository.findActiveRefreshToken(payload.sub, payload.jti);
    if (!activeToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    await authRepository.revokeRefreshToken(payload.jti);

    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    const { token: newRefreshToken, jti } = signRefreshToken({
      sub: payload.sub,
      role: payload.role,
    });

    await authRepository.createRefreshToken({
      userId: payload.sub,
      tokenIdentifier: jti,
      expiresAt: refreshExpiryDate(),
      deviceInfo,
      ipAddress,
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    await authRepository.revokeRefreshToken(payload.jti);
  },

  async logoutAll(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    await authRepository.revokeAllRefreshTokensForUser(payload.sub);
  },
};
