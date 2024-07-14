// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';

createDevDropdown();

export function getDataAndLoadSelect2( callerId, family, correspondences, version) {
  
	const proxy = "https://cors-anywhere.herokuapp.com/";
	const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const endpointURL = `${proxy}${sparqlEndpoint}`;
  
  $("#spinner").show();

	if (callerId === "families") {
    const query = queryBuilder(callerId, family);
		getVersion(callerId, query, endpointURL);
	} else if (callerId === "versions") {
		const query = queryBuilder(callerId, family, correspondences, version);
		getConceptIDs(callerId, query, endpointURL);

	}
}

async function getVersion(callerId, query, sparqlEndpoint) {
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

	const formattedData = formatData(callerId, futureResponse); // Assuming formatData can handle JSON object

	initializeSelect2(callerId, formattedData); // Load formatted data into select2

	// Simplify data transformation if only restructuring
	const storageData = formattedData.map(item => ({
	  thisYear: item.id,
	  nextYear: item.data.nextYear,
	  comparison: item.data.comparison,
	})).filter(item => item.thisYear !== ""); // Filter after mapping to simplify

	sessionStorage.setItem("correspondence-table", JSON.stringify(storageData));
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