import {typeDefs} from "./schema.js";
import chalk from "chalk";
import {ApolloServer} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import {MongoClient} from "mongodb";

let client = new MongoClient("mongodb://localhost:27017/");
async function run() {
    let snipHub = client.db("snip-hub");
    let collectionNames = [];
    let fetching= await snipHub.listCollections();
    let temp= await fetching.toArray();
    temp.forEach(collection=> function () {
        collectionNames.push(collection.name);
    });


    let resolvers = {
        Query: {
            langList: () => {
                /** @type { { langName: string, codeBoxes: { title: string, code: string}[] }[] } */
                let data = [];
                collectionNames.forEach(el=> function () {
                    data.push({
                        langName: el,
                        codeBoxes: snipHub.collection(el).find()
                    });
                });
                return data;
            },
            langFind: (_, args) => {
                return {
                    langName: args.langName,
                    codeBoxes: snipHub.collection(args.langName).find()
                };
            }
        },
        Mutation: {
            /**
             * @param _
             * @param { {langName: string, codeBox:{title:string,code:string}} } args
             * @return { {id:number, message: string} }
             * */
            snipAdd: async  (_, args) => {
                let status = {};
                if (collectionNames.includes(args.langName)) {
                    let titles = [];
                    let res = await snipHub.collection(args.langName).find();
                    let codeBoxes= await res.toArray();
                    codeBoxes.forEach(snip => {titles.push(snip.title)});

                    if (titles.includes(args.codeBox.title)) {
                        status = {
                            id: 2,
                            message: "Snippet with same title already exist"
                        };
                    }
                    else {
                        await snipHub.collection(args.langName).insertOne(args.codeBox);
                        status = {
                            id: 1,
                            message: `Snippet added to ${args.langName} snippets`
                        };
                    }
                }
                else {
                    await snipHub.createCollection(args.langName);
                    await snipHub.collection(args.langName).insertOne(args.codeBox);

                    status = {
                        id: 0,
                        message: `new ${args.langName} snippet list created\nYour snippet is added to ${args.langName} snippets`
                    };

                        collectionNames = [];
                        let fetching= await snipHub.listCollections();
                        let temp= await fetching.toArray();
                        temp.forEach(collection=> function () {
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