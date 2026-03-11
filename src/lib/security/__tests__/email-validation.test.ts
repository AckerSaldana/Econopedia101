import { describe, it, expect } from 'vitest';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const MAX_EMAIL_LENGTH = 254;

function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: 'Invalid email address' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true };
}

describe('Email Validation — subscribe endpoint', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com')).toEqual({ valid: true });
  });

  it('accepts email with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toEqual({ valid: true });
  });

  it('accepts email with plus addressing', () => {
    expect(validateEmail('user+tag@example.com')).toEqual({ valid: true });
  });

  it('accepts email with dots in local part', () => {
    expect(validateEmail('first.last@example.com')).toEqual({ valid: true });
  });

  it('trims whitespace and lowercases', () => {
    expect(validateEmail('  User@Example.COM  ')).toEqual({ valid: true });
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects null', () => {
    expect(validateEmail(null)).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects undefined', () => {
    expect(validateEmail(undefined)).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects number', () => {
    expect(validateEmail(12345)).toEqual({ valid: false, error: 'Email is required' });
  });

  it('rejects email without @', () => {
    expect(validateEmail('userexample.com')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects email without domain', () => {
    expect(validateEmail('user@')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects email without local part', () => {
    expect(validateEmail('@example.com')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects email with spaces', () => {
    expect(validateEmail('user @example.com')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects email exceeding 254 characters', () => {
    const longEmail = `${'a'.repeat(245)}@example.com`; // 257 chars
    expect(validateEmail(longEmail)).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects email with null bytes', () => {
    expect(validateEmail('user\x00@example.com')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });

  it('rejects script injection in email', () => {
    expect(validateEmail('<script>alert(1)</script>@evil.com')).toEqual({
      valid: false,
      error: 'Invalid email address',
    });
  });
});
