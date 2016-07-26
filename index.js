
require('dotenv').load()
require('app-module-path').addPath(__dirname)
// Modules
const app = require('express')()
const morgan = require('morgan')
const config = require('./config')
const factory = require('./application')
const bodyParser = require('body-parser')
const md5 = require('md5')
const settings = require('config/default_settings')

// Settings
const port = process.env.PORT || 3000

// Init Logging etc.
app.use(morgan('dev'))
app.use(bodyParser.json())
app.set('secret', md5(settings.SECRET_KEY))
app.set('models', config.schema)
// Init Application
factory(app, port)(config)

module.exports = {
  factory,
  app,
  port,
  config,
}
