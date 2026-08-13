module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) return res.status(200).json({ reply: 'Add GEMINI_API_KEY in Vercel Env Vars', navigate: null });
  try {
    const { message } = req.body || {};
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + key, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Founder OS 21/139/34 User:' + message + ' Reply with [NAVIGATE:/path] if needed' }] }] })
    });
    const d = await r.json();
    let reply = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Ready Founder!';
    const m = reply.match(/\[NAVIGATE:(.*?)\]/);
    return res.status(200).json({ reply: reply.replace(/\[NAVIGATE:.*?\]/g,''), navigate: m? m[1] : null });
  } catch(e) { return res.status(200).json({ reply: 'AI Error: ' + e.message, navigate: null }); }
}
