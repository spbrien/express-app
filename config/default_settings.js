require('dotenv').config()

module.exports = {
  PAGINATION: false,
  PAGINATION_LIMIT: 50,
  PAGINATION_DEFAULT: 25,
  _CREATED_INDEX: true,
  USERNAME: 'admin',
  PASSWORD: 'test',
  SECRET_KEY: process.env.SECRET_KEY,
  CORS: true,
  AUTHENTICATION: false,
}
