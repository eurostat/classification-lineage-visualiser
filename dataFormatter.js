// File: dataFormatter.js
function formatDataCodes(data) {
  const formattedData = data.results.bindings.map(item => ({
    id: item.ID.value,
    text: `[${item.CODE.value}] ${item.LABEL.value}`,
  }));

  // Prepend an empty element to the array
  formattedData.unshift({ id: "", text: "" });

  return formattedData;
}

function formatDataVersions(data) {
  const formattedData = data.results.bindings.map(item => ({
    id: item.VERSION.value,
    text: item.NOTATION.value,
    data: {
      uri: item.URI.value,
    },
  }));

  // Prepend an empty element to the array
  formattedData.unshift({ id: "", text: "" });

  return formattedData;
}

export function formatData(callerId, data) {
  if (callerId === 'versions') {
    return formatDataCodes(data);
  } else if (callerId === 'categories') {
    return formatDataVersions(data);
  }
}

