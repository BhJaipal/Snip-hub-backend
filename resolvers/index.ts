import { MongoClient } from "mongodb";
import type { ObjectId, WithId } from "mongodb";

import type { Db } from "mongodb";

let client = new MongoClient("mongodb://localhost:27017/snip-hub");
let snipHub: Db = client.db("snip-hub");
let collectionNames = async () => {
	let colNames: string[] = [];
	let fetching = await snipHub.listCollections().toArray();
	fetching.forEach((collection) => {
		colNames.push(collection.name);
	});
	return colNames;
};

type LanguageWithId = {
	langName: string;
	codeBoxes: { title: string; code: string; _id: ObjectId }[];
};
type CodeBox = {
	title: string;
	code: string;
	_id: ObjectId;
};

export const resolvers = {
	Query: {
		langList: async (): Promise<LanguageWithId[]> => {
			let data: LanguageWithId[] = [];
			let colNames = await collectionNames();
			for (let el of colNames) {
				let codeBoxesWithId: WithId<{ title: string; code: string }>[] =
					await snipHub
						.collection<{ title: string; code: string }>(el)
						.find()
						.toArray();
				data.push({
					langName: el,
					codeBoxes: codeBoxesWithId.map((el) => {
						return { title: el.title, code: el.code, _id: el._id };
					}),
				});
			}
			if (data.length == 0) {
				return [{ langName: "", codeBoxes: [] }];
			}
			return data;
		},
		titleFind: async (title: string): Promise<LanguageWithId[]> => {
			let langBoxes = [];
			for (let el of await collectionNames()) {
				let out = await snipHub
					.collection<{ title: string; code: string }>(el)
					.find({ title: { $regex: new RegExp(title.trim(), "ig") } })
					.toArray();
				if (out.length == 0) {
				} else {
					let codeBox: { title: string; code: string }[] = out.map(
						(el) => {
							return {
								title: el.title,
								code: el.code,
								_id: el._id,
							};
						}
					);
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
		langFind: async (langName: string): Promise<LanguageWithId> => {
			let codeBoxes = await snipHub
				.collection<{ title: string; code: string }>(langName)
				.find()
				.toArray();
			return {
				langName: langName,
				codeBoxes: codeBoxes,
			};
		},
		langNames: async () => {
			return await collectionNames();
		},
	},
	Mutation: {
		snipAdd: async (codeSnip: {
			langName: string;
			codeBox: { title: string; code: string };
		}) => {
			let status: { id: number; message: string } = {
				id: -1,
				message: "",
			};
			if ((await collectionNames()).includes(codeSnip["langName"])) {
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
			}
			return status;
		},
	},
};
