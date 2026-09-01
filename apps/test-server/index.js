const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Test server is running successfully!');
});

app.listen(port, () => {
  console.log(`Test server listening at http://localhost:${port}`);
});
