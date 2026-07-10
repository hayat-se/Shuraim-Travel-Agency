const request = require('supertest');
const createApp = require('../src/app');

const app = createApp();

// These paths never reach the database — they exercise routing, auth, validation,
// CORS and the central error handler, so they run without a live DB.
describe('API middleware & routing (no DB required)', () => {
  test('unknown route returns 404 with JSON error', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('protected route without a token returns 401', async () => {
    const res = await request(app).get('/api/dashboard/admin/stats');
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/no token/i);
  });

  test('protected route with an invalid token returns 401', async () => {
    const res = await request(app).get('/api/bookings/my-bookings').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('admin login rejects an invalid email before touching the DB (validation 400)', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('agency register rejects a short password (validation 400)', async () => {
    const res = await request(app)
      .post('/api/auth/agency/register')
      .send({ agencyName: 'Test', email: 'a@b.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});
