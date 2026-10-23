import { clearSessionCookie, json, noStoreHeaders, type PagesContext } from '../../types';

export const onRequestPost: PagesFunction<PagesContext['env']> = async () =>
  json({ authenticated: false }, 200, { ...noStoreHeaders(), 'Set-Cookie': clearSessionCookie() });
