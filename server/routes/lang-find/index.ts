export default eventHandler((event) => {
	setHeader(event, "Access-Control-Allow-Origin", "*");
	setHeader(event, "Origin", "*");
	setHeader(event, "access-control-allow-headers", "*");
	setHeader(event, "allow", "*");
	return sendError(
		event,
		createError({
			name: "langName not found",
			statusCode: 400,
			statusMessage: "Programming language is not provided",
		})
	);
});
