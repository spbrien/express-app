const bcrypt = require('bcrypt')
const r = require('rethinkdb')
const jwt = require('jsonwebtoken')
const decodeToken = require('application/utils/helpers').decodeToken

function authenticate(req, res, next) {
  if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
    // Grab btoa string, decode, and separate username and password into variables
    const { username, password } = decodeToken(req.headers.authorization)

    // search for user in database
    r.table('accounts').filter({ username }).run(req.connection)
    .then(data => {
      Promise.resolve(data.toArray())
      .then(data => {
        // if results are an empty array
        if (!data.length) res.status(401).send('Invalid credentials')
        // check password
        bcrypt.compare(password, data[0].password, (err, resp) => {
          if (resp) {
            req.authenticated = true
            req.user = data[0]
            next()
          } else res.status(401).send('Invalid credentials')
        })
      })
    })
  } else {
    res.status(401).send('authorization required')
  }
}

function checkToken(req, res, next) {
  const token = decodeToken(req.headers.authorization).password
  if (token) {
    jwt.verify(token, req.app.get('secret'), (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          message: 'Failed to authenticate token',
        })
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else res.status(401).send('Invalid token')
}

module.exports = {
  authenticate,
  checkToken,
}
