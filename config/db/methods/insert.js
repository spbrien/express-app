const r = require('rethinkdb')
const md5 = require('md5')

function insert(tableName, data, connection) {
  data._created = r.now()
  data._etag = md5(JSON.stringify(data))
  return r.table(tableName).insert(data, { returnChanges: true }).run(connection)
}

module.exports = insert
