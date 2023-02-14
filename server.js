const express = require('express');
const app = express();
const path = require('path')
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/about', (req, res) => {
    res.render('pages/about')
})

app.get('/health', (req, res) => {
    res.status(200).send('healthy');
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})