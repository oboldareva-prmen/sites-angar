import type { Handler } from '@netlify/functions';
import { clearSessionCookie, json, methodNotAllowed, noStoreHeaders } from './_shared';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST');
  return json({ authenticated: false }, 200, { ...noStoreHeaders(), 'Set-Cookie': clearSessionCookie() });
};
