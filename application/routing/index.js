const express = require('express')
const router = new express.Router()

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
    const { params, db } = req
    db.find(params.name, params.id).then(results => {
      res.send(results)
    }, err => res.send(err))
  })
  .post('/:name', (req, res) => {
    const { body, db, params } = req
    db.insert(params.name, body)
    .then(data => res.send(data), err => res.send(err))
  })
  .put('/:name/:id', (req, res) => {
    const { body, db, params } = req
    db.replace(params.name, params.id, body)
    .then(data => res.send(data), err => res.send(err))
  })
  .patch('/:name/:id', (req, res) => {
    const { body, db, params } = req
    db.update(params.name, params.id, body)
    .then(data => res.send(data), err => res.status(412).send(err))
  })
  .delete('/:name/:id', (req, res) => {
    const { name, id } = req.params
    req.db.delete(name, id)
    .then(data => res.send(data), err => res.send(err))
  })
  return router
}

module.exports = routing
