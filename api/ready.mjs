const url = "https://ohumdxxhtgabpefrgsxr.supabase.co/rest/v1/sv_app_profiles?select=id&limit=0";
const key = "sb_publishable_ruAIHadjsZvJbLkOp0kF7Q_nfMuFU4d";

export default async function handler(_request, response) {
  response.setHeader("cache-control", "no-store");

  try {
    const result = await fetch(url, {
      headers: { apikey: key },
    });

    if (!result.ok) {
      return response.status(503).json({
        status: "not_ready",
        database: "unavailable",
      });
    }

    return response.status(200).json({
      status: "ready",
      database: "connected",
    });
  } catch {
    return response.status(503).json({
      status: "not_ready",
      database: "unavailable",
    });
  }
}
