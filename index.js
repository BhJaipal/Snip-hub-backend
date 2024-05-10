import { resolvers } from "./build/index.js"
import cors from "cors";
import http from "http";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./schema.js"

const app = express();
const httpServer = http.createServer(app);
let appLimits = cors({
	origin: ["http://localhost:3000", "http://localhost:3300"],
});
let server = new ApolloServer({
	typeDefs: typeDefs(),
	resolvers,
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use("/", appLimits, express.json(), expressMiddleware(server));
httpServer.listen({ port: 3300 });

console.log(
	"🚀 Server started at " +
	chalk.hex("#40A0F0").underline("http://localhost:3300/")
);

