import { typeDefs } from "./schema.js";
import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";

// apollo server
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

let resolvers = {
    Query: {
        langList: () => {
            let read = readFileSync("dist/data.json", {
                encoding: "utf8",
                flag: "r"
            });
            let data = JSON.parse(read);
            return data.languages;
        },
        langFind: (_, args) => {
            let read = readFileSync("dist/data.json", {
                encoding: "utf8", flag: "r"
            });
            let data = JSON.parse(read);
            return data.languages.filter(
                langBox => (
                    (langBox.langName === args.langName))
            )[0];
        }
    },
    Mutation: {
        snipAdd: (_, args) => {
            let read = readFileSync("dist/data.json", {
                encoding: "utf8",
                flags: "r"
            });
            let data = JSON.parse(read);
            let languages = data.languages;
            let find = true;
            let arg = args.codeSnip;
            for (let langBox of languages) {
                // for of loop on languages to match langName
                if (arg.langName == langBox.langName) {
                    // if langName Matches
                    let find2 = true;
                    for (let elem of langBox.codeBoxes) {
                        // for each loop if a title matches 
                        if (elem.title == arg.codeBox.title) { find2 = false; break; } else { }
                    }
                    // if same title is present, do nothing
                    if (!find2) { }
                    // else add code snippet and break through loop 
                    else {
                        langBox.codeBoxes.push({
                            "title": arg.codeBox.title,
                            "code": arg.codeBox.code
                        });
                        find = true;
                        break;
                    }
                }
            }
            // if langName also not found, add new language and code snippet
            if (!find) {
                languages.push({
                    id: languages.length,
                    langName: arg.langName,
                    codeBoxes: [{
                        title: arg.codeBox.title,
                        code: arg.codeBox.code
                    }]
                });
            } else { }
            writeFileSync("dist/data.json",
                JSON.stringify({
                    "languages": languages
                }));
            return languages.filter(langBox => langBox.langName === arg.langName)[0];
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
