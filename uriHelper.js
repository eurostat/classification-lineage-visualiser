// Helper function to convert an object to query parameters
export function toQueryParams(data) {
	return Object.keys(data)
		.map(
			(key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
		)
		.join("&");
}
