import { authRepository } from './auth.repository';
import { hashPassword, comparePassword, hashToken } from '../../utils/hash.util';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.util';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  deviceInfo?: string;
  ipAddress?: string;
}

interface LoginInput {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      const error: any = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    const defaultRole = await authRepository.findRoleByName('USER');
    if (!defaultRole) {
      throw new Error('USER role not found — run `npx prisma db seed`');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUserWithRole({
      email: input.email,
      passwordHash,
      name: input.name,
      roleId: defaultRole.id,
    });

    const roles = [defaultRole.name];
    const accessToken = signAccessToken({ userId: user.id, roles });
    const refreshToken = signRefreshToken({ userId: user.id, roles });

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserWithRolesByEmail(input.email);

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('This account has been deactivated');
      error.statusCode = 403;
      throw error;
    }

    const passwordValid = await comparePassword(input.password, user.passwordHash);
    if (!passwordValid) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const roles = user.roles.map((userRole) => userRole.role.name);

    const accessToken = signAccessToken({ userId: user.id, roles });
    const refreshToken = signRefreshToken({ userId: user.id, roles });

    await authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = hashToken(refreshToken);
    const existingToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (existingToken && !existingToken.revokedAt) {
      await authRepository.revokeRefreshToken(existingToken.id);
    }
  },

  async refresh(refreshToken: string | undefined, deviceInfo?: string, ipAddress?: string) {
    if (!refreshToken) {
      const error: any = new Error('No refresh token provided');
      error.statusCode = 401;
      throw error;
    }

    let payload: { userId: string; roles: string[] };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      const error: any = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }

    const tokenHash = hashToken(refreshToken);
    const existingToken = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!existingToken) {
      const error: any = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (existingToken.revokedAt) {
      await authRepository.revokeAllUserTokens(existingToken.userId);
      const error: any = new Error('Refresh token reuse detected — all sessions revoked');
      error.statusCode = 401;
      throw error;
    }

    const user = await authRepository.findUserWithRolesById(existingToken.userId);
    if (!user || !user.isActive) {
      const error: any = new Error('Account is no longer active');
      error.statusCode = 403;
      throw error;
    }

    const roles = user.roles.map((userRole) => userRole.role.name);
    const newAccessToken = signAccessToken({ userId: user.id, roles });
    const newRefreshToken = signRefreshToken({ userId: user.id, roles });

    await authRepository.rotateRefreshToken(existingToken.id, {
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo,
      ipAddress,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
};