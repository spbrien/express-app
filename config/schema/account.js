/* eslint-disable no-useless-escape */

module.exports = {
  type: 'object',
  indicies: ['_created'],
  properties: {
    username: {
      type: 'string',
      minlength: 1,
      maxlength: 30,
      uniqueness: true,
      pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$',
    },
    roles: {
      type: 'array',
      items: { type: 'string', minLength: 1 }
    },
    password: {
      type: 'string',
      minlength: 1,
      maxlength: 30,
    },
  },
  auth: {
    GET: {
      allowedRoles: ['blah'],
      allowedUsers: ['blah'],
    },
  },
  metadata: {

  },
}
