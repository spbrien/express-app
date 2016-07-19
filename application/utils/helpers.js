const atob = require('atob')

function decodeToken(token) {
  // Grab btoa string, decode, and separate username and password into variables
  if (token) {
    const authString = token.replace(/Basic/g, '')
    const decoded = atob(authString)
    const username = decoded.slice(0, decoded.indexOf(':'))
    const password = decoded.slice(decoded.indexOf(':') + 1)
    return { username, password }
  }
  return false
}

module.exports = { decodeToken }
