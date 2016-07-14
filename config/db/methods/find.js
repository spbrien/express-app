const r = require('rethinkdb')
const _settings = require('../../../config/default_settings')


function composeResponse(result, _meta) {
  if (_meta) {
    return {
      result: result.toArray(),
      _meta,
    }
  }
  return {
    result: result.toArray(),
  }
}

/**
* Get the number of records in a given table.
*
* @param {String} tableName
* @param {Object} connection
* @returns {Integer}
*/
function getCount(tableName, connection) {
  return r.table(tableName).count().run(connection)
}

/**
* Constructs the '_meta' field in the response based on the pagination settings
*
* @param {String} tableName
* @param {Number} page
* @param {Integer} max_results
* @returns {Object}
*/
function constructMeta(tableName, max_results, connection, page = 1) {
  return getCount(tableName, connection).then(data => {
    return {
      max_results,
      total: data,
      page: parseInt(page),
    }
  })
}

/**
* Find specified resource/resources in the database
*
* @param {String} tableName
* @param {String} id
* @param {Object} req - request object (passed in from middleware)
* @param {Object} connection - active database connection (passed in from middleware)
* @returns {Object} - result of composeResponse
*/
function find(tableName, id, req, connection, settings = _settings) {
  // format 'where' query string into json
  let where = null
  // default db query - ordered by created time
  let query = r.table(tableName).orderBy(settings._CREATED_INDEX ? { index: r.desc('_created') } : r.desc('_created'))
  // parse query string into JSON
  if (req.query && req.query.where) {
    where = JSON.parse(req.query.where)
  }
  // filter if 'where' query is provided
  if (where) {
    query = query.filter(where)
  }

  if (id) {
    return r.table(tableName).filter({ id }).run(connection)
    .then(result => result.toArray())
  }
  // handles pagination if enabled in settings
  if (settings.PAGINATION && settings.PAGINATION_DEFAULT) {
    // if 'page' query string is passed
    if (req.query && req.query.page) {
      query = query.skip((req.query.page - 1) * settings.PAGINATION_DEFAULT).limit(settings.PAGINATION_DEFAULT).run(connection)
      return query
      .then(result => {
        return composeResponse(result, constructMeta(tableName, settings.PAGINATION_DEFAULT, connection, req.query.page))
      })
    }

    // default first page
    /* eslint-disable no-unneeded-ternary */
    query = query.limit(settings.PAGINATION_DEFAULT).run(connection)
    return query
    .then(result => {
      return composeResponse(result, constructMeta(tableName, settings.PAGINATION_DEFAULT, connection))
    })
  }
  // return all items if pagination disabled
  return r.table(tableName).run(connection)
  .then(result => {
    return composeResponse(result)
  })
}

module.exports = find
