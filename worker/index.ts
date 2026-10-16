// GitHub sign-in for the Sveltia CMS admin page (/admin/). Everything else on the site is served
// from static assets; wrangler.jsonc only routes /oauth/* through this Worker.
//
// Adapted from Sveltia CMS Authenticator (MIT), https://github.com/sveltia/sveltia-cms-auth,
// trimmed to GitHub and to this site: the popup and the admin page share an origin, so the token
// is only ever posted to that origin.
//
// Flow: the CMS opens /oauth/authorize in a popup → GitHub → /oauth/redirect, which exchanges the
// code for a token and hands it to the CMS window with postMessage.
//
// Secrets (Worker settings → Variables and Secrets): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.

interface WorkerEnv {
  ASSETS: Fetcher;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

const STATE_COOKIE = 'oauth-state';

/** Scopes the CMS may ask for; anything else falls back to the default. */
const ALLOWED_SCOPES = ['repo', 'public_repo', 'user', 'read:user', 'user:email'];
const DEFAULT_SCOPE = 'repo,user';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/oauth/authorize') {
      return authorize(url, env);
    }

    if (request.method === 'GET' && url.pathname === '/oauth/redirect') {
      return redirect(request, url, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<WorkerEnv>;

function authorize(url: URL, env: WorkerEnv): Response {
  if (url.searchParams.get('provider') !== 'github') {
    return result({ error: 'Only GitHub sign-in is supported.', errorCode: 'UNSUPPORTED_BACKEND' });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return result({ error: 'OAuth app client ID or secret is not configured.', errorCode: 'MISCONFIGURED_CLIENT' });
  }

  const state = crypto.randomUUID().replaceAll('-', '');
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/oauth/redirect`,
    scope: scope(url.searchParams.get('scope')),
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      // SameSite=Lax so the cookie comes back on GitHub's redirect to /oauth/redirect.
      'Set-Cookie': `${STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=600`,
    },
  });
}

async function redirect(request: Request, url: URL, env: WorkerEnv): Promise<Response> {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expectedState = request.headers.get('Cookie')?.match(/(?:^|;\s*)oauth-state=([0-9a-f]{32})(?:;|$)/)?.[1];

  if (!code || !state) {
    return result({
      error: 'Failed to receive an authorization code. Please try again.',
      errorCode: 'AUTH_CODE_REQUEST_FAILED',
    });
  }

  if (!expectedState || state !== expectedState) {
    return result({ error: 'Potential CSRF attack detected. Authentication flow aborted.', errorCode: 'CSRF_DETECTED' });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return result({ error: 'OAuth app client ID or secret is not configured.', errorCode: 'MISCONFIGURED_CLIENT' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/oauth/redirect`,
      }),
    });
    const data = await response.json<{ access_token?: string; error?: string; error_description?: string }>();

    if (data.access_token) {
      return result({ token: data.access_token });
    }

    return result({
      error: data.error_description ?? data.error ?? 'GitHub did not return an access token.',
      errorCode: 'TOKEN_REQUEST_FAILED',
    });
  } catch {
    return result({
      error: 'Failed to request an access token. Please try again later.',
      errorCode: 'TOKEN_REQUEST_FAILED',
    });
  }
}

function scope(requested: string | null): string {
  const scopes = (requested ?? '').split(/[\s,]+/).filter(Boolean);

  return scopes.length > 0 && scopes.every((s) => ALLOWED_SCOPES.includes(s)) ? scopes.join(',') : DEFAULT_SCOPE;
}

/** Popup page that hands the result to the CMS window, using the Netlify/Decap CMS message protocol. */
function result({ token, error, errorCode }: { token?: string; error?: string; errorCode?: string }): Response {
  const message = token
    ? `authorization:github:success:${JSON.stringify({ provider: 'github', token })}`
    : `authorization:github:error:${JSON.stringify({ provider: 'github', error, errorCode })}`;
  const nonce = crypto.randomUUID();
  const script = `
    const message = ${JSON.stringify(message).replaceAll('<', '\\u003c')};
    window.addEventListener('message', ({ data, origin }) => {
      if (data === 'authorizing:github' && origin === location.origin) {
        window.opener?.postMessage(message, location.origin);
      }
    });
    window.opener?.postMessage('authorizing:github', location.origin);
  `;

  return new Response(`<!doctype html><html><body><script nonce="${nonce}">${script}</script></body></html>`, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'`,
      'Referrer-Policy': 'no-referrer',
      'Set-Cookie': `${STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=0`,
    },
  });
}
