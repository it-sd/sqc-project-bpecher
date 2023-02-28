const request = require('supertest')
const app = require('express')
const { Pool } = require('pg')
const pool = new Pool()

describe('app', () => {
  describe('GET /health', () => {
    it('responds with a status code between 200 and 399', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThanOrEqual(399)
    })
  })
})

describe('POST /trips', () => {
  it('should save trip data to the database', async () => {
    const tripData = { departure_date: '2023-03-01', arrival_date: '2023-03-15' }
    const response = await request(app)
      .post('/trips')
      .send(tripData)
      .set('Accept', 'application/json')
    expect(response.status).toBe(200)
    // Check that the data was actually saved to the database
    const db = await pool.connect()
    const result = await db.query('SELECT * FROM trips WHERE departure_date=$1 AND arrival_date=$2', [tripData.departure_date, tripData.arrival_date])
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].departure_date).toBe(tripData.departure_date)
    expect(result.rows[0].arrival_date).toBe(tripData.arrival_date)
    await db.release()
  })
})

describe('database queries', () => {
  // Test getting a trip by ID
  it('get trip by ID', async () => {
    const query = 'SELECT * FROM trip WHERE trip_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(1)
    expect(res.rows[0].trip_id).toBe(1)
  })

  // Test getting a schedule by ID
  it('get schedule by ID', async () => {
    const query = 'SELECT * FROM schedule WHERE schedule_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(1)
    expect(res.rows[0].schedule_id).toBe(1)
  })

  // Test getting all schedules for a trip
  it('get all schedules for a trip', async () => {
    const query = 'SELECT * FROM schedule WHERE trip_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(2)
  })
})
