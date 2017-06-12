const r = require('rethinkdb')
const md5 = require('md5')

function replace(tableName, id, data, connection) {
  data._updated = r.now()
  data._etag = md5(JSON.stringify(data))
  return r.table(tableName).get(id).replace(data, { returnChanges: true })
  .run(connection)
}

module.exports = replace
