'use strict';

const fs = require('fs');
const path = require('path');
let inflection = require('inflection');
inflection.lowerize = function (str) {
  return str.substring( 0, 1 ).toLowerCase() + str.substring( 1 );
};

// Find all models from the current directory
module.exports = fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .map((file) => {
    let ext = path.extname(file);
    let fileWithoutExt = file.slice(0, -ext.length);
    let resourceName = inflection.transform(fileWithoutExt, ['pluralize', 'camelize', 'lowerize']);
    let model = require(path.join(__dirname, fileWithoutExt));
    model.name = resourceName
    return model;
  });
