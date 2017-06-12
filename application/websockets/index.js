const schema = require('../../config/schema')
const db = require('../db')
const R = require('ramda')
const r = require('rethinkdb')

function subscribe(resource) {

}

function ioFactory(io) {
  const resources = Object.keys(schema)
  db.socketConnection().then((connection) => {
    // subscribe to each item
    R.forEach((resource) => {
      subscription = io.of(`/${resource}`);
      subscription.on('connect', () => {
        console.log('client connected to ' + resource)
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
