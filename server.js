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

const request = require('supertest')

describe('app', () => {
  describe('GET /health', () => {
    it('responds with a status code between 200 and 399', async () => {
      const response = await request(app).get('/health')
      expect(response.status).toBeGreaterThanOrEqual(200)
      expect(response.status).toBeLessThanOrEqual(399)
    })
  })
})

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
      res.render('trips', { trips: result.rows })
    }
  })
})

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
