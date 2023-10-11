export const typeDefs= `#graphql
type CodeBox{
  title: String!
  code: String!
}
type lang{
  id: ID!
  langName: String!
  codeBoxes: [CodeBox]!
}
type Query{
  langList: [lang!]
  langFind(langName: String!): lang!
}
type Mutation{
  snipAdd(codeSnip: snipBox!): lang!
}
input snipBox{
  langName: String!
  codeBox: codeBlock!
}
input codeBlock{
  title: String!
  code: String!
}`;
