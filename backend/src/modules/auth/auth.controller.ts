import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../../config/cookie.config';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const result = await authService.register({
        email,
        password,
        name,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
      res.status(201).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({
        email,
        password,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
      res.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('accessToken', accessTokenCookieOptions);
      res.clearCookie('refreshToken', refreshTokenCookieOptions);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await authService.refresh(refreshToken, req.headers['user-agent'], req.ip);

      res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
      res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  },
};