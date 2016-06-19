// const routing = require('./routing')
const R = require('ramda')

function factory(app, port) {
  return (config) => {
    R.map(model => {
      app.get(`/${model.name}`, (req, res) => {
        res.send(model._schema)
      })
    }, config.schema)
   
   app.listen(port, () => console.log(`Running on port ${port}\n`))
  }
}

module.exports = factory
