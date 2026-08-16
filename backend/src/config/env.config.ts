export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    jwtAccessSecret: process.env.JWT_SECRET as string,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  } as const;