const express = require('express');

const app = express();

// Парсит и валидирует два числовых query-параметра `a` и `b`.
// Возвращает { x, y } при успехе либо { error } с текстом ошибки.
function parseOperands(req) {
  const { a, b } = req.query;
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || a === '' || b === '' ||
      Number.isNaN(x) || Number.isNaN(y)) {
    return { error: 'Parameters "a" and "b" must be numbers' };
  }

  return { x, y };
}

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/sum', (req, res) => {
  const { x, y, error } = parseOperands(req);
  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ a: x, b: y, result: x + y });
});

app.get('/mul', (req, res) => {
  const { x, y, error } = parseOperands(req);
  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ a: x, b: y, result: x * y });
});

app.get('/div', (req, res) => {
  const { x, y, error } = parseOperands(req);
  if (error) {
    return res.status(400).json({ error });
  }

  if (y === 0) {
    return res.status(400).json({ error: 'Division by zero is not allowed' });
  }

  res.json({ a: x, b: y, result: x / y });
});

module.exports = app;
