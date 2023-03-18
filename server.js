const { google } = require('googleapis')
const calendar = google.calendar('v3')
require('dotenv').config()
const { Pool } = require('pg')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://plan-to-travel-wth-me.onrender.com/oauthcallback'
)

oauth2Client.setCredentials({
  access_token: process.env.ACCESS_TOKEN,
  refresh_token: process.env.REFRESH_TOKEN
})

async function addTripToCalendar (tripId, departureDate, arrivalDate) {
  try {
    const eventStartTime = new Date(departureDate).toISOString()
    const eventEndTime = new Date(arrivalDate).toISOString()

    const event = {
      summary: `Trip ${tripId}`,
      start: {
        dateTime: eventStartTime,
        timeZone: 'America/Chicago'
      },
      end: {
        dateTime: eventEndTime,
        timeZone: 'America/Chicago'
      },
      reminders: {
        useDefault: true
      }
    }

    const calendarResponse = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'df56892f6c27b1006ad8f5a7b418d7448a4ab0b31c2a100d55932fee14e9b706@group.calendar.google.com',
      resource: event
    })

    console.log('Calendar event created:', calendarResponse.data.htmlLink)
  } catch (err) {
    console.error('Error adding trip to Google Calendar:', err)
  }
}

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', async function (req, res) {
  res.render('pages/index')
})

app.get('/about', async function (req, res) {
  res.render('pages/about')
})

app.get('/health', async function (req, res) {
  try {
    await pool.query('SELECT * FROM schedule')
    res.status(200).send('healthy')
  } catch (err) {
    res.status(500).send('Unable to connect to database')
  }
})

app.get('/trips', async function (req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM schedule')
    res.render('pages/trips', { schedule: rows })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error retrieving trips')
  }
})

app.post('/trips/add', async function (req, res) {
  const { schedule_id, trip_id, departure_date, arrival_date } = req.body
  try {
    // Check if a record with the same schedule_id and trip_id already exists in the database
    const existingSchedule = await pool.query('SELECT * FROM schedule WHERE schedule_id = $1 AND trip_id = $2', [schedule_id, trip_id])
    if (existingSchedule.rows.length > 0) {
      res.status(400).send('Schedule ID and Trip ID already in use. Please use the back button in your browser.')
      return
    }

    let newTripResult
    let newTripId
    // If trip_id is not already in use, insert it into the trips table
    if (!trip_id) {
      newTripResult = await pool.query('INSERT INTO trips DEFAULT VALUES RETURNING trip_id')
      newTripId = newTripResult.rows[0].trip_id
    } else {
      newTripResult = await pool.query('INSERT INTO trips (trip_id) VALUES ($1) RETURNING trip_id', [trip_id])
      newTripId = trip_id
    }

    // Insert schedule information into schedule table
    await pool.query('INSERT INTO schedule (schedule_id, trip_id, departure_date, arrival_date) VALUES ($1, $2, $3, $4)', [schedule_id, newTripId, departure_date, arrival_date])
    // Add the trip to Google Calendar
    await addTripToCalendar(newTripId, departure_date, arrival_date)
    res.redirect('/trips')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error adding trip to database')
  }
})

app.delete('/trips/:trip_id', async function (req, res) {
  const trip_id = req.params.trip_id
  try {
    // Check if the schedule with the given trip_id exists in the database
    const existingSchedule = await pool.query('SELECT * FROM schedule WHERE trip_id = $1', [trip_id])
    if (existingSchedule.rows.length === 0) {
      res.status(404).send('Schedule not found')
      return
    }

    // Delete the schedule from the schedule table
    await pool.query('DELETE FROM schedule WHERE trip_id = $1', [trip_id])

    // Check if the trip is still being used by any other schedules
    const schedulesWithTrip = await pool.query('SELECT * FROM schedule WHERE trip_id = $1', [trip_id])
    if (schedulesWithTrip.rows.length === 0) {
      // Delete the corresponding trip from the trips table
      await pool.query('DELETE FROM trips WHERE trip_id = $1', [trip_id])
    }

    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error deleting schedule')
  }
})

app.get('/auth', async function (req, res) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar']
  })
  res.redirect(authUrl)
})

app.get('/oauthcallback', async function (req, res) {
  const { code } = req.query
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  res.redirect('/calendar')
})

app.get('/calendar', async function (req, res) {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })
    const events = data.items
    res.render('pages/calendar', { events })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error retrieving calendar events')
  }
})

app.listen(port, async function () {
  console.log(`App listening at port ${port}`)
})
