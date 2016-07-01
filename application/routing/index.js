const express = require('express')
const router = express.Router();

function routing(schema) {
  router
    .get('/info', (req, res) => {
      res.send(schema)
    })
    .get('/info/:name', (req, res) => {
      res.send(schema[req.params.name])
    })
    .get('/:name', (req, res) => {
      req.db.find(req.params.name)
      .then((results) => {
        res.send(results)
      })
    })
    .get('/:name/:id', (req, res) => {
      res.send(req.params)
    })
    .post('/:name', (req, res) => {
      res.send(req.params)
    })
    .put('/:name/:id', (req, res) => {
      res.send(req.params)
    })
    .patch('/:name/:id', (req, res) => {
      res.send(req.params)
    })
  return router
}

module.exports = routing
