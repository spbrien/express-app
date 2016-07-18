/* eslint-disable global-require, no-shadow import/no-unresolved */
const fs = require('fs')
const path = require('path')
const inflection = require('inflection')
const config = require('config/db').dbConfig
const utils = require('config/db/utils')
const insert = require('config/db/methods/insert')
const settings = require('config/default_settings')
const bcrypt = require('bcrypt')

inflection.lowerize = function (str) {
  return str.substring(0, 1).toLowerCase() + str.substring(1)
}

// Find all models from the current directory
module.exports = fs
.readdirSync(__dirname)
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
.reduce((models, file) => {
  const ext = path.extname(file)
  const fileWithoutExt = file.slice(0, -ext.length)
  const resourceName = inflection.transform(fileWithoutExt, ['pluralize', 'camelize', 'lowerize'])
  models[resourceName] = require(path.join(__dirname, fileWithoutExt))
  // create table for model
  // create table for model
  utils.createTable(config, resourceName, models[resourceName], connection => {
    // create default user and password from settings
    if (resourceName === 'accounts' && settings.USERNAME && settings.PASSWORD) {
      bcrypt.hash(settings.PASSWORD, 10, (err, hash) => {
        if (err) throw err
        insert(resourceName, { username: settings.USERNAME, password: hash }, connection)
      })
    }
  })

  return models
}, {})
