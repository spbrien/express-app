
module.exports = {
  type: 'object',
  indicies: ['_created'],
  allowed_methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  data_relations: {
    created_by: {
      resource: 'accounts',
      field: 'id',
      embeddable: true,
    },
  },
  properties: {
    created_by: {
      type: 'string',
      optional: true,
    },
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
  allowedUsers: [],
  allowedRoles: [],
  metadata: {

  },
}
