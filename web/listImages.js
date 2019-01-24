const { readdirSync } = require('fs')
const express = require('express')
const app = express()

const filesA = readdirSync('../data/a')
const filesB = readdirSync('../data/b')

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(express.static('../data/'))

app.get('/a.json', (req, res) => { res.send(filesA) })
app.get('/b.json', (req, res) => { res.send(filesB) })

app.listen(3000, () => { console.log('Server is up') })