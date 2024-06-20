// File: dataFormatter.js
function formatDataCodes(data) {
  return data.results.bindings.map(item => ({
    id: item.ID.value,
    text: `[${item.CODE.value}] ${item.LABEL.value}`,
  }));
}

function formatDataVersions(data) {
	return data.results.bindings.map((item) => ({
		id: item.URI.value,
		text: item.NOTATION.value,
	}));
}

export function formatData(callerId, data) {
  if (callerId === 'versions') {
    return formatDataCodes(data);
  } else if (callerId === 'categories') {
    return formatDataVersions(data);
  }
}

