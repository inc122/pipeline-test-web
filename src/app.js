const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

// Разбирает параметры a и b из query-строки.
// Возвращает { x, y } с числами либо { error } при некорректном вводе.
function parseOperands(query) {
  const { a, b } = query;
  const x = Number(a);
  const y = Number(b);

  if (a === undefined || b === undefined || a === '' || b === '' ||
      Number.isNaN(x) || Number.isNaN(y)) {
    return { error: 'Parameters "a" and "b" must be numbers' };
  }

  return { x, y };
}

app.get('/sum', (req, res) => {
  const { x, y, error } = parseOperands(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ a: x, b: y, result: x + y });
});

app.get('/mul', (req, res) => {
  const { x, y, error } = parseOperands(req.query);
  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ a: x, b: y, result: x * y });
});

module.exports = app;
