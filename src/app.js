const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/sum', (req, res) => {
  const { a, b } = req.query;
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || a === '' || b === '' ||
      Number.isNaN(x) || Number.isNaN(y)) {
    return res.status(400).json({ error: 'Parameters "a" and "b" must be numbers' });
  }

  res.json({ a: x, b: y, sum: x + y });
});

module.exports = app;
