export function prepareAndStoreCorrespondenceData(formattedData) {
	const storageData = formattedData.map(item => ({
		thisYear: item.id,
		pastYear: item.data.pastYear,
		nextYear: item.data.nextYear,
		comparisonUri: item.data.comparisonUri,
	}));
	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
}
