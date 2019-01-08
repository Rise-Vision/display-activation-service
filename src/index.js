const express = require("express");
const http = require("http");
const HttpStatus = require('http-status-codes');
const randomstring = require("randomstring");

const defaultPort = 80;
const port = process.env.SERVER_PORT || defaultPort;

const app = express();
const server = http.createServer(app);

const activations = new Map();

app.get('/activation', (req, res) => {
  const machineId = req.query.machineId;
  if (!machineId) {
    return res.status(HttpStatus.BAD_REQUEST).json({error: "Missing machineId param"});
  }

  const code = randomstring.generate({length: 5, charset: "alphanumeric", capitalization: "uppercase"});
  activations.set(code, machineId);
  res.json({code});
});

server.listen(port, (err) => {
  if (err) {
    return console.error("something bad happened", err);
  }
  console.log(`server is listening on ${port}`);
});
