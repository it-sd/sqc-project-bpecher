const { Pool } = require('pg')
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

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

const { google } = require('googleapis')

require('dotenv').config()
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauthcallback'
)


app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('pages/index')
})

app.get('/about', async (req, res) => {
  res.render('pages/about')
})

app.get('/health', async function (req, res) {
  try {
    const result = await pool.query('SELECT * FROM schedule')
    res.status(200).send('healthy')
  } catch (err) {
    res.status(500).send('Unable to connect to database')
  }
})

app.get('/trips', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schedule')
    res.render('pages/trips', { schedule: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error retrieving trips')
  }
})

app.post('/trips', async (req, res) => {
  const { departure_date, arrival_date } = req.body
  res.render('trips', { departure_date: departure_date })

  // Insert data into the database
  const query = 'INSERT INTO schedule(departure_date, arrival_date ) VALUES ($1, $2)'
  const values = [arrival_date, departure_date]

  try {
    const result = await pool.query(query, values)
    res.send({ success: true })
  } catch (err) {
    res.status(500).send({ error: 'Error inserting data into database' })
  }
})

app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  res.redirect(authUrl)
})

app.get('/oauthcallback', async (req, res) => {
  const { code } = req.query
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)
  res.redirect('/calendar')
})

app.get('/calendar', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })
    const events = data.items
    res.render('pages/calendar', { events })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error retrieving calendar events')
  }
})

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
