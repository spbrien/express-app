const routing = require('./routing')
const auth = require('./auth').authenticate()
const token = require('./auth').checkToken
const jwt = require('jsonwebtoken')
const cors = require('cors')
const db = require('./db')
const settings = require('../config/default_settings')

function factory(app, port) {
  return (config) => {
    if (settings.CORS) {
      app.use(cors())
    }

    // Set up connection to rethinkdb
    app.use(db.validate(config.schema), db.createConnection)

    // Set up Main Routing
    app.use('/api/v1', token, routing(config.schema))

    // close db connection
    app.use(db.closeConnection)

    // Auth endpoint for getting or exchanging JWTs
    app.get('/auth', db.createConnection, auth, (req, res) => {
      const token = jwt.sign(req.user, app.get('secret'), { expiresIn: '2h' })
      res.json({
        success: true,
        user: req.user.username,
        token,
      })
    })

    // Listen
     /* eslint-disable no-console */
    app.listen(port, () => console.log(`Running on port ${port}\n`))
    return app
  }
}

module.exports = factory
