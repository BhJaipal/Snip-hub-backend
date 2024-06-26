export default () => `#graphql
type CodeBox {
	title: String!
	code: String!
}
type lang {
	langName: String!
	codeBoxes: [CodeBox]!
}
type returnStats {
	id: Int!
	message: String!
}
type Query {
	langList: [lang!]!
	langFind(langName: String!): lang!
	titleFind(title: String!): [lang!]
	langNames: [String!]!
}
type Mutation {
	snipAdd(codeSnip: snipBox!): returnStats!
}
input snipBox {
	langName: String!
	codeBox: codeBlock!
}
input codeBlock {
	title: String!
	code: String!
}`