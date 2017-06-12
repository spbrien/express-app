const r = require('rethinkdb')
const inspector = require('schema-inspector')
const methods = require('./methods')
const co = require('co')
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  db: process.env.DB_NAME,
}


function validate(schema) {
  return (req, res, next) => {
    // Hack to get the resource name because for some reason req.params is undefined here
    // TODO: figure out why req.params is undefined
    const param = req.originalUrl.replace('/api/v1/', '').split('/')[0]

    if (schema[param] && schema[param].allowed_methods) {
      if (schema[param].allowed_methods.indexOf(req.method) === -1) {
        return res.status(405).send('Method not alowed')
      }
    }
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      // if single item passed in, wrap it in an array in order to run through loop
      if (!Array.isArray(req.body)) {
        req.body = [req.body]
      }
      for (const item of req.body) {
        const validation = inspector.validate(schema[param], item)
        // if one of the items fails validation, break loop and respond with error
        if (!validation.valid) {
          return res.status(400).send(validation.format())
        }
        // TODO: validate relationships?
      }
    }
    next()
  }
}

/**
* Determines if the Etag in the request matches the Etag in the database.
*
* @param {String} tableName
* @param {String} id
* @param {String} etag
* @param {Object} connection - the active connection to the database
* @returns {Boolean}
*/
function checkEtag(tableName, id, etag, connection) {
  return co(function* () {
    const result = yield r.table(tableName).filter({ id }).run(connection)
    if (result._etag === etag) return true
    return false
  })
}


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
        if (Array.isArray(data)) data = data[0]

        if (checkEtag(tableName, id, req.headers['if-match'], connection)) {
          return methods.update(tableName, id, data, connection)
        }
        return new Promise((resolve, reject) => reject('Etag mismatch'))
      },
      replace(tableName, id, data) {
        if (Array.isArray(data)) data = data[0]

        if (checkEtag(tableName, id, req.headers['if-match'], connection)) {
          return methods.replace(tableName, id, data, connection)
        }
        return new Promise((resolve, reject) => reject('Etag mismatch'))
      },
      delete(tableName, id) {
        return r.table(tableName).get(id).delete()
        .run(connection)
      },
    }
  })
  .finally(() => {
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
  checkEtag,

}
