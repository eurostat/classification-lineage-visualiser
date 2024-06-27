export function createConceptURL(baseUri, category) {
	const urlParts = new URL(baseUri);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const currentVersionYear = path[path.length - 1];

	const yearMatch = currentVersionYear.match(/(\d{4})/);
	if (!yearMatch) {
		throw new Error("Invalid year format in URL");
	}

	const extractedYear = yearMatch[1];
	const nextVersionYear = (+extractedYear) + 1;

	const upperCaseCategory = category.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${extractedYear}_${upperCaseCategory}${nextVersionYear}`;

	urlParts.pathname = path.join('/');

	return urlParts.toString();
}
// Modify the year in the URL - increment or decrement by 1.
// Set increment variable to false to decrement the year.
export function modifyYearInURL(baseUri, category, increment = true) {
  const regex = new RegExp(`(${category})(\\d{4})(?=\\D|$)`, 'gi');
  return baseUri.replace(regex, (_, p1, p2) => `${p1}${parseInt(p2) + (increment ? 1 : -1)}`);
}

export function getYearComparisonURI(baseUri, category, iYear) {
	const urlParts = new URL(baseUri);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const comparisonYear = (+iYear) + 1;

	const upperCaseCategory = category.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${iYear}_${upperCaseCategory}${comparisonYear}`;

	urlParts.pathname = path.join('/');

	return urlParts.toString();
}