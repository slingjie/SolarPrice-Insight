const ACCESS_EMAIL_HEADER = 'CF-Access-Authenticated-User-Email';
const DEV_EMAIL_HEADER = 'x-sync-dev-email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const unauthorizedResponse = (message: string): Response =>
  new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const getAccessEmail = (request: Request, env: Record<string, unknown>): string | null => {
  const accessEmail = request.headers.get(ACCESS_EMAIL_HEADER);
  const devEmail = request.headers.get(DEV_EMAIL_HEADER);
  const email = (accessEmail || devEmail || '').trim();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email;
};

export const requireAccessEmail = (request: Request, env: Record<string, unknown>): string => {
  const email = getAccessEmail(request, env);
  if (!email) {
    throw unauthorizedResponse('Unauthorized');
  }
  return email;
};
