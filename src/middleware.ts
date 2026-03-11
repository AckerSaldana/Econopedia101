import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  const response = next();

  // Block common attack paths that scanners/bots probe
  const blocked = [
    '/wp-admin', '/wp-login', '/.env', '/phpinfo',
    '/wp-content', '/wp-includes', '/xmlrpc.php',
  ];
  if (blocked.some((p) => pathname.startsWith(p))) {
    return new Response(null, { status: 404 });
  }

  return response;
});
