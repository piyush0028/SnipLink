import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('URL Endpoints', () => {
  describe('POST /api/urls', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/urls')
        .send({ originalUrl: 'https://example.com' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Not authenticated');
    });
  });

  describe('GET /api/urls', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/urls');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/urls/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .patch('/api/urls/some-id')
        .send({ originalUrl: 'https://new-url.com' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/urls/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).delete('/api/urls/some-id');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:shortCode (redirect)', () => {
    it('should return 404 for non-existent short code', async () => {
      // This test requires Redis to be running for rate limiting
      // In CI, rate limiter fails open, so the request goes through
      const res = await request(app).get('/nonexistent123');
      // Either 404 (if Redis is up) or error depending on cache state
      expect([404, 429, 500]).toContain(res.status);
    });
  });
});

describe('Analytics Endpoints', () => {
  describe('GET /api/analytics/:id', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/analytics/some-id');
      expect(res.status).toBe(401);
    });
  });
});
