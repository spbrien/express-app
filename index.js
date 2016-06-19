'use strict'
const app = require('express')()
const morgan = require('morgan')
const config = require('./config')
const factory = require('./application')
const port = 8080

app.use(morgan('dev'))
factory(app, port)(config)
