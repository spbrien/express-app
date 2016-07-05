const r = require('rethinkdb')
const inspector = require('schema-inspector')

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME,
}

function validate(schema) {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      // Hack to get the resource name because for some reason req.params is undefined here
      const param = req.originalUrl.replace('/api/v1/', '').split('/')[0]
      const validation = inspector.validate(schema[param], req.body)
      if (validation.valid) {
        return next()
      }
      return res.status(400).send(validation.format())
    }
    return next()
  }
}

function createConnection(req, res, next) {
  r.connect(dbConfig)
  .then((connection) => {
    req.connection = connection
    req.db = {
      find(tableName, id) {
        if (id) {
          return r.table(tableName).filter({ id }).run(connection)
          .then(result => result.toArray())
        }
        return r.table(tableName).run(connection)
        .then(result => result.toArray())
      },
      insert(tableName, data) {
        return r.table(tableName).insert(data).run(connection)
      },
      update(tableName, id, data) {
        return r.table(tableName).get(id).update(data)
        .run(connection)
      },
      replace(tableName, id, data) {
        return r.table(tableName).get(id).replace(data)
        .run(connection)
      },
      delete(tableName, id) {
        return r.table(tableName).get(id).delete()
        .run(connection)
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
  validate,

}
