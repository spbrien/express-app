const routing = require('./routing')
const R = require('ramda')

function factory(app, port) {
  return (config) => {
    // Set up connection to rethinkdb
    app.use(config.db.createConnection)

    // Set up Main Routing
    app.use('/api/v1', routing(config.schema))

    // close db connection
    app.use(config.db.closeConnection)

    // Listen
    app.listen(port, () => console.log(`Running on port ${port}\n`))
  }
}

module.exports = factory
