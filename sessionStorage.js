export function prepareAndStoreCorrespondenceData(formattedData, family) {
	const storageData = formattedData.map(item => ({
		thisYear: item.id,
		pastYear: family === "prodcom" && item.id === "2021" ? item.id - 2 : item.id - 1,
		nextYear: item.data.nextYear,
		comparisonUri: item.data.comparisonUri,
	}));
	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
}
