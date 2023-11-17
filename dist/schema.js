export const typeDefs= `#graphql
type CodeBox{
  title: String!
  code: String!
}
type lang{
  langName: String!
  codeBoxes: [CodeBox]!
}
type returnStats{
  id: Int!
  message: String!
}
type Query{
  langList: [lang!]!
  langFind(langName: String!): lang!
}
type Mutation{
  snipAdd(codeSnip: snipBox!): returnStats!
}
input snipBox{
  langName: String!
  codeBox: codeBlock!
}
input codeBlock{
  title: String!
  code: String!
}`;
