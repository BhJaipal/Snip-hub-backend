import { resolvers } from "~~/resolvers";

export default eventHandler(async (event) => {
	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	return await resolvers.Query.langList();
});
