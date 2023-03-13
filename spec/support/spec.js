const { Pool } = require('pg')
const request = require('supertest')
const express = require('express')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
})

const app = express()
const { google } = require('googleapis')

require('dotenv').config()
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauthcallback'
)

describe('GET /health', function () {
  it('responds with a status code between 200 and 399', async function () {
    const response = await fetch('http://localhost:3000/health')
    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThanOrEqual(399)
  })
})


describe('POST /trips', function () {
  it('should save trip data to the database', async function () {
    const tripData = { departure_date: '2023-03-01', arrival_date: '2023-03-15' }
    const response = await fetch('http://localhost:3000', {method: 'POST', body: tripData})
      //.post('/trips')
      //.send(tripData)
      //.set('Accept', 'application/json')
    expect(response.status).toBe(200)
    // Check that the data was actually saved to the database
    const db = await pool.connect()
    const result = await db.query('SELECT * FROM schedule WHERE departure_date=$1 AND arrival_date=$2', [tripData.departure_date, tripData.arrival_date])
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].departure_date).toBe(tripData.departure_date)
    expect(result.rows[0].arrival_date).toBe(tripData.arrival_date)
    await db.release()
  })
})

describe('database queries', function () {
  // Test getting a trip by ID
  it('get trip by ID', async function () {
    const query = 'SELECT * FROM trips WHERE trip_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(1)
    expect(res.rows[0].trip_id).toBe(1)
  })

  // Test getting a schedule by ID
  it('get schedule by ID', async function () {
    const query = 'SELECT * FROM schedule WHERE schedule_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(1)
    expect(res.rows[0].schedule_id).toBe(1)
  })

  // Test getting all schedules for a trip
  it('get all schedules for a trip', async function () {
    const query = 'SELECT * FROM schedule WHERE trip_id = $1'
    const values = [1]
    const res = await pool.query(query, values)
    expect(res.rows.length).toBe(2)
  })
})
describe('OAuth2', function () {
  it('redirects the user to the Google Calendar authorization URL', async function () {
  const res = await request(app).get('/auth')
  expect(res.statusCode).toEqual(302)
  expect(res.header.location).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/)
  })

  it('exchanges the authorization code for an access token and refresh token', async function () {
  const { tokens } = await oauth2Client.getToken()
  expect(tokens).toHaveProperty('access_token')
  expect(tokens).toHaveProperty('refresh_token')
  })

  it('displays the user\'s Google Calendar events', async function () {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  })
  const events = data.items;
  const res = await request(app).get('/calendar');
  expect(res.statusCode).toEqual(200);
  expect(res.text).toMatch(events[0].summary);
  })
})
