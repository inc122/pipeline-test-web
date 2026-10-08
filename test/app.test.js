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
    assert.deepEqual(res.body, { a: 2, b: 3, result: 5 });
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

describe('GET /mul', () => {
  it('returns the product of a and b as JSON', async () => {
    const res = await request(app).get('/mul').query({ a: 2, b: 5 });
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /application\/json/);
    assert.deepEqual(res.body, { a: 2, b: 5, result: 10 });
  });

  it('returns 400 when a parameter is missing', async () => {
    const res = await request(app).get('/mul').query({ a: 1 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('returns 400 when a parameter is not a number', async () => {
    const res = await request(app).get('/mul').query({ a: 'foo', b: 2 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});

describe('GET /div', () => {
  it('returns the quotient of a and b as JSON', async () => {
    const res = await request(app).get('/div').query({ a: 12, b: 6 });
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /application\/json/);
    assert.deepEqual(res.body, { a: 12, b: 6, result: 2 });
  });

  it('returns 400 when a parameter is missing', async () => {
    const res = await request(app).get('/div').query({ a: 1 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('returns 400 when a parameter is not a number', async () => {
    const res = await request(app).get('/div').query({ a: 'foo', b: 2 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  it('returns 400 when dividing by zero', async () => {
    const res = await request(app).get('/div').query({ a: 12, b: 0 });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });
});
