/* global describe, it, expect, beforeEach */
const mockDb = require('./db_mock.spec.js')
const find = require('../config/db/methods/find')
const insert = require('../config/db/methods/insert')

describe('insert', () => {
  let info
  beforeEach(done => {
    mockDb.rethinkInstance({}, done, rdb_info => {
      mockDb.createTestDB(rdb_info, { db_name: 'test' }, rdb_info.done, rdb_info => {
        mockDb.createTestTable(rdb_info, {}, rdb_info.done, rdb_info => {
          info = rdb_info
          done()
        })
      })
    })
  })
  it('should insert data', done => {
    insert(info.table_name, { foo: 'bar' }, info.rdb_conn)
    .then(data => {
      expect(data.changes[0].new_val.foo).toBeTruthy()
      if (data.changes[0].new_val.foo) {
        expect(data.changes[0].new_val.foo).toContain('bar')
      }
      info.done()
      done()
    })
  }, 10000)
})
