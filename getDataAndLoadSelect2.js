// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData, mergeVersionDataAndFormat } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';

createDevDropdown();

export function getDataAndLoadSelect2( callerId, family, correspondences, version) {
	const proxy = "https://cors-anywhere.herokuapp.com/";
	const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const endpointURL = `${proxy}${sparqlEndpoint}`;

	if (callerId === "families") {
    
		$("#spinner").show();
		const { future, past } = queryBuilder( callerId, family, endpointURL, version);
		getVersions(callerId, past, future, endpointURL);

	} else if (callerId === "versions") {

		const query = queryBuilder(callerId, family, correspondences, version);
		getConceptIDs(callerId, query, endpointURL);

	}
}

async function getVersions(callerId, past, future, sparqlEndpoint) {

  const futureData = new Promise((resolve, reject) => {
    makeAjaxRequest(
      `${sparqlEndpoint}?query=${encodeURIComponent(future)}`,
      'GET',
      { 'Accept': 'application/sparql-results+json' },
      null,
      resolve,
      reject,
      "future"
    
    );
  });

  const pastData = new Promise((resolve, reject) => {
    makeAjaxRequest(
      `${sparqlEndpoint}?query=${encodeURIComponent(past)}`,
      'GET',
      { 'Accept': 'application/sparql-results+json' },
      null,
      resolve,
      reject,
      "past"
    );
  });

  try {
    const [futureResponse, pastResponse] = await Promise.all([futureData, pastData]);
    const formattedFutureData = formatData(callerId, futureResponse);
    const formattedPastData = formatData(callerId, pastResponse);

    const mergedData = mergeVersionDataAndFormat(formattedFutureData, formattedPastData);

    initializeSelect2(callerId, mergedData);
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    $('#spinner').hide();
  }
}

export function getConceptIDs(callerId, query, endpointURL) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";


  $('#spinner').show();

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