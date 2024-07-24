export function prepareAndStoreCorrespondenceData(formattedData) {
	const storageData = formattedData.map(item => ({
		thisYear: Number(item.id),
		pastYear: item.text === "PRODCOM 2021" ? 2019 : Number(item.data.pastYear),
		nextYear: item.text === "PRODCOM 2019-2020" ? 2021 : Number(item.data.nextYear),
		correspUri: item.text === "PRODCOM 2019-2020" ? "http://data.europa.eu/qw1/prodcom2019/PRODCOM2019_PRODCOM2021" : item.data.correspUri,
	}));
	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
}

let correspondenceTableCache = null;

// Extracts the correspondence table from session storage
export async function getCorrespondenceTable() {
  if (correspondenceTableCache === null) {
    correspondenceTableCache = JSON.parse(sessionStorage.getItem("correspondence-table"));
  }
  return correspondenceTableCache;
}
