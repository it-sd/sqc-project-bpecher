// const { Pool } = require('pg')
// const request = require('supertest')
// const express = require('express')
// const app = require('../../server.js')

/*
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
*/

// const { google } = require('googleapis')

/*
require('dotenv').config()
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauthcallback'
)
*/

describe('GET /', function () {
  it('responds with 200', async function () {
    const response = await fetch('http://localhost:3000/')
    expect(response.status).toBe(200)
  })
})

describe('GET /about', function () {
  it('responds with 200', async function () {
    const response = await fetch('http://localhost:3000/about')
    expect(response.status).toBe(200)
  })
})

describe('GET /health', function () {
  it('responds with a status code between 200 and 399', async function () {
    const response = await fetch('http://localhost:3000/health')
    expect(response.status).toBeGreaterThanOrEqual(200)
    expect(response.status).toBeLessThanOrEqual(399)
  })
})

// Commenting out code as it is not required in submission of module 4
/*
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
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })
    const events = data.items
    const res = await request(app).get('/calendar')
    expect(res.statusCode).toEqual(200)
    expect(res.text).toMatch(events[0].summary)
  })
})
*/
