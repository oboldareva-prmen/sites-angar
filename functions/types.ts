export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export type PagesContext = EventContext<Env, string, Record<string, unknown>>;

export const consentVersion = '2026-10-23';
export const sessionMaxAgeSeconds = 60 * 60 * 8;

export function json(data: Record<string, unknown>, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export function noStoreHeaders(): HeadersInit {
  return { 'Cache-Control': 'no-store' };
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

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const item = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return bytesToBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

export async function createSession(secret: string): Promise<string> {
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds })));
  return `${payload}.${await sign(payload, secret)}`;
}

export async function isAdmin(request: Request, secret: string): Promise<boolean> {
  const cookie = readCookie(request, 'angar_admin');
  if (!cookie || !secret) return false;
  const [payload, signature] = cookie.split('.');
  if (!payload || !signature) return false;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(signature), new TextEncoder().encode(payload));
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { exp?: number };
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

export function csvCell(value: string | null): string {
  const text = value ?? '';
  const safe = /^[=+\-@]/.test(text.trimStart()) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function csvRow(values: Array<string | null>): string {
  return values.map(csvCell).join(',');
}
