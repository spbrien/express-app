const express = require('express')
const router = new express.Router()
const auth = require('config/auth').checkToken
const parseRelation = require('../utils/helpers').parseRelation

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
  /*  if (req.params.name === 'accounts') {
      res.status(405).send('Method not allowed')
    } else { */
    req.db.find(req.params.name)
      .then((results) => {
        // _meta and result are both promises so we need to resolve them individually before sending response
        Promise.resolve(results.result)
        .then(data => {
          Promise.resolve(results._meta)
          .then(meta => {
            const response = { _items: data, _meta: meta }
            parseRelation(schema[req.params.name], response, req.connection, data => {
              res.send(data)
            })
          })
        })
      }, err => res.status(404).send(err.msg))
  //  }
  })
  .get('/:name/:id', (req, res) => {
    const { params, db } = req
    db.find(params.name, params.id).then(results => {
      parseRelation(schema[req.params.name], results, req.connection, data => {
        res.send(data)
      })
      // res.send(results)
    }, err => res.status(404).send(err.msg))
  })
  .post('/:name', auth, (req, res) => {
    const { body, db, params } = req
    db.insert(params.name, body)
    .then(data => res.send(data), err => res.send(err))
  })
  .put('/:name/:id', auth, (req, res) => {
    const { body, db, params } = req
    db.replace(params.name, params.id, body)
    .then(data => res.send(data), err => res.send(err))
  })
  .patch('/:name/:id', auth, (req, res) => {
    const { body, db, params } = req
    db.update(params.name, params.id, body)
    .then(data => res.send(data), err => res.status(412).send(err))
  })
  .delete('/:name/:id', auth, (req, res) => {
    const { name, id } = req.params
    req.db.delete(name, id)
    .then(data => res.send(data), err => res.send(err))
  })
  return router
}

module.exports = routing
