'use strict'

// Modules
const app = require('express')()
const morgan = require('morgan')
const config = require('./config')
const factory = require('./application')
const bodyParser = require('body-parser')

// Settings
const port = 8080

// Init Logging etc.
app.use(morgan('dev'))
app.use(bodyParser.json())

// Init Application
factory(app, port)(config)
