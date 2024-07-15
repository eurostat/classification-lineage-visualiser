export function prepareAndStoreCorrespondenceData(formattedData) {
	const storageData = formattedData.map(item => ({
		thisYear: Number(item.id),
		pastYear: Number(item.data.pastYear),
		nextYear: Number(item.data.nextYear),
		correspUri: item.data.correspUri,
	}));
	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
}

// Extracts the correspondence table from session storage
export async function getCorrespondenceTable() {
  return JSON.parse(sessionStorage.getItem("correspondence-table"));
}

