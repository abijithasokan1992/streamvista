const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { app } = require('../index');

test('GET / returns health text', async () => {
  const server = app.listen(0);
  try {
    const port = server.address().port;
    const body = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    assert.equal(body, 'Test server is running successfully!');
  } finally {
    server.close();
  }
});
