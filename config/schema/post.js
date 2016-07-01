
const _schema = {
  title: {
    type: 'string',
    validation: {
      minlength: 0,
      maxlength: 100,
      required: false,
      choices: ['Post Title', 'Post Title Two'],
    },
  },
}

module.exports = {
  _schema,
}
