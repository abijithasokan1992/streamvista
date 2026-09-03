import type { Request, Response } from 'express';
import crypto from 'crypto';

type ErrorBody = { code: string; message: string };

export function ensureRequestId(req: Request): string {
  const existing = String(req.header('x-request-id') || '').trim();
  if (existing) return existing.slice(0, 128);
  return crypto.randomUUID();
}

export function ok(res: Response, req: Request, data: unknown, status = 200) {
  const requestId = ensureRequestId(req);
  return res.status(status).json({ ok: true, data, requestId });
}

export function fail(res: Response, req: Request, status: number, error: ErrorBody) {
  const requestId = ensureRequestId(req);
  return res.status(status).json({ ok: false, error, requestId });
}

export function asErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
