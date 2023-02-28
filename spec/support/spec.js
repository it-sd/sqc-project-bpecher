const request = require('supertest')

jasmine.describe('app', () => {
  jasmine.describe('GET /health', () => {
    it('responds with a status code between 200 and 399', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThanOrEqual(399);
    });
  });
});