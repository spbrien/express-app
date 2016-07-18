const atob = require('atob')
const bcrypt = require('bcrypt')
const r = require('rethinkdb')

function auth(req, res, next) {
  if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
    // Grab btoa string, decode, and separate username and password into variables
    const authString = req.headers.authorization.replace(/Basic/g, '')
    const decoded = atob(authString)
    const username = decoded.slice(0, decoded.indexOf(':'))
    const password = decoded.slice(decoded.indexOf(':') + 1)
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
            next()
          } else res.status(401).send('Invalid credentials')
        })
      })
    })
  }
}

module.exports = auth
