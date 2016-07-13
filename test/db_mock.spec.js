/* global describe, it, expect */
const temp = require('temp')
const Q = require('q')
const r = require('rethinkdb')
const portfinder = require('portfinder')
const cp = require('child_process')
const R = require('ramda')
temp.track()

const getTempDir = Q.nfbind(temp.mkdir)
const getPort = Q.nfbind(portfinder.getPort)


function rethinkInstance(options, done, cb) {
  //  create temp directory
  getTempDir(`rethink_test_${process.env.USER}_${process.pid}`)
  .then(temp_dir => {
    console.info('Temp directory successfully created', temp_dir)
    // get open port that can be used
    return getPort().then(temp_cluster_port => {
      console.info(`Found cluster port: ${temp_cluster_port}`)
      portfinder.basePort = temp_cluster_port + 1
      // get a port for driver connections
      return getPort().then(temp_driver_port => {
        console.info(`Found driver port: ${temp_driver_port}`)

        const new_data_path = `${temp_dir}/rethinkdb_data`

        console.info(`Attempting to initialize a rethinkdb instance at [${new_data_path}]`)

        // initialize rethinkdb in temp directory
        /* eslint-disable no-sequences, prefer-template */
        cp.exec('rethinkdb create -d ' + new_data_path, { cwd: temp_dir }, (err) => {
          if (err) console.log(err)
          console.info('Initialized rethinkdb database')

          // start rethinkdb
          console.info('About to start rethinkdb child process...')

          const rdb_options = ['serve', '--driver-port', temp_driver_port, '--cluster-port', temp_cluster_port,
          '--directory', new_data_path, '--no-http-admin']
          console.log(`CMD: rethinkdb ${rdb_options.join(' ')}`)

          const rdb_process = cp.spawn('rethinkdb', rdb_options, { cwd: temp_dir })


          //    process.on('exit', () => rdb_process.kill())

          //  process.on('uncaughtException', () => rdb_process.kill())

          rdb_process.on('close', code => {
            console.warn(`Test RethinkDB child process exited with code ${code}`)
          })

          rdb_process.stdout.on('data', data => {
            if (data.toString('utf-8').match(/Server ready,/)) {
              const rdb_config = {
                host: 'localhost',
                port: temp_driver_port,
              }
              r.connect(rdb_config, (err, conn) => {
                if (err) throw err
                const info = {
                  rdb_process: {
                    dir: temp_dir,
                    cluster_port: temp_cluster_port,
                    driver_port: temp_driver_port,
                    process: rdb_process,
                  },
                  rdb_conn: conn,
                  done,
                }
                cb(info)
              })
            }
          })
        })
      })
    })
  })
}


function createTestDB(rdb_info, options, done, cb) {
  if (R.isNil(rdb_info) || !R.has('rdb_conn', rdb_info ||
  R.isNil(rdb_info.rdb_conn) || R.isNil(rdb_info.rdb_conn))) {
    throw Error('rdb_info is expected to have a valid connection')
  }

  let test_db_name = ''
  if (!R.isNil(options) && R.has('db_name', options)) {
    test_db_name = options.db_name
  } else test_db_name = ['_test_db', process.env.user, process.pid, Date.now()].join('_')

  // create the database
  r.dbCreate(test_db_name).run(rdb_info.rdb_conn, (err, res) => {
    if (res.dbs_created === 1) {
      console.log(`Successfully created test database [${test_db_name}]`)
    } else throw Error('Failed to create temp database')

    rdb_info = Object.assign({}, rdb_info, {
      db_name: test_db_name,
    })

    if (R.isNil(options) && R.has('no_teardown', options) && options.no_teardown) {
      rdb_info.done = done
    } else {
      rdb_info.done = function () {
        r.dbDrop(test_db_name).run(rdb_info.rdb_conn, (err, deleted) => {
          if (err) throw err
          if (deleted && !err) {
            console.log(`Successfully dropped test db [${test_db_name}]`)
          }
          done()
        })
      }
    }
    cb(rdb_info)
  })
}


function createTestTable(rdb_info, options, done, cb) {
  if (R.isNil(rdb_info) || !R.has('rdb_conn', rdb_info) || R.isNil(rdb_info.rdb_conn)) {
    throw Error('rdb_info is expected to contain a valid connection')
  }
  let test_table_name = ''

  if (!R.isNil(options) && R.has('table_name', options)) {
    test_table_name = options.table_name
  } else test_table_name = ['_test_table_', process.env.USER, process.pid, Date.now()].join('_')

  // create the table
  console.log(`Attempting to create table [${test_table_name}]`)
  r.db(rdb_info.db_name).tableCreate(test_table_name).run(rdb_info.rdb_conn, (err, created) => {
    if (err) throw err

    if (created) console.log(`Successfully created table [${test_table_name}]`)

    rdb_info = Object.assign({}, rdb_info, { table_name: test_table_name })

    if (R.isNil(options) && R.has('no_teardown', options)) {
      rdb_info.done = done
    } else {
      rdb_info.done = function () {
        console.log('called')
        return r.db(rdb_info.db_name).tableDrop(test_table_name).run(rdb_info.rdb_conn, (err, dropped) => {
          if (err) console.log(err)
          console.log(dropped)
          if (dropped) console.log(`Successfuly dropped table [${test_table_name}]`)
          done()
        })
      }
    }
    cb(rdb_info)
  })
}


/* describe('withTestTableCreated', () => {
it('should create a named test table in a tempDB and insert data', done => {
rethinkInstance({}, done, rdb_info => {
createTestDB(rdb_info, {}, rdb_info.done, rdb_info => {
createTestTable(rdb_info, {}, rdb_info.done, rdb_info => {
// test if table was created
r.db(rdb_info.db_name).tableList().run(rdb_info.rdb_conn, (err, tables) => {
if (err) throw err
expect(tables).toContain(rdb_info.table_name)
})
// test that data can be inserted
r.db(rdb_info.db_name).table(rdb_info.table_name).insert({ foo: 'bar' }, { returnChanges: true }).run(rdb_info.rdb_conn, (err, data) => {
if (err) throw err
expect(data.changes[0].new_val.foo).toBeTruthy()
if (data.changes[0].new_val.foo) {
expect(data.changes[0].new_val.foo).toContain('bar')
}
rdb_info.done()
})
})
})
})
}, 7000)
}) */


module.exports = {
  rethinkInstance,
  createTestDB,
  createTestTable,
}
