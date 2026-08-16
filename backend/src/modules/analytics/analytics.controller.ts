import { Request, Response, NextFunction } from 'express';
import * as z from 'zod';
import { analyticsService } from './analytics.service';
import { dateRangeQuerySchema } from './analytics.validator';

export const analyticsController = {
  async getUrlAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const urlId = req.params.id as string;

      const parsedQuery = dateRangeQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: z.flattenError(parsedQuery.error).fieldErrors,
        });
      }

      const { from, to } = parsedQuery.data;
      const analytics = await analyticsService.getUrlAnalytics(urlId, { from, to }, req.user!);
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  },
};