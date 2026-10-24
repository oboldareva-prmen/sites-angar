import { createHash, randomUUID, webcrypto } from 'node:crypto';
import type { HandlerResponse } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

const cryptoApi = globalThis.crypto ?? webcrypto;

export const consentVersion = '2026-10-23';
export const sessionMaxAgeSeconds = 60 * 60 * 8;

export type NetlifyResult = HandlerResponse;

export function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured');
  return neon(connectionString);
}

export function json(data: Record<string, unknown>, statusCode = 200, headers: Record<string, string> = {}): NetlifyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
    body: JSON.stringify(data),
  };
}

export function noStoreHeaders(): Record<string, string> {
  return { 'Cache-Control': 'no-store' };
}

export function methodNotAllowed(allowed: string): NetlifyResult {
  return { statusCode: 405, headers: { Allow: allowed, ...noStoreHeaders() }, body: 'Метод не поддерживается.' };
}

export function header(headers: Record<string, string | undefined>, name: string): string | null {
  const value = Object.entries(headers).find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1];
  return value?.trim() || null;
}

export function requestIp(headers: Record<string, string | undefined>): string {
  return header(headers, 'x-forwarded-for')?.split(',')[0]?.trim() || header(headers, 'client-ip') || 'unknown';
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/[()\s-]/g, '');
  return /^\+?[0-9]{10,15}$/.test(normalized) ? normalized : null;
}

export function optionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

export function parseJsonBody(body: string | null, maxBytes: number): Record<string, unknown> | null {
  if (!body || Buffer.byteLength(body, 'utf8') > maxBytes) return null;
  try {
    const parsed: unknown = JSON.parse(body);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

function base64UrlToBytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await cryptoApi.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await cryptoApi.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function createSession(secret: string): Promise<string> {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds })));
  return `${payload}.${await sign(payload, secret)}`;
}

export async function isAdmin(cookieHeader: string | undefined): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  const cookie = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith('angar_admin='));
  const value = cookie ? decodeURIComponent(cookie.slice('angar_admin='.length)) : '';
  if (!value || !secret) return false;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return false;
  try {
    const key = await cryptoApi.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await cryptoApi.subtle.verify('HMAC', key, base64UrlToBytes(signature), new TextEncoder().encode(payload));
    const data = JSON.parse(Buffer.from(base64UrlToBytes(payload)).toString('utf8')) as { exp?: number };
    return valid && typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sessionCookie(value: string): string {
  return `angar_admin=${encodeURIComponent(value)}; Max-Age=${sessionMaxAgeSeconds}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return 'angar_admin=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict';
}

export function hashRateKey(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function sameSecret(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  const size = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < size; index += 1) difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  return difference === 0;
}

export function csvCell(value: string | number | boolean | Date | null): string {
  const text = value instanceof Date ? value.toISOString() : value === null ? '' : String(value);
  const safe = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function csvRow(values: Array<string | number | boolean | Date | null>): string {
  return values.map(csvCell).join(',');
}

export function newRequestId(): string {
  return randomUUID();
}
