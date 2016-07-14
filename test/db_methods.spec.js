/* global describe, it, expect, beforeEach */

const mockDb = require('./db_mock.spec.js')
const find = require('../config/db/methods/find')
const insert = require('../config/db/methods/insert')
const r = require('rethinkdb')
const Chance = require('chance')
const chance = new Chance()


function fakerFactory(length) {
  const result = []
  for (let i = 0, len = length; i < len; i++) {
    result.push({
      name: chance.string(),
      _created: r.now(),
      featured: chance.bool({ likelihood: 90 }),
    })
  }
  return result
}

/**
 * Inserts data into database, then retrieves it and asserts the length of the items returned
 *
 * @param {Object} info - rethinkdb instance data containing connection, table name etc.
 * @param {Array|Object} data - data to insert (generated from fakerFactory)
 * @param {Object} settings - pagination settings (overrides default_settings.js)
 * @param {Integer} expect_length - number of db records expected to have been retrieved (adjust based on pagination settings)
 * @param {Function} done - jasmine done() method
 * @param {Object} req - the express request object, defaults to empty object
 * @returns {Void} - test result
 */
function findHelper(info, data, settings, expect_length, done, req = {}, id = null) {
//  r.table(info.table_name).indexCreate('_created').run(info.rdb_conn)
//  .then(() => {
  //  r.table(info.table_name).indexWait('_created').run(info.rdb_conn)
  //  .then(() => {
  insert(info.table_name, data, info.rdb_conn)
      .then(() => {
        find(info.table_name, id, req, info.rdb_conn, settings)
        .then(data => {
          Promise.resolve(data.result)
          .then(data => {
            expect(data.length).toBe(expect_length)
            info.done()
            done()
          })
        })
      })
  //  })
//  })
}

describe('db methods', () => {
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
  describe('insert', () => {
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
  describe('find', () => {
    it('should fetch all records if no pagination settings', done => {
      const data = fakerFactory(30)
      findHelper(info, data, { PAGINATION: false }, 30, done)
    })
    it('should fetch only pagination limit if set', done => {
      const data = fakerFactory(30)
      findHelper(info, data, { PAGINATION: true, PAGINATION_DEFAULT: 25 }, 25, done)
    })
    it('should paginate', done => {
      const data = fakerFactory(30)
      findHelper(info, data, { PAGINATION: true, PAGINATION_DEFAULT: 25 }, 5, done, { query: { page: 2 } })
    })
    it('should filter based on query with pagination', done => {
      const data = fakerFactory(50)
      const featured = data.filter(n => n.featured)
    //  findHelper(info, data, { PAGINATION: false }, featured.length, done, { query: { where: JSON.stringify({ featured: true }) } })
      findHelper(info, data, { PAGINATION: true, PAGINATION_DEFAULT: 25 },
       featured.length - 25, done, { query: { where: JSON.stringify({ featured: true }), page: 2 } })
    })
    it('should fetch resource by id', done => {
      const data = fakerFactory(30)
      findHelper(info, data, { PAGINATION: true, PAGINATION_DEFAULT: 25 }, 25, done)
    })
  })
})
