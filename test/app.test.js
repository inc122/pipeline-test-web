const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('returns Hello World', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.text, 'Hello World');
  });
});

describe('GET /sum', () => {
  it('returns the sum of a and b as JSON', async () => {
    const res = await request(app).get('/sum').query({ a: 2, b: 3 });
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /application\/json/);
    assert.deepEqual(res.body, { a: 2, b: 3, sum: 5 });
  });

  it('returns 400 when a parameter is missing', async () => {
    const res = await request(app).get('/sum').query({ a: 1 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('returns 400 when a parameter is not a number', async () => {
    const res = await request(app).get('/sum').query({ a: 'foo', b: 2 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});
