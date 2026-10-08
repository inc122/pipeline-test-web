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

  res.json({ a: x, b: y, result: x + y });
});

app.get('/mul', (req, res) => {
  const { a, b } = req.query;
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || a === '' || b === '' ||
      Number.isNaN(x) || Number.isNaN(y)) {
    return res.status(400).json({ error: 'Parameters "a" and "b" must be numbers' });
  }

  res.json({ a: x, b: y, result: x * y });
});

app.get('/div', (req, res) => {
  const { a, b } = req.query;
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || a === '' || b === '' ||
      Number.isNaN(x) || Number.isNaN(y)) {
    return res.status(400).json({ error: 'Parameters "a" and "b" must be numbers' });
  }

  if (y === 0) {
    return res.status(400).json({ error: 'Division by zero is not allowed' });
  }

  res.json({ a: x, b: y, result: x / y });
});

module.exports = app;
