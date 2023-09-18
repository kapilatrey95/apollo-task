const { gql } = require('apollo-server');

const typeDefs = gql`
  type Repository {
    name: String!
    size: Int!
    owner: String!
    isPrivate: Boolean!
    numFiles: Int
    ymlFileContent: String
    nativeWebhooks: Boolean
  }

  type Query {
    repositories(token: String!): [Repository!]!
    repositoryDetails(token: String!, name: String!, owner: String!): Repository
  }
`;

module.exports = typeDefs;
