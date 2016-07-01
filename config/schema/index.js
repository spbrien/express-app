/* eslint-disable global-require */
const fs = require('fs')
const path = require('path')
const inflection = require('inflection')
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
    return models
  }, {})
