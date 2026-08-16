import { Request, Response, NextFunction } from 'express';
import { urlService } from './url.service';

export const urlController = {
  async createUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalUrl, customAlias, expiresAt } = req.body;
      const userId = req.user!.userId;

      const url = await urlService.createUrl({
        originalUrl,
        customAlias,
        expiresAt,
        userId,
      });

      res.status(201).json({
        id: url.id,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      });
    } catch (error) {
      next(error);
    }
  },

  async listUrls(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

      const result = await urlService.listUserUrls(userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async deleteUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await urlService.deleteUrl(id, req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async updateUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { originalUrl, expiresAt } = req.body;

      const url = await urlService.updateUrl(id, { originalUrl, expiresAt }, req.user!);

      res.status(200).json({
        id: url.id,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
        updatedAt: url.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  },

  async redirect(req: Request, res: Response, next: NextFunction) {
    try {
      const shortCode = req.params.shortCode as string;
      const url = await urlService.resolveRedirect(shortCode);

      urlService
        .logClick(url.id, {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          referrer: req.headers['referer'],
        })
        .catch((err) => {
          console.error('Failed to log click:', err);
        });

      res.redirect(302, url.originalUrl);
    } catch (error) {
      next(error);
    }
  },
};