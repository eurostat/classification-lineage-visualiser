// File: getDataAndLoadSelect2.js
import { queryBuilder } from './queryBuilder.js';
import { makeAjaxRequest } from './ajaxHelper.js';
import { formatData } from './dataFormatter.js';
import { initializeSelect2 } from './select2Helper.js';
import { createDevDropdown } from './createDevDropdown.js';

createDevDropdown();

export function getDataAndLoadSelect2(callerId, category, uri, version) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const query = queryBuilder(callerId, category, uri, version);

  $('#spinner').show();

  makeAjaxRequest(
    `${corsAnywhereUrl}${sparqlEndpoint}?query=${encodeURIComponent(query)}`,
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
    }
  );
}