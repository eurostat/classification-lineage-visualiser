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
  return data.results.bindings
    .filter((item) => /^\d{4}$/.test(item.thisYear.value))
    .map((item) => ({
      id: item.thisYear.value,
      text: item.thisNotation.value,
      data: {
        correspUri: item.correspondenceUri?.value ?? "",
        conceptSchemeUri: item.conceptSchemeUri?.value ?? "",
        nextYear: item.nextYear?.value ?? "",
        pastYear: item.pastYear?.value ?? "",
      },
    }))
}

export function formatData(callerId, data) {
  if (callerId === 'versions') {
    return formatDataCodes(data);
  } else if (callerId === 'families') {
    return formatDataVersions(data);
  }
}