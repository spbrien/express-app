const R = require("ramda")
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schemaMap = {
  string(validation) {
    return R.filter(x => x !== null, {
      type: String,
      minlength: validation.minlength ? validation.minlength : null,
      maxlength: validation.maxlength ? validation.maxlength : null,
      required: validation.required ? validation.required: null,
      enum: validation.choices ?  validation.choices: null,
      match: validation.match ? new RegExp(validation.match) : null,
      default: validation.default ? validation.default : null,
    })
  },
  number(validation) {
    return R.filter(x => x !== null, {
      type: Number,
      required: validation.required ? validation.required : null,
      min: validation.min ? validation.min : null,
      max: validation.max ? validation.max : null,
      default: validation.default ? validation.default : null,
    })
  },
  date(validation) {
    return R.filter(x => x !== null, {
      type: Date,
      default: validation.default ? validation.default : null,
    })
  },
  buffer(validation) {
    return R.filter(x => x !== null, {
      type: Buffer,
      default: validation.default ? validation.default : null,
    })
  },
  bool(validation) {
    return R.filter(x => x !== null, {
      type: Boolean,
      default: validation.default ? validation.default : null,
    })
  },
  mixed(validation) {
    return R.filter(x => x !== null, {
      type: Mixed,
      default: validation.default ? validation.default : null,
    })
  },
  list(validation) {
    return R.filter(x => x !== null, {
      type: Array,
      default: validation.default ? validation.default : null,
    })
  },
  hasOne(validation) {
    return { 
      type: Schema.Types.ObjectId,
      ref: validation.relatedTo 
    }
  },
  hasMany(validation) {
    return [{ 
      type: Schema.Types.ObjectId,
      ref: validation.relatedTo 
    }]
  }
}

// Function to create a model
function createModel(name, schema) {
  const mongooseSchema = new Schema(
    R.map(value => schemaMap[value.type](value.validation), schema)
  )
  return mongoose.model(name, mongooseSchema)
}

module.exports = createModel
