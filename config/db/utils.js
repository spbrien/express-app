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


function createTable(config, name) {
  checkTables(name, (exists, connection) => {
    if (exists) {
      return false
    }
    r.db(config.db).tableCreate(name).run(connection)
    .then((err, result) => {
      if (err) console.dir(err)
      return result
    })
    return true
  })
}

function insert(name, data, connection, cb) {
  r.table(name).insert(data).run(connection, (err, result) => {
    if (err) throw err
    return cb(result)
  })
}

module.exports = {
  createTable,
  insert,
}
