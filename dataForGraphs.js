import { modifyYearInURL } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest as makeAjaxRequest } from "./ajaxHelper.js";

const maxYear = 2024;
let baseYear = 0;
let baseUri = "";
let callerId = "";
let category = "";
let baseConceptId = "";

export function composeGraphData(id, cat, iUri, iYear, conceptId) {
	callerId = id;
	category = cat;
  baseYear = iYear;
  baseUri = iUri;
  baseConceptId = conceptId;

	renderGraphData(iUri, iYear, conceptId);
}

function renderGraphData(iUri, iYear, conceptId) {
	console.log("Rendering graph data for:", conceptId, "in year:", iYear, iUri);
	try {
		getDataAndLoad(iUri, iYear, conceptId);
	} catch (error) {
		console.error("Error:", error.message);
	}
}

function getDataAndLoad(iUri, iYear, conceptId) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const conceptRDFUri = iUri + '_' + conceptId;

  const query = queryBuilder(callerId, category, conceptRDFUri, iYear);
	console.log("Query:", query);

  $('#spinner').show();

  makeAjaxRequest(
    `${corsAnywhereUrl}${sparqlEndpoint}`,
    "POST",
    {
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    { query: query },
    function (data) {
			formatDataGraphs(data, iUri, iYear, conceptId);
      $("#spinner").hide();
    },
    function (jqXHR, textStatus, errorThrown) {
      console.error("Error executing query:", errorThrown);
      $("#spinner").hide();
    },
    callerId
  );
}

// This is the callback function that will process the data
export function formatDataGraphs(data, iUri, iYear, conceptId) {
  const bindings = data.results.bindings;

  const result = createGraphDataFromBindings(bindings, conceptId, iYear);
	 
  // Recursive call for each targetId if the targetYear is less than or equal to maxYear
  result.targetIds.forEach(target => {
    if (target.targetYear < maxYear) {
			renderGraphData(modifyYearInURL(iUri, true), target.targetYear, target.targetId);
    }
  });
}

function createGraphDataFromBindings(bindings, conceptId, iYear) {
  const nodes = [];
  const edges = [];
  const processedNodes = new Set();
  const processedEdges = new Set();

  const nodeKey = `${conceptId}-${iYear}`;

  if (!processedNodes.has(nodeKey)) {
    createNode(conceptId, iYear, nodes);
    processedNodes.add(nodeKey);
  }

  // Map source IDs and target IDs to their records for quick lookup
  const targetMap = {};
  const targetYear = iYear + 1;
  const targetIds = [];

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    if (!targetMap[targetId]) targetMap[targetId] = [];
    targetMap[targetId].push({ conceptId, startYear: iYear });

    const nodeKey = `${targetId}-${targetYear}`;

    if (!processedNodes.has(nodeKey)) {
      createNode(targetId, targetYear, nodes);
      processedNodes.add(nodeKey);
    }

    const edgeKey = `${conceptId}-${iYear}->${targetId}-${targetYear}`;

    if (!processedEdges.has(edgeKey)) {
      edges.push({
        source: `${conceptId}-${iYear}`,
        target: `${targetId}-${targetYear}`,
      });
      processedEdges.add(edgeKey);
    }

    targetIds.push({ targetId, targetYear });
  });

  return { nodes, edges, targetIds };
}

function createNode(id, year, nodes) {
  const node = {
    id: `${id}-${year}`,
    label: id,
    year: year,
  };
  nodes.push(node);
}
