import * as Sentry from '@sentry/browser';

export function initSentry() {
  const dsn = import.meta.env.PUBLIC_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0,
  });
}

export const captureException = Sentry.captureException.bind(Sentry);
