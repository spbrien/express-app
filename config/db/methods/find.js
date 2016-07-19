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
* @param {Object} settings - overrides default_settings.js if passed in, else refers to default_settings
* @returns {Object} - result of composeResponse
*/
function find(tableName, id, req, connection, settings = _settings) {
  let where = null
  let query = r.table(tableName)
  // parse query string into JSON
  if (req.query && req.query.where) {
    where = JSON.parse(req.query.where)
  }
  // handle sorting of results
  if (req.query && req.query.sort) {
    const q = req.query.sort
    // e.g '?sort=-author' should sort descending, else ascending by default
    query = (q.substring(0, 1) === '-') ? query.orderBy(r.desc(q.slice(1, q.length))) : query.orderBy(r.asc(q))
  } else {
    // sort by _created in descending order by default
    query = query.orderBy(settings._CREATED_INDEX ? { index: r.desc('_created') } : r.desc('_created'))
  }

  // filter if necessary
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
      return query.skip((req.query.page - 1) * settings.PAGINATION_DEFAULT).limit(settings.PAGINATION_DEFAULT).run(connection)
      .then(result => {
        return composeResponse(result, constructMeta(tableName, settings.PAGINATION_DEFAULT, connection, req.query.page))
      })
    }

  // default first page
    return query.limit(settings.PAGINATION_DEFAULT).run(connection)
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
