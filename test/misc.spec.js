/* global describe, it, expect */
const mockDb = require('./db_mock.spec.js')
const checkEtag = require('../config/db').checkEtag
const insert = require('../config/db/methods/insert')
describe('misc', () => {
  it('should check etags', done => {
    mockDb.rethinkInstance({}, done, rdb_info => {
      mockDb.createTestDB(rdb_info, { db_name: 'test' }, rdb_info.done, rdb_info => {
        mockDb.createTestTable(rdb_info, { table_name: 'test' }, rdb_info.done, rdb_info => {
          insert(rdb_info.table_name, { foo: 'bar' }, rdb_info.rdb_conn)
          .then(data => {
            const etag = data.changes[0].new_val._etag
            const id = data.changes[0].new_val.id
            checkEtag(rdb_info.table_name, id, etag, rdb_info.rdb_conn).then(data => {
              expect(data).toBeTruthy()
              rdb_info.done()
              done()
            })
          })
        })
      })
    })
  })
})
