const bcrypt = require('bcrypt')
const r = require('rethinkdb')
const jwt = require('jsonwebtoken')
const decodeUser = require('../utils/helpers').decodeUser
const settings = require('../../config/default_settings')
const schema = require('../../config/schema')
const R = require('ramda')

// passing a truthy param as 'force' will force authentication, even if disabled in settings. This is for unit testing purposes
function authenticate(force) {
  return (req, res, next) => {
    if (settings.AUTHENTICATION || force) {
      if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
        // Grab btoa string, decode, and separate username and password into variables
        const { username, password } = decodeUser(req.headers.authorization)
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
                req.user = {
                  username: data[0].username,
                  roles: data[0].roles
                }
                next()
              } else res.status(401).send('Invalid credentials')
            })
          })
        })
      } else {
        res.status(401).send('authorization required')
      }
    } else next()
  }
}

function checkToken(req, res, next) {
  const resource = req.originalUrl.replace('/api/v1/', '').split('/')[0]
  const method = req.method

  const permissions = schema[resource] ? schema[resource].auth : null
  const allowedRoles = permissions && permissions[method] ? permissions[method].allowedRoles : null
  const allowedUsers = permissions && permissions[method] ? permissions[method].allowedUsers : null

  if (settings.AUTHENTICATION && permissions) {
    const token = req.headers['x-token']

    if (token) {
      /* eslint-disable no-unused-vars */
      jwt.verify(token, req.app.get('secret'), (err, decoded) => {
        if (err) {
          res.status(401).send('Not Authorized')
        } else {
          if (allowedUsers || allowedRoles) {
            const userinfo = jwt.decode(token)
            if (R.contains(userinfo.username, allowedUsers) || R.intersection(userinfo.roles, allowedRoles).length > 0) {
              req.verified = true
              next()
            } else {
              res.status(401).send('Not Authorized')
            }
          } else {
            res.status(401).send('Not Authorized')
          }
        }
      })
    } else res.status(401).send('Not Authorized')
  } else next()
}

module.exports = {
  authenticate,
  checkToken,
}
