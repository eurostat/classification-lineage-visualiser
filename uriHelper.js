export function getYearComparisonURI(baseUri, category, iYear, isPositive) {
	const urlParts = new URL(baseUri);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const comparisonYear = isPositive ? (+iYear) + 1 : (+iYear) - 1;

	const lowerCaseCategory = category.toLowerCase();
	path[path.length - 2] = `${lowerCaseCategory}${iYear}`;

	const upperCaseCategory = category.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${iYear}_${upperCaseCategory}${comparisonYear}`;

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
