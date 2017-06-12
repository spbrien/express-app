/* eslint-disable global-require */
const fs = require('fs')
const path = require('path')


module.exports = fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .reduce((methods, file) => {
    const ext = path.extname(file)
    const fileWithoutExt = file.slice(0, -ext.length)
    methods[fileWithoutExt] = require(path.join(__dirname, fileWithoutExt))
    return methods
  }, {})
