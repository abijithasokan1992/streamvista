export default function handler(_request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  return response.status(200).json({ status: "ok", service: "streamvista", timestamp: new Date().toISOString() });
}
