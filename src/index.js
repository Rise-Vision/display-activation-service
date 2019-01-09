const express = require('express')
const http = require('http')
const HttpStatus = require('http-status-codes')
const randomstring = require('randomstring')
const fetch = require('node-fetch')
const jsonParser = require('body-parser').json()
const coreApiClient = require('./core-api-client')

const defaultPort = 80
const port = process.env.SERVER_PORT || defaultPort

const app = express()
app.use(express.static('public'))

const server = http.createServer(app)

const msServerUrl = 'http://127.0.0.1:9090'

const activations = new Map()

app.get('/activation', (req, res) => {
  const machineId = req.query.machineId
  if (!machineId) {
    return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Missing machineId param' })
  }

  const code = randomstring.generate({ length: 5, charset: 'alphanumeric', capitalization: 'uppercase' })
  activations.set(code, machineId)
  res.json({ code })
})

app.post('/activation', jsonParser, (req, res) => {
  if (!req.body || !req.body.code || !req.body.displayName || !req.body.companyId || !req.body.authToken) {
    return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Expected application/json, POST, {code, displayName, companyId, authToken}' })
  }

  const code = req.body.code
  if (!activations.has(code)) {
    return res.status(HttpStatus.BAD_REQUEST).send({ error: 'Invalid code' })
  }

  const machineId = activations.get(code)
  const { displayName, companyId, authToken } = req.body

  coreApiClient.createDisplay(displayName, companyId, authToken)
    .then(displayId => sendActivationMessage(machineId, displayId))
    .then(() => activations.delete(code))
    .then(() => res.status(HttpStatus.OK))
    .catch(err => {
      console.log(`Error on display activation ${JSON.stringify(err)}`)
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error when sending thte activation message' })
    })
})

function sendActivationMessage (machineId, displayId) {
  const url = `${msServerUrl}/messaging/activation`
  const body = { machineId, displayId }

  console.log(`Sending activation message to ${url} with body ${JSON.stringify(body)}`)

  return fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })
}

server.listen(port, (err) => {
  if (err) {
    return console.error('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
