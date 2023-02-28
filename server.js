const { Pool } = require('pg')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432
})

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

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

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.status(200).send('healthy')
  } catch (err) {
    res.status(500).send('Unable to connect to database')
  }
})

app.get('/trips', function (req, res) {
  pool.query('SELECT * FROM trips', function (err, result) {
    if (err) {
      console.error(err)
      res.status(500).send('Error retrieving trips')
    } else {
      res.render('pages/trips', { trips: result.rows })
    }
  })
})

app.post('/trips', (req, res) => {
  const { departure_date, arrival_date } = req.body

  // Insert data into the database
  const query = 'INSERT INTO trips(departure_date, arrival_date) VALUES ($1, $2)'
  const values = [departure_date, arrival_date]

  pool.query(query, values, (error, result) => {
    if (error) {
      res.status(500).send({ error: 'Error inserting data into database' })
    } else {
      res.send({ success: true })
    }
  })
})

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
