const r = require('rethinkdb')
const inspector = require('schema-inspector')
const md5 = require('md5')
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME,
}

const methods = require('config/db/methods')

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

/**
 * Determines if the Etag in the request matches the Etag in the database.
 *
 * @param {String} tableName
 * @param {String} id
 * @param {String} etag
 * @param {Object} connection - the active connection to the database
 * @returns {Promise|Boolean}
 */
function checkEtag(tableName, id, etag, connection) {
  return r.table(tableName).filter({ id }).run(connection)
  .then(cursor => cursor.next())
  .then(data => {
    console.log(data._etag, etag)
    if (data._etag === etag) return true
    return false
  })
}

// TODO: create a separate file for each of these db methods, they are going to end up needing much more logic

function createConnection(req, res, next) {
  r.connect(dbConfig)
  .then((connection) => {
    req.connection = connection
    req.db = {
      find(tableName, id) {
        return methods.find(tableName, id, req, connection)
      },
      insert(tableName, data) {
        return methods.insert(tableName, data, connection)
      },
      update(tableName, id, data) {
        return checkEtag(tableName, id, req.headers['if-match'], connection)
        .then(match => {
          if (match) {
            return methods.update(tableName, id, data, connection)
          }
          return new Promise((resolve, reject) => reject('Etag mismatch'))
        })
      },
      replace(tableName, id, data) {
        return checkEtag(tableName, id, req.headers['if-match'], connection)
        .then(match => {
          if (match) {
            return methods.replace(tableName, id, data, connection)
          }
          return new Promise((resolve, reject) => reject('Etag mismatch'))
        })
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
