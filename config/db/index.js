const r = require('rethinkdb')

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME,
}


function createConnection(req, res, next) {
  r.connect(dbConfig)
  .then((connection) => {
    req.connection = connection
    req.db = {
      find(tableName) {
        return r.table(tableName).run(connection)
        .then(result => result.toArray())
      },
      insert(tableName, data) {
        return r.table(tableName).insert(data).run(connection)
      },
    }
    next()
  })
}


function closeConnection(req, res, next) {
  req.connection.close()
  next()
}

module.exports = {
  createConnection,
  closeConnection,
  dbConfig,

}
