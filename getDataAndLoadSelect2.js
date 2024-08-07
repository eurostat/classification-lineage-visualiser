// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';
import { prepareAndStoreCorrespondenceData } from './sessionStorage.js';
import { endpointURL } from './globals.js';

createDevDropdown();

export function getDataAndLoadSelect2( callerId, family, correspondenceUri, version) {
	if (callerId === "families") {
    const query = queryBuilder(callerId, family);
		getVersion(callerId, query, endpointURL);
	} else if (callerId === "versions") {
		const query = queryBuilder(callerId, family, correspondenceUri, version);
		getConceptIDs(callerId, query, endpointURL);
	}
}

async function getVersion(callerId, query, sparqlEndpoint) {
  $("#spinner").show(); 
  try {
	const futureResponse = await new Promise((resolve, reject) => {
	  makeAjaxRequest(
		`${sparqlEndpoint}?query=${encodeURIComponent(query)}`,
		"GET",
		{ Accept: "application/sparql-results+json" },
		null,
		(response) => resolve(response), 
		(error) => reject(error), 
		"getVersion function call from " + callerId
	  );
	});

	const formattedData = formatData(callerId, futureResponse);

	prepareAndStoreCorrespondenceData(formattedData);
	
	formattedData.unshift({ id: "", text: "" }); // Prepend an empty element to the array
	initializeSelect2(callerId, formattedData); // Load formatted data into select2

  } catch (error) {
	console.error("Error executing query:", error);
  } finally {
	$("#spinner").hide(); // Ensure spinner is hidden at the end
  }
}

export function getConceptIDs(callerId, query, endpointURL) {
  $("#spinner").show();
  makeAjaxRequest(
    `${endpointURL}?query=${encodeURIComponent(query)}`,
    'GET',
    {
      'Accept': 'application/sparql-results+json',
    },
    null,
    function (data) {
      const formattedData = formatData(callerId, data);
      initializeSelect2(callerId, formattedData);
      $('#spinner').hide();
    },
    function (jqXHR, textStatus, errorThrown) {
      console.error('Error executing query:', errorThrown);
      $('#spinner').hide();
    },
		"getConceptIDs function call from " + callerId
  
  );
}