var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import { MongoClient } from "mongodb";
import cors from "cors";
import http from "http";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { readFileSync } from "fs";
import { join } from "path";
let client = new MongoClient("mongodb://localhost:27017/snip-hub");
let snipHub = client.db("snip-hub");
let collectionNames = [];
let fetching = await snipHub.listCollections().toArray();
fetching.forEach((collection) => {
    collectionNames.push(collection.name);
});
let resolvers = {
    Query: {
        langList: () => __awaiter(void 0, void 0, void 0, function* () {
            let data = [];
            for (let el of collectionNames) {
                let codeBoxesWithId = yield snipHub
                    .collection(el)
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
        }),
        titleFind: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            let title = args.title;
            let langBoxes = [];
            for (let el of collectionNames) {
                let out = yield snipHub
                    .collection(el)
                    .find({ title: { $regex: new RegExp(title.trim(), "ig") } })
                    .toArray();
                if (out.length == 0) {
                }
                else {
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
        }),
        langFind: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            let codeBoxes = yield snipHub
                .collection(args.langName)
                .find()
                .toArray();
            return {
                langName: args.langName,
                codeBoxes: codeBoxes[0],
            };
        }),
        langNames: () => {
            return collectionNames;
        },
    },
    Mutation: {
        snipAdd: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            let status = {
                id: -1,
                message: "",
            };
            let codeSnip = args.codeSnip;
            if (collectionNames.includes(codeSnip["langName"])) {
                let titles = [];
                let codeBoxes = yield snipHub
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
                }
                else {
                    yield snipHub.collection(codeSnip.langName).insertOne({
                        title: codeSnip["codeBox"]["title"],
                        code: codeSnip["codeBox"]["code"],
                    });
                    status = {
                        id: 1,
                        message: `Snippet added to ${codeSnip["langName"]} snippets`,
                    };
                }
            }
            else {
                let newCollection = yield snipHub.createCollection(codeSnip["langName"]);
                yield newCollection.insertOne({
                    title: codeSnip["codeBox"]["title"],
                    code: codeSnip["codeBox"]["code"],
                });
                status = {
                    id: 0,
                    message: `new ${codeSnip["langName"]} snippet list created\nYour snippet is added to ${codeSnip.langName} snippets`,
                };
                collectionNames = [];
                let fetching = yield snipHub.listCollections().toArray();
                fetching.forEach((collection) => {
                    collectionNames.push(collection.name);
                });
            }
            return status;
        }),
    },
};
// with apollo
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (__dirname == undefined) {
            return;
        }
        console.log(join(__dirname, "../schema.gql"));
        let typeDefs = yield readFileSync(join(__dirname, "../schema.gql"));
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
        yield server.start();
        app.use("/", appLimits, express.json(), expressMiddleware(server));
        yield new Promise((resolve) => httpServer.listen({ port: 3300 }, resolve));
        console.log("🚀 Server started at " +
            chalk.hex("#40A0F0").underline("http://localhost:3300/"));
    });
}
run().catch(console.dir);
