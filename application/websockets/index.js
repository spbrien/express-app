const schema = require('../../config/schema')
const db = require('../db')
const R = require('ramda')
const r = require('rethinkdb')
const settings = require('../../config/default_settings.js')
const socketToken = require('../auth').socketToken

function subscribe(resource) {

}

function ioFactory(io, secret) {
  const resources = Object.keys(schema)
  db.socketConnection().then((connection) => {
    // subscribe to each item
    R.forEach((resource) => {
      subscription = io.of(`/${resource}`);
      subscription.use((socket, next) => {
        const token = socket.handshake.query.token
        socketToken(resource, token, secret, next)
      })
      subscription.on('connect', () => {
        console.log('client connected to ' + resource)
      })
      subscription.on('error', (err) => {
        console.log('error ' + err)
      })
      r.table(resource).changes().run(connection, (err, cursor) => {
        if (err) {
          console.log(err)
          return
        }
        cursor.on("error", function(error) {
          console.log('cursor error: ', error)
        })
        cursor.on("data", function(message) {
          console.log('data sending')
          subscription.emit('data', message.new_val)
        })
      })
    }, resources)
  })
}

module.exports = ioFactory
