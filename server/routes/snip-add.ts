import { resolvers } from "~~/resolvers";

export default eventHandler(async (event) => {
	let langName = getQuery(event).langName;
	let title = getQuery(event).title;
	let code = getQuery(event).code;

	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	if (
		langName &&
		title &&
		code &&
		typeof langName == "string" &&
		typeof title == "string" &&
		typeof code == "string"
	) {
		return await resolvers.Mutation.snipAdd({
			langName: langName,
			codeBox: {
				title: title,
				code: code,
			},
		});
	}
});
