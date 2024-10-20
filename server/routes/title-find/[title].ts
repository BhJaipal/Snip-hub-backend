import { resolvers } from "~~/resolvers";

export default eventHandler(async (event) => {
	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	if (!event.context.params.title)
		return sendError(
			event,
			createError({
				name: "title not found",
				statusCode: 400,
				statusMessage: "Code Snippet title is not provided",
			})
		);
	let title = event.context.params.title;
	return await resolvers.Query.titleFind(title);
});
