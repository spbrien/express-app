
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
      minLength: 1,
      maxLength: 100,
    },
    author: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      optional: true,
    },
    featured: {
      type: 'boolean',
      def: false,
      optional: true,
    },
  },
  auth: {
    GET: {
      allowedRoles: ['admin'],
      allowedUsers: ['admin'],
    },
    POST: {
      allowedRoles: ['admin'],
      allowedUsers: ['admin'],
    },
  },
  metadata: {

  },
}
