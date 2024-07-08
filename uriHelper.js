export function getYearComparisonURI(baseUri, family, iYear, targetYear) {

	const urlParts = new URL(baseUri);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const lowerCaseCategory = family.toLowerCase();
	path[path.length - 2] = `${lowerCaseCategory}${iYear}`;

	const upperCaseCategory = family.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${iYear}_${upperCaseCategory}${targetYear}`;

	urlParts.pathname = path.join('/');

	return urlParts.toString();
}

// Helper function to convert an object to query parameters
export function toQueryParams(data) {
	return Object.keys(data)
		.map(
			(key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
		)
		.join("&");
}
