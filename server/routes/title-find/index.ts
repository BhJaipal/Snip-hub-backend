export default eventHandler((event) => {
	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	return sendError(
		event,
		createError({
			name: "title not found",
			statusCode: 400,
			statusMessage: "Code Snippet title is not provided",
		})
	);
});
