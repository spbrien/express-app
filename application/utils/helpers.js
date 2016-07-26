const atob = require('atob')
const r = require('rethinkdb')

function decodeToken(token) {
  // Grab btoa string, decode, and separate username and password into variables
  if (token) {
    const authString = token.replace(/Basic/g, '')
    const decoded = atob(authString)
    const username = decoded.slice(0, decoded.indexOf(':'))
    const password = decoded.slice(decoded.indexOf(':') + 1)
    return { username, password }
  }
  return false
}

function parseRelation(schema, result, connection, cb) {
  if (schema.data_relations) {
    const relations = schema.data_relations
    let iterations = 0
    for (const key of Object.keys(relations)) {
      iterations++
      const { field } = relations[key]
      if (relations[key].embeddable) {
        for (const item of result._items) {
          if (item[key]) {
            r.table(relations[key].resource).filter(row => row(field).eq(item[key])).run(connection)
            .then(data => data.toArray())
            /* eslint-disable no-loop-func */
            .then(d => {
              item[key] = d[0]
              if (iterations === Object.keys(relations).length) {
                cb(result)
              }
            })
          }
        }
      }
    }
  } else cb(result)
}

module.exports = { decodeToken, parseRelation }
