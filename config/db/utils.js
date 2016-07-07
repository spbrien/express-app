const r = require('rethinkdb')
const dbConfig = require('./').dbConfig

// connect to db
function connect(config, cb) {
  r.connect(config, (err, connection) => {
    if (err) throw err
    return cb(connection)
  })
}

/**
* Check if a table exists in the db
*
* @param {String} name - name of the table
* @returns {Boolean}
*/
function checkTables(name, cb) {
  connect(dbConfig, connection => {
    r.db(dbConfig.db).tableList().run(connection, (err, tables) => {
      if (err) throw err
      const result = tables.indexOf(name) > -1
      return cb(result, connection)
    })
  })
}


function createTable(config, name, schema) {
  checkTables(name, (exists, connection) => {
    if (exists) {
      return false
    }
    r.db(config.db).tableCreate(name).run(connection)
    .then((err, result) => {
      if (err) console.dir(err)
      return result
    })
    .then(() => {
      // Create secondary indicies for orderBy, filtering etc.
      if (schema.hasOwnProperty('indicies')) {
        schema.indicies.forEach(idx => {
          r.table(name).indexCreate(idx)
          .run(connection)
        })
      }
    })
    return true
  })
}


module.exports = {
  createTable,
}
