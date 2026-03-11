import { describe, it, expect } from 'vitest';

const BLOCKED_PATHS = [
  '/wp-admin',
  '/wp-login',
  '/.env',
  '/phpinfo',
  '/wp-content',
  '/wp-includes',
  '/xmlrpc.php',
];

function shouldBlock(pathname: string): boolean {
  return BLOCKED_PATHS.some((p) => pathname.startsWith(p));
}

describe('Middleware — Blocked attack paths', () => {
  it('blocks /wp-admin', () => {
    expect(shouldBlock('/wp-admin')).toBe(true);
  });

  it('blocks /wp-admin/install.php', () => {
    expect(shouldBlock('/wp-admin/install.php')).toBe(true);
  });

  it('blocks /wp-login.php', () => {
    expect(shouldBlock('/wp-login.php')).toBe(true);
  });

  it('blocks /.env', () => {
    expect(shouldBlock('/.env')).toBe(true);
  });

  it('blocks /.env.local', () => {
    expect(shouldBlock('/.env.local')).toBe(true);
  });

  it('blocks /phpinfo', () => {
    expect(shouldBlock('/phpinfo')).toBe(true);
  });

  it('blocks /wp-content/uploads', () => {
    expect(shouldBlock('/wp-content/uploads')).toBe(true);
  });

  it('blocks /wp-includes/js', () => {
    expect(shouldBlock('/wp-includes/js')).toBe(true);
  });

  it('blocks /xmlrpc.php', () => {
    expect(shouldBlock('/xmlrpc.php')).toBe(true);
  });

  it('allows /', () => {
    expect(shouldBlock('/')).toBe(false);
  });

  it('allows /blog', () => {
    expect(shouldBlock('/blog')).toBe(false);
  });

  it('allows /admin', () => {
    expect(shouldBlock('/admin')).toBe(false);
  });

  it('allows /economics', () => {
    expect(shouldBlock('/economics')).toBe(false);
  });

  it('allows /api/subscribe', () => {
    expect(shouldBlock('/api/subscribe')).toBe(false);
  });

  it('allows /tools/compound-interest-calculator', () => {
    expect(shouldBlock('/tools/compound-interest-calculator')).toBe(false);
  });
});
