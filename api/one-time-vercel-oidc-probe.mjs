const PROJECT_ID = 'prj_9LRd7XDa1zJaGzADQd9uh7QtON6c';
const TEAM_ID = 'team_RZTE8Xin6e0xeDOCwU2JXy4K';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ ok: false, reason: 'method_not_allowed' });
  }

  const oidcToken = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (!oidcToken) {
    return response.status(200).json({
      ok: false,
      oidc_present: false,
      env_api_authorized: false,
      env_api_status: null,
    });
  }

  try {
    const probe = await fetch(
      `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${oidcToken}`,
          Accept: 'application/json',
        },
      },
    );

    return response.status(200).json({
      ok: true,
      oidc_present: true,
      env_api_authorized: probe.ok,
      env_api_status: probe.status,
    });
  } catch {
    return response.status(200).json({
      ok: false,
      oidc_present: true,
      env_api_authorized: false,
      env_api_status: 'network_error',
    });
  }
}
