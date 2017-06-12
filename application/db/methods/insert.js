const r = require('rethinkdb')
const md5 = require('md5')
/* eslint-disable consistent-return */
function insert(tableName, data, connection) {
  let iterations = 0
  if (!Array.isArray(data)) {
    data = [data]
  }
  // TODO: replace all of these for loops... wtf?
  for (const item of data) {
    iterations++
    item._created = r.now()
    item._etag = md5(JSON.stringify(data))
    if (iterations === data.length) {
      return r.table(tableName).insert(data, { returnChanges: true }).run(connection)
    }
  }
}

module.exports = insert
