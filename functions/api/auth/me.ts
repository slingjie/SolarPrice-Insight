import { getAccessEmail } from '../../_shared/access';

const json = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export const onRequestGet = async (context: { request: Request; env: Record<string, unknown> }): Promise<Response> => {
  try {
    const email = getAccessEmail(context.request, context.env);
    if (email) {
      return json({ email, authenticated: true });
    }
    return json({ email: null, authenticated: false });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('[auth/me] Unexpected error:', error);
    return json({ error: 'Internal Server Error' }, 500);
  }
};
