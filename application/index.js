const routing = require('./routing')
const auth = require('config/auth')

function factory(app, port) {
  return (config) => {
    // Schema validation
    app.use(config.db.validate(config.schema))

    // Set up connection to rethinkdb
    app.use(config.db.createConnection)

    // Set up Main Routing
    app.use('/api/v1', routing(config.schema))

    app.use(auth)
    // close db connection
    app.use(config.db.closeConnection)

    // Listen
     /* eslint-disable no-console */
    app.listen(port, () => console.log(`Running on port ${port}\n`))
  }
}

module.exports = factory
