'use strict'

// Modules
const app = require('express')()
const morgan = require('morgan')
const config = require('./config')
const factory = require('./application')

// Settings
const port = 8080

// Init Logging
app.use(morgan('dev'))

// Init Application
factory(app, port)(config)
