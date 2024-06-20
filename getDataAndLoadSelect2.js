// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';

export function getDataAndLoadSelect2(elementId, category, year) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const query = queryBuilder(elementId, category, year);
  console.log('Query:', query);

  $('#spinner').show();

  makeAjaxRequest(
    `${corsAnywhereUrl}${sparqlEndpoint}`,
    'POST',
    {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    { query: query },
    function (data) {
      const formattedData = formatData(elementId, data);
      initializeSelect2(elementId, formattedData);
      $('#spinner').hide();
    },
    function (jqXHR, textStatus, errorThrown) {
      console.error('Error executing query:', errorThrown);
      $('#spinner').hide();
    }
  );
}