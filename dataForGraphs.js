import { modifyYearInURL } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest as makeAjaxRequest } from "./ajaxHelper.js";

const maxYear = 2024;
let callerId = '';
let category = "";

export function composeGraphData(id, cat, baseUri, baseYear, conceptId) {
	callerId = id;
	category = cat;

	renderGraphData(baseUri, baseYear, conceptId);
}

function renderGraphData(baseUri, baseYear, conceptId) {
	console.log("Rendering graph data for:", conceptId, "in year:", baseYear, baseUri);
	try {
		getDataAndLoad(baseUri, baseYear, conceptId);
	} catch (error) {
		console.error("Error:", error.message);
	}
}

function getDataAndLoad(baseUri, baseYear, conceptId) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const conceptRDFUri = baseUri + '_' + conceptId;

  const query = queryBuilder(callerId, category, conceptRDFUri, baseYear);
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
			formatDataGraphs(data, baseUri, baseYear, conceptId);
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
export function formatDataGraphs(data, baseUri, baseYear, conceptId) {
  const bindings = data.results.bindings;

  const result = createGraphDataFromBindings(bindings, conceptId, baseYear);

	console.log("nodes:", result.nodes);
	console.log("edges:", result.edges);
	console.log("targetIds:", result.targetIds);
	 
  // Recursive call for each targetId if the targetYear is less than or equal to maxYear
  result.targetIds.forEach(target => {
    if (target.targetYear <= maxYear) {
			renderGraphData(modifyYearInURL(baseUri, true), target.targetYear, target.targetId);
    }
  });
}

function createGraphDataFromBindings(bindings, conceptId, baseYear) {
  const nodes = [];
  const edges = [];
  const processedNodes = new Set();
  const processedEdges = new Set();

  const nodeKey = `${conceptId}-${baseYear}`;

  if (!processedNodes.has(nodeKey)) {
    createNode(conceptId, baseYear, nodes);
    processedNodes.add(nodeKey);
  }

  // Map source IDs and target IDs to their records for quick lookup
  const targetMap = {};
  const targetYear = baseYear + 1;
  const targetIds = [];

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    if (!targetMap[targetId]) targetMap[targetId] = [];
    targetMap[targetId].push({ conceptId, startYear: baseYear });

    const nodeKey = `${targetId}-${targetYear}`;

    if (!processedNodes.has(nodeKey)) {
      createNode(targetId, targetYear, nodes);
      processedNodes.add(nodeKey);
    }

    const edgeKey = `${conceptId}-${baseYear}->${targetId}-${targetYear}`;

    if (!processedEdges.has(edgeKey)) {
      edges.push({
        source: `${conceptId}-${baseYear}`,
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
