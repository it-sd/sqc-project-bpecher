const { Pool } = require('pg')
const pool = new Pool()

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
