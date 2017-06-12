const r = require('rethinkdb')
const md5 = require('md5')

function update(tableName, id, data, connection) {
  data._updated = r.now()
  data._etag = md5(JSON.stringify(data))
  return r.table(tableName).get(id).update(data, { returnChanges: true })
  .run(connection)
}

module.exports = update
