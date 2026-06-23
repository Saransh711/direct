import type { Request, Response } from 'express';
import { successResponse } from '../../common/api-response';
import { env } from '../../config/env';
import { authService, REFRESH_COOKIE_NAME } from './auth.service';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    domain: env.COOKIE_DOMAIN,
    path: '/api/auth',
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    res.status(201).json(
      successResponse('Customer registered successfully', {
        id: user.id,
        email: user.email,
      }),
    );
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, result.refreshToken);
    res.json(
      successResponse('Authentication successful', {
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
        },
      }),
    );
  },

  async adminLogin(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.adminLogin(email, password, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, result.refreshToken);
    res.json(
      successResponse('Admin authentication successful', {
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          role: result.user.role,
        },
      }),
    );
  },

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is missing',
        errors: [],
        traceId: req.correlationId,
      });
      return;
    }
    const result = await authService.refresh(refreshToken, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, result.refreshToken);
    res.json(successResponse('Token refreshed', { accessToken: result.accessToken }));
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    res.json(successResponse('Logged out from current device', {}));
  },

  async logoutAll(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
    if (refreshToken) {
      await authService.logoutAll(refreshToken);
    }
    clearRefreshCookie(res);
    res.json(successResponse('Logged out from all devices', {}));
  },
};
