import { typeDefs } from "./schema.js";
import chalk from "chalk";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { MongoClient } from "mongodb";

let connect = new MongoClient("mongodb://localhost:27017/");
connect.connect().then(client => function (err, db) {
    let snipHub = client.db("snip-hub");
    let collectionNames = [];
    snipHub.listCollections.toArray(function (_, collection) {
        collectionNames.push(collection.name);
    })

    let resolvers = {
        Query: {
            langList: () => {
                /** @type { { langName: string, codeBoxes: { title: string, code: string}[] }[] } */
                let data = [];
                snipHub.listCollections.toArray(function (_, collection) {
                    data.push({
                        langName: collection.langName,
                        codeBoxes: collection.codeBoxes
                    });
                });
                return data;
            },
            langFind: (_, args) => {
                /** @type { { langName: string, codeBoxes: { title: string, code: string}[] } } */
                let data = {};
                let out = {};
                snipHub.listCollections.toArray(function (_, collection) {
                    if (collection.langName === args.langName) {
                        out = collection;
                    }
                });
                data = {
                    langName: out.langName,
                    codeBoxes: out.codeBoxes
                };

                return data;
            }
        },
        Mutation: {
            /**
             * @param _
             * @param { {langName: string, codeBox:{title:string,code:string}} } args
             * @return { {id:number, message: string} }
             * */
            snipAdd: (_, args) => {
                let status = {};
                if (collectionNames.includes(args.langName)) {
                    let titles = [];
                    snipHub.collection(args.langName).find()[0].codeBoxes.forEach(snip => titles.push(snip.title));

                    if (titles.includes(args.codeBox.title)) {
                        status = {
                            id: 2,
                            message: "Snippet with same title already exist"
                        };
                    }
                    else {
                        snipHub.collection(args.langName).updateOne({ langName: args.langName }, {
                            codeBoxes: snipHub.collection(args.langName).find()[0].codeBoxes.push(args.codeBox)
                        }).then(_ => { });
                        status = {
                            id: 1,
                            message: `Snippet added to ${args.langName} snippets`
                        };
                    }
                }
                else {
                    snipHub.createCollection(args.langName).then(_ => { })
                    snipHub.collection(args.langName).insertOne({
                        langName: args.langName,
                        codeBoxes: [args.codeBox]
                    }).then(_ => { })
                    status = {
                        id: 2,
                        message: "Snippet with same title already exist"
                    };
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

    (async function () {
        let { url: uri } = await startStandaloneServer(server, {
            listen: { port: 3300 }
        });
    })();

    console.log("server started at " + chalk.hex("#40A0F0").underline(url));
});