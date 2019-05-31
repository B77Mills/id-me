const gql = require('graphql-tag');

module.exports = gql`

extend type Query {
  accessLevels: [AccessLevel] @requiresApp
}

extend type Mutation {
  createAccessLevel(input: CreateAccessLevelMutationInput!): AccessLevel! @requiresAppRole(roles: [Owner, Administrator])
}

type AccessLevel {
  id: String!
  name: String!
}

input CreateAccessLevelMutationInput {
  name: String!
}

`;
