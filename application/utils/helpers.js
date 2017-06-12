const atob = require('atob')
const r = require('rethinkdb')

function decodeUser(authHeader) {
  // Grab btoa string, decode, and separate username and password into variables
  if (authHeader) {
    const authString = authHeader.replace(/Basic/g, '')
    const decoded = atob(authString)
    const username = decoded.slice(0, decoded.indexOf(':'))
    const password = decoded.slice(decoded.indexOf(':') + 1)
    return { username, password }
  }
  return false
}

// TODO: Replace this entire function by using JOINs or Subqueries in the config/db/methods files
/**
 * Parses "data_relations" of a schema and supplies embedded resources if enabled
 *
 * @param {Object} schema
 * @param {Array} result - result of the database "find" method
 * @param {Object} connection - rethinkdb connection
 * @param {Function} callback
 * @returns {Object} result with embedded resources
 */
function parseRelation(schema, result, connection, cb) {
  if (schema.data_relations && result.length) {
    const relations = schema.data_relations
    let iterations = 0
    // iterate over each field in a schema's data_relations
    for (const key of Object.keys(relations)) {
      iterations++
      const { field } = relations[key]
      // if the resource is embeddable, loop through them all and embed
      if (relations[key].embeddable) {
        const res = result._items ? result._items : result
        let resultIterations = 0
        let match = false
        for (const item of res) {
          resultIterations++
          if (item[key]) {
            match = true
          // if an item in the collection contains the embedded field, fetch that resource from the database and reassign it
            r.table(relations[key].resource).filter(row => row(field).eq(item[key])).run(connection)
            .then(data => data.toArray())
            /* eslint-disable no-loop-func */
            .then(d => {
              item[key] = d[0]
              // if all items have been iterated over, execute the callback
              if (iterations === Object.keys(relations).length) {
                cb(result)
              }
            })
            // if all loops are complete and no matches, return unmodified result
          } else if ((resultIterations === res.length) && (iterations === Object.keys(relations).length) && !match) {
            cb(result)
          }
        }
      }
    }
    // if no data_relations, pass through the original result
  } else cb(result)
}

module.exports = { decodeUser, parseRelation }
