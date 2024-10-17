import { resolvers } from "./build/index.js"
import cors from "cors";
import http from "http";
import express from "express";
import { readFileSync } from "node:fs";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import typeDefs from "./schema.js"
import { networkInterfaces } from "os"
import { IncomingMessage, ServerResponse } from "node:http";

const app = express();
const httpServer = http.createServer({
	hostname: "backend.snip-hub.com",
	key: readFileSync("./domain.key"),
	cert: readFileSync("./domain.crt"),
	passPhrase: "J1i16a12"
}, app);

let whitelist = ["http://localhost:3000", "http://localhost:3300"]

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {() => void} next
 */
let corsOptions = (req, res, next) => {
	const origin = "http://" + req.headers.host;

	if (!whitelist.includes(origin)) {
		res.status(403).send('Forbidden')
	} else {
		res.setHeader("Access-Control-Allow-Origin", origin)
		next();
	}
}

let server = new ApolloServer({
	typeDefs: typeDefs(),
	resolvers,
	plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use("/", corsOptions, express.json(), expressMiddleware(server));
httpServer.listen({ port: 3300 });

console.log(
	"🚀 Server started at " +
	chalk.hex("#40A0F0").underline("http://localhost:3300/")
);

