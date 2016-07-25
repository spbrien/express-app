
module.exports = {
  type: 'object',
  indicies: ['_created'],
  allowed_methods: ['GET', 'POST', 'PATCH', 'DELETE'],
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
