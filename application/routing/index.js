
const express = require('express')
const router = express.Router()
const auth = require('../auth').checkToken
const parseRelation = require('../utils/helpers').parseRelation
const co = require('co')

function routing(schema) {
  router
  .get('/', (req, res) => {
    res.send('hello')
  })
  .get('/info', (req, res) => {
    res.send(schema)
  })
  .get('/info/:name', (req, res) => {
    res.send(schema[req.params.name])
  })
  .get('/:name', (req, res) => {
    co(function* () {
      const results = yield req.db.find(req.params.name)

      if (results) {
        const { _items, _meta } = {
          _items: yield results.result,
          _meta: yield results._meta,
        }
        const response = { _items, _meta }
        // TODO: remove parse relation function once JOINs or subqueries exist
        parseRelation(schema[req.params.name], response, req.connection, data => {
          res.send(data)
        })
      } else res.status(404).send('Resource not found')
    }).catch(() => {
      res.status(404).send('Resource not found')
    })
  })
  .get('/:name/:id', (req, res) => {
    const { params, db } = req
    db.find(params.name, params.id).then(results => {
      // TODO: remove parse relation function once JOINs or subqueries exist
      parseRelation(schema[req.params.name], results, req.connection, data => {
        res.send(data)
      })
    }, err => res.status(404).send(err.msg))
  })
  .post('/:name', (req, res) => {
    const { body, db, params } = req
    db.insert(params.name, body)
    .then(data => res.send(data), err => res.send(err))
  })
  .put('/:name/:id', (req, res) => {
    const { body, db, params } = req
    db.replace(params.name, params.id, body)
    .then(data => res.send(data), err => res.status(412).send(err))
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
