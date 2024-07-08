// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData, mergeVersionDataAndFormat } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';

createDevDropdown();

export async function getDataAndLoadSelect2(callerId, category, uri, version) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const { future, past } = queryBuilder(callerId, category, uri, version);

  $('#spinner').show();

  const futureData = new Promise((resolve, reject) => {
    makeAjaxRequest(
      `${corsAnywhereUrl}${sparqlEndpoint}?query=${encodeURIComponent(future)}`,
      'GET',
      { 'Accept': 'application/sparql-results+json' },
      null,
      resolve,
      reject
    );
  });

  const pastData = new Promise((resolve, reject) => {
    makeAjaxRequest(
      `${corsAnywhereUrl}${sparqlEndpoint}?query=${encodeURIComponent(past)}`,
      'GET',
      { 'Accept': 'application/sparql-results+json' },
      null,
      resolve,
      reject
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