import { MongoClient } from "mongodb";
let client = new MongoClient("mongodb://localhost:27017/snip-hub");
let snipHub = client.db("snip-hub");
let collectionNames = [];
let fetching = await snipHub.listCollections().toArray();
fetching.forEach((collection) => {
    collectionNames.push(collection.name);
});
export const resolvers = {
    Query: {
        langList: async () => {
            let data = [];
            for (let el of collectionNames) {
                let codeBoxesWithId = await snipHub
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
        },
        titleFind: async (_, args) => {
            let title = args.title;
            let langBoxes = [];
            for (let el of collectionNames) {
                let out = await snipHub
                    .collection(el)
                    .find({ title: { $regex: new RegExp(title.trim(), "ig") } })
                    .toArray();
                if (out.length == 0) {
                }
                else {
                    let codeBox = out.map((el) => {
                        return { title: el.title, code: el.code };
                    });
                    langBoxes.push({
                        langName: el,
                        codeBoxes: codeBox,
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
        langFind: async (_, args) => {
            let codeBoxes = await snipHub
                .collection(args.langName)
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
        snipAdd: async (_, args) => {
            let status = {
                id: -1,
                message: "",
            };
            let codeSnip = args.codeSnip;
            if (collectionNames.includes(codeSnip["langName"])) {
                let titles = [];
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
                }
                else {
                    await snipHub.collection(codeSnip.langName).insertOne({
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
                let newCollection = await snipHub.createCollection(codeSnip["langName"]);
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
