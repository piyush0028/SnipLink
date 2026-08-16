import { prisma } from '../../database/prisma.client';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserWithRolesByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
  },

  findUserWithRolesById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  },

  findRoleByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },

  createUserWithRole(data: { email: string; passwordHash: string; name: string; roleId: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        roles: { create: { role: { connect: { id: data.roleId } } } },
      },
    });
  },

  createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date; deviceInfo?: string; ipAddress?: string }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  rotateRefreshToken(
    oldTokenId: string,
    newTokenData: { userId: string; tokenHash: string; expiresAt: Date; deviceInfo?: string; ipAddress?: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const newToken = await tx.refreshToken.create({ data: newTokenData });
      await tx.refreshToken.update({
        where: { id: oldTokenId },
        data: { revokedAt: new Date(), replacedByTokenId: newToken.id },
      });
      return newToken;
    });
  },
};