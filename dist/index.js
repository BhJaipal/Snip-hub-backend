import { typeDefs } from "./schema.js";
import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { MongoClient } from "mongodb";

let client = new MongoClient("mongodb://localhost:27017/snip-hub");
async function run() {
    let snipHub = client.db("snip-hub");
    let collectionNames = [];
    let fetching = await snipHub.listCollections().toArray();
    fetching.forEach(collection => {
        collectionNames.push(collection.name);
    });


    let resolvers = {
        Query: {
            langList: async () => {
                /** @type { { langName: string, codeBoxes: { title: string, code: string}[] }[] } */
                let data = [];
                for (let el of collectionNames) {
                    let codeBoxes = await snipHub.collection(el).find().toArray();
                    data.push({
                        langName: el,
                        codeBoxes
                    });
                }
                if (data == []) { return [{ langName: "", codeBoxes: [] }]; }
                return data;
            },
            titleFind: async (_, args) => {
                /**
                 * @type { string }
                 */
                let title = args.title;
                let langBoxes = [];
                for (let el of collectionNames) {
                    let out = await snipHub.collection(el).find({ title: { $regex: new RegExp(title.trim(), "ig") } }).toArray();
                    console.log(out);
                    if (out == 0) { }
                    else {
                        langBoxes.push({
                            langName: el,
                            codeBoxes: out
                        })
                    }
                }
                if (langBoxes == 0) {
                    return [
                        {
                            langName: "",
                            codeBoxes: []
                        }
                    ]
                }
                return langBoxes;
            },
            langFind: async (_, args) => {
                let codeBoxes = await snipHub.collection(args.langName).find().toArray();
                return {
                    langName: args.langName,
                    codeBoxes
                };
            },
            langNames: async () => {
                return collectionNames;
            }
        },
        Mutation: {
            /**
             * @param _
             * @param { {codeSnip:{langName: string, codeBox:{title:string,code:string}}} } args
             * @return { any } {{id:number, message: string}}
             * */
            snipAdd: async (_, args) => {
                /**
                 * @type {{id: number, message: string}}
                 */
                let status = {};
                let codeSnip = args.codeSnip;
                if (collectionNames.includes(codeSnip["langName"])) {
                    let titles = [];
                    let codeBoxes = await snipHub.collection(codeSnip["langName"]).find().toArray();
                    codeBoxes.forEach(snip => { titles.push(snip.title) });

                    if (titles.includes(codeSnip["codeBox"]["title"])) {
                        status = {
                            id: 2,
                            message: "Snippet with same title already exist"
                        };
                    }
                    else {
                        await snipHub.collection(codeSnip.langName).insertOne({
                            title: codeSnip["codeBox"]["title"],
                            code: codeSnip["codeBox"]["code"]
                        });
                        status = {
                            id: 1,
                            message: `Snippet added to ${codeSnip["langName"]} snippets`
                        };
                    }
                }
                else {
                    let newCollection = await snipHub.createCollection(codeSnip["langName"]);
                    await newCollection.insertOne({
                        title: codeSnip["codeBox"]["title"],
                        code: codeSnip["codeBox"]["code"],
                    });

                    status = {
                        id: 0,
                        message: `new ${codeSnip["langName"]} snippet list created\nYour snippet is added to ${codeSnip.langName} snippets`
                    };

                    collectionNames = [];
                    let fetching = await snipHub.listCollections().toArray();
                    fetching.forEach(collection => {
                        collectionNames.push(collection.name);
                    });

                }
                return status;
            }
        }
    };
    // with apollo

    let server = new ApolloServer({
        typeDefs,
        resolvers
    });

    let { url } = await startStandaloneServer(server, {
        listen: { port: 3300 }
    });


    console.log("server started at " + chalk.hex("#40A0F0").underline(url));
}

run().catch(console.dir);
