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
  return data.results.bindings.map(item => ({
    id: item.VERSION.value,
    text: item.NOTATION.value,
    uri: item.URI.value,
  }));
}

export function formatData(callerId, data) {
  if (callerId === 'versions') {
    return formatDataCodes(data);
  } else if (callerId === 'families') {
    return formatDataVersions(data);
  }
}

export function mergeVersionDataAndFormat(futureData, pastData) {
  const mergedData = [...futureData, ...pastData];

  const formattedData = mergedData.reduce((acc, item, index) => {
    let existingItem = acc.find(x => x.id === item.id);

    if (!existingItem) {
      existingItem = {
        id: item.id,
        text: item.text,
        data: { futureURI: "", pastURI: "" },
      };
      acc.push(existingItem);
    }

    if (index < futureData.length) {
      existingItem.data.futureURI = item.uri;
    } else {
      existingItem.data.pastURI = item.uri;
    }

    return acc;
  }, []);

  // sort the array by id
  formattedData.sort((a, b) => a.id - b.id);

  // Prepend an empty element to the array
  formattedData.unshift({ id: "", text: "" });

  return formattedData;
}