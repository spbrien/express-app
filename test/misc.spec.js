/* global describe, it, expect */
const mockDb = require('./db_mock.spec.js')
const checkEtag = require('../config/db').checkEtag
const insert = require('../config/db/methods/insert')
const bcrypt = require('bcrypt')
const auth = require('../config/auth')
const md5 = require('md5')

describe('misc', () => {
  it('should check etags', done => {
    mockDb.rethinkInstance({}, done, rdb_info => {
      mockDb.createTestDB(rdb_info, { db_name: 'test' }, rdb_info.done, rdb_info => {
        mockDb.createTestTable(rdb_info, { table_name: 'test' }, rdb_info.done, rdb_info => {
          insert(rdb_info.table_name, { foo: 'bar' }, rdb_info.rdb_conn)
          .then(data => {
            const etag = data.changes[0].new_val._etag
            const id = data.changes[0].new_val.id
            expect(checkEtag(rdb_info.table_name, id, etag, rdb_info.rdb_conn)).toBeTruthy()
            rdb_info.done()
            done()
          /*  checkEtag(rdb_info.table_name, id, etag, rdb_info.rdb_conn).then(data => {
              expect(data).toBeTruthy()
              rdb_info.done()
              done()
            }) */
          })
        })
      })
    })
  })
  it('should authenticate', done => {
    mockDb.rethinkInstance({}, done, rdb_info => {
      mockDb.createTestDB(rdb_info, { db_name: 'test' }, rdb_info.done, rdb_info => {
        mockDb.createTestTable(rdb_info, { table_name: 'accounts' }, rdb_info.done, rdb_info => {
          bcrypt.hash('test', 10, (err, hash) => {
            if (err) console.log(err)
            insert(rdb_info.table_name, { username: 'admin', password: hash }, rdb_info.rdb_conn).then(() => {
              const req = {
                headers: {
                  authorization: 'Basic YWRtaW46dGVzdA==',
                },
                connection: rdb_info.rdb_conn,
                app: {
                  get() {
                    return md5('supersecret')
                  },
                },
              }
              const res = {
                send(param) {
                  return param
                },
                status(s) {
                  this.status = s
                  return this
                },
              }
              auth.authenticate(true)(req, res, () => {
                expect(req.authenticated).toBeTruthy()
                rdb_info.done()
                done()
              })
            })
          })
        })
      })
    })
  })
})
