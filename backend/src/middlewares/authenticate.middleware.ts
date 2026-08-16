import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.user = { userId: payload.userId, roles: payload.roles };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}