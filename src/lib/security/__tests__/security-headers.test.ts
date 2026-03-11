import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const headersFile = readFileSync(
  resolve(process.cwd(), 'public/_headers'),
  'utf-8',
);

describe('Security Headers — _headers file', () => {
  it('sets X-Frame-Options to DENY', () => {
    expect(headersFile).toContain('X-Frame-Options: DENY');
  });

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(headersFile).toContain('X-Content-Type-Options: nosniff');
  });

  it('sets Referrer-Policy', () => {
    expect(headersFile).toContain('Referrer-Policy: strict-origin-when-cross-origin');
  });

  it('sets Permissions-Policy restricting camera, microphone, geolocation', () => {
    expect(headersFile).toContain('Permissions-Policy: camera=(), microphone=(), geolocation=()');
  });

  it('sets Strict-Transport-Security with long max-age', () => {
    expect(headersFile).toMatch(/Strict-Transport-Security:.*max-age=\d{7,}/);
  });

  it('includes includeSubDomains in HSTS', () => {
    expect(headersFile).toContain('includeSubDomains');
  });

  it('includes preload in HSTS', () => {
    expect(headersFile).toContain('preload');
  });

  it('sets Content-Security-Policy', () => {
    expect(headersFile).toContain('Content-Security-Policy:');
  });

  it('CSP sets default-src to self', () => {
    expect(headersFile).toMatch(/default-src 'self'/);
  });

  it('CSP sets object-src to none', () => {
    expect(headersFile).toContain("object-src 'none'");
  });

  it('CSP sets base-uri to self', () => {
    expect(headersFile).toContain("base-uri 'self'");
  });

  it('CSP sets form-action to self', () => {
    expect(headersFile).toContain("form-action 'self'");
  });

  it('CSP allows Supabase connections', () => {
    expect(headersFile).toContain('*.supabase.co');
  });

  it('CSP allows Sentry connections', () => {
    expect(headersFile).toContain('*.sentry.io');
  });

  it('CSP allows Google AdSense scripts', () => {
    expect(headersFile).toContain('pagead2.googlesyndication.com');
  });

  it('prevents admin page caching', () => {
    const adminSection = headersFile.split('/admin/*')[1];
    expect(adminSection).toBeTruthy();
    expect(adminSection).toContain('no-store');
    expect(adminSection).toContain('no-cache');
  });

  it('blocks admin pages from search indexing', () => {
    const adminSection = headersFile.split('/admin/*')[1];
    expect(adminSection).toContain('noindex');
    expect(adminSection).toContain('nofollow');
  });
});
