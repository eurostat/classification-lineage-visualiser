export function prepareAndStoreCorrespondenceData(formattedData) {
	const storageData = formattedData.map(item => ({
		thisYear: item.id,
		pastYear: item.data.pastYear,
		nextYear: item.data.nextYear,
		correspUri: item.data.correspUri,
	}));
	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
}
