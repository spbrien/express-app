
module.exports = {
  type: 'object',
  indicies: ['_created'],
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
