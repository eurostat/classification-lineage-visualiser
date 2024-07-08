// File: dataFormatter.js
function formatDataCodes(data) {
  const formattedData = data.results.bindings.map(item => ({
    id: item.ID.value,
    text: `[${item.CODE.value}] ${item.LABEL.value}`,
    code: item.CODE.value,
  }));

  // Prepend an empty element to the array
  formattedData.unshift({ id: "", text: "" });

  return formattedData;
}

function formatDataVersions(data) {
  const formattedData = data.results.bindings.map(item => ({
    id: item.VERSION.value,
    text: item.NOTATION.value,
    uri: item.URI.value,
  }));


  return formattedData;
}

export function formatData(callerId, data) {
  if (callerId === 'versions') {
    return formatDataCodes(data);
  } else if (callerId === 'categories') {
    return formatDataVersions(data);
  }
}

export function mergeVersionDataAndFormat(futureData, pastData) {
  const mergedData = [...futureData, ...pastData];

  const formattedData = mergedData.reduce((acc, item, index) => {
    const existingItem = acc.find(x => x.id === item.id);
    if (existingItem) {
      if (index < futureData.length) {
        existingItem.data.future= item.uri;
      } else {
        existingItem.data.past= item.uri;
      }
    } else {
      const newItem = {
				id: item.id,
				text: item.text,
				data: { future: "", past: "" },
			};

      if (index < futureData.length) {
        newItem.data.future= item.uri;
      } else {
        newItem.data.past= item.uri;
      }
      acc.push(newItem);
    }
    return acc;
  }, []);

  // Prepend an empty element to the array
  formattedData.unshift({ id: "", text: "" });

  return formattedData;
}