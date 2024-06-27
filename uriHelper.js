export function getYearComparisonURI(baseUri, category, iYear, isPositive) {
	const urlParts = new URL(baseUri);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const comparisonYear = isPositive ? (+iYear) + 1 : (+iYear) - 1;

	const upperCaseCategory = category.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${iYear}_${upperCaseCategory}${comparisonYear}`;

	urlParts.pathname = path.join('/');

	return urlParts.toString();
}