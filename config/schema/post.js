
module.exports = {
  type: 'object',
  indicies: ['date'],
  properties: {
    title: {
      type: 'string',
      minlength: 1,
      maxlength: 100,
    },
    author: {
      type: 'string',
      minlength: 1,
      maxlength: 100,
    },
    featured: {
      type: 'boolean',
      def: false,
    },
  },
}
