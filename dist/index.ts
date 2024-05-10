import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import { MongoClient } from "mongodb";
import type { WithId } from "mongodb";
import cors from "cors";
import http from "http";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import type { Db } from "mongodb";
import {
	Resolvers,
	ResolversParentTypes,
	RequireFields,
	QueryTitleFindArgs,
	QueryLangFindArgs,
	MutationSnipAddArgs,
} from "./types.ts";
import { readFileSync } from "fs";
import { join } from "path";

let client = new MongoClient("mongodb://localhost:27017/snip-hub");
let snipHub: Db = client.db("snip-hub");
let collectionNames: string[] = [];
let fetching = await snipHub.listCollections().toArray();
fetching.forEach((collection) => {
	collectionNames.push(collection.name);
});

let resolvers: Resolvers = {
	Query: {
		langList: async () => {
			let data: {
				langName: string;
				codeBoxes: { title: string; code: string }[];
			}[] = [];
			for (let el of collectionNames) {
				let codeBoxesWithId: WithId<
					{
						title: string;
						code: string;
					}[]
				>[] = await snipHub
					.collection<{ title: string; code: string }[]>(el)
					.find()
					.toArray();
				let codeBoxes = codeBoxesWithId.map((el) => {
					return { title: el.title, code: el.code };
				});
				data.push({
					langName: el,
					codeBoxes,
				});
			}
			if (data.length == 0) {
				return [{ langName: "", codeBoxes: [] }];
			}
			return data;
		},
		titleFind: async (
			_: ResolversParentTypes["Query"],
			args: RequireFields<QueryTitleFindArgs, "title">
		) => {
			let title = args.title;
			let langBoxes = [];
			for (let el of collectionNames) {
				let out = await snipHub
					.collection(el)
					.find({ title: { $regex: new RegExp(title.trim(), "ig") } })
					.toArray();
				if (out.length == 0) {
				} else {
					langBoxes.push({
						langName: el,
						codeBoxes: out,
					});
				}
			}
			if (langBoxes.length == 0) {
				return [
					{
						langName: "",
						codeBoxes: [],
					},
				];
			}
			return langBoxes;
		},
		langFind: async (
			_: ResolversParentTypes["Query"],
			args: RequireFields<QueryLangFindArgs, "langName">
		) => {
			let codeBoxes = await snipHub
				.collection<{ title: string; code: string }[]>(args.langName)
				.find()
				.toArray();
			return {
				langName: args.langName,
				codeBoxes: codeBoxes[0],
			};
		},
		langNames: () => {
			return collectionNames;
		},
	},
	Mutation: {
		snipAdd: async (
			_: ResolversParentTypes["Mutation"],
			args: RequireFields<MutationSnipAddArgs, "codeSnip">
		) => {
			let status: { id: number; message: string } = {
				id: -1,
				message: "",
			};
			let codeSnip = args.codeSnip;
			if (collectionNames.includes(codeSnip["langName"])) {
				let titles: string[] = [];
				let codeBoxes = await snipHub
					.collection(codeSnip["langName"])
					.find()
					.toArray();
				codeBoxes.forEach((snip) => {
					titles.push(snip.title);
				});

				if (titles.includes(codeSnip["codeBox"]["title"])) {
					status = {
						id: 2,
						message: "Snippet with same title already exist",
					};
				} else {
					await snipHub.collection(codeSnip.langName).insertOne({
						title: codeSnip["codeBox"]["title"],
						code: codeSnip["codeBox"]["code"],
					});
					status = {
						id: 1,
						message: `Snippet added to ${codeSnip["langName"]} snippets`,
					};
				}
			} else {
				let newCollection = await snipHub.createCollection(
					codeSnip["langName"]
				);
				await newCollection.insertOne({
					title: codeSnip["codeBox"]["title"],
					code: codeSnip["codeBox"]["code"],
				});

				status = {
					id: 0,
					message: `new ${codeSnip["langName"]} snippet list created\nYour snippet is added to ${codeSnip.langName} snippets`,
				};

				collectionNames = [];
				let fetching = await snipHub.listCollections().toArray();
				fetching.forEach((collection) => {
					collectionNames.push(collection.name);
				});
			}
			return status;
		},
	},
};
// with apollo

async function run() {
	if (__dirname == undefined) {
		return;
	}
	console.log(join(__dirname, "../schema.gql"));
	let typeDefs = await readFileSync(join(__dirname, "../schema.gql"));
	const app = express();
	const httpServer = http.createServer(app);
	let appLimits = cors({
		origin: ["http://localhost:3000", "http://localhost:3300"],
	});
	let server = new ApolloServer({
		typeDefs: typeDefs.toString(),
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});
	await server.start();
	app.use("/", appLimits, express.json(), expressMiddleware(server));
	await new Promise((resolve) => httpServer.listen({ port: 3300 }, resolve));

	console.log(
		"🚀 Server started at " +
			chalk.hex("#40A0F0").underline("http://localhost:3300/")
	);
}

run().catch(console.dir);
