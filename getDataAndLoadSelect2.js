// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';
import { prepareAndStoreCorrespondenceData } from './sessionStorage.js';

createDevDropdown();

export function getDataAndLoadSelect2( callerId, family, correspondenceUri, version) {
	const proxy = "https://cors-anywhere.herokuapp.com/";
	const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const endpointURL = `${proxy}${sparqlEndpoint}`;
  
  $("#spinner").show();

	if (callerId === "families") {
    const query = queryBuilder(callerId, family);
		getVersion(callerId, query, family, endpointURL);
	} else if (callerId === "versions") {
		const query = queryBuilder(callerId, family, correspondenceUri, version);
		getConceptIDs(callerId, query, endpointURL);

	}
}

async function getVersion(callerId, query, family, sparqlEndpoint) {
  $("#spinner").show(); // Ensure spinner is shown at the start
  try {
	const futureResponse = await new Promise((resolve, reject) => {
	  makeAjaxRequest(
		`${sparqlEndpoint}?query=${encodeURIComponent(query)}`,
		"GET",
		{ Accept: "application/sparql-results+json" },
		null,
		(response) => resolve(response), 
		(error) => reject(error), 
		"future"
	  );
	});

	const formattedData = formatData(callerId, futureResponse);

	prepareAndStoreCorrespondenceData(formattedData, family);
	
	formattedData.unshift({ id: "", text: "" }); // Prepend an empty element to the array
	initializeSelect2(callerId, formattedData); // Load formatted data into select2

  } catch (error) {
	console.error("Error executing query:", error);
  } finally {
	$("#spinner").hide(); // Ensure spinner is hidden at the end
  }
}

export function getConceptIDs(callerId, query, endpointURL) {
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
    callerId
  
  );
}