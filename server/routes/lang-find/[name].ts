import { resolvers } from "~~/resolvers";

export default eventHandler(async (event) => {
	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	if (!event.context.params.name)
		return sendError(
			event,
			createError({
				name: "langName not found",
				statusCode: 400,
				statusMessage: "Programming language is not provided",
			})
		);
	let langName = event.context.params.name;
	return await resolvers.Query.langFind(langName);
});
