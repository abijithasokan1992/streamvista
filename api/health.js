module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    project: 'uakpqqardziifcwzvgfx',
    titles: 21, drafts: 139, screenings: 34, views: 70,
    timestamp: new Date().toISOString()
  });
}
