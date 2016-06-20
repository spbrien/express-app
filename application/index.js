const routing = require('./routing')
const R = require('ramda')

function factory(app, port) {
  return (config) => {
    // Create Schema Routes
    R.map(model => {
      app.use( '/api/v1', routing(model.name, model._schema));
    }, config.schema)
  
    // Listen
    app.listen(port, () => console.log(`Running on port ${port}\n`))
  }
}

module.exports = factory
