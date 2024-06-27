import { modifyYearInURL } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest as makeAjaxRequest } from "./ajaxHelper.js";

const maxYear = 2024;
let baseYear = 0;
let baseUri = "";
let callerId = "";
let category = "";
let baseConceptId = "";
let globalNodes = [];
let globalEdges = [];
let processedNodes = new Set();
let processedEdges = new Set();

export async function composeGraphData(id, cat, iUri, iYear, conceptId) {
  callerId = id;
  category = cat;
  baseYear = iYear;
  baseUri = iUri;
  baseConceptId = conceptId;

  globalNodes = [];
  globalEdges = [];
  processedNodes = new Set();
  processedEdges = new Set();

  await renderGraphData(iUri, iYear, conceptId);
}

async function renderGraphData(iUri, iYear, conceptId) {
  console.log("Rendering graph data for:", conceptId, "in year:", iYear, iUri);
  try {
    await getDataAndLoad(iUri, iYear, conceptId);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function getDataAndLoad(iUri, iYear, conceptId) {
	const corsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
	const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
	const conceptRDFUri = iUri + "_" + conceptId;

	const query = queryBuilder(callerId, category, conceptRDFUri, iYear);
	console.log("Query:", query);

	$("#spinner").show();

	// Helper function to convert an object to query parameters
	function toQueryParams(data) {
		return Object.keys(data)
			.map(
				(key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
			)
			.join("&");
	}

	// Data to be sent as query parameters
	const data = { query: query };
	const queryParams = toQueryParams(data);

	// Updated makeAjaxRequest function call
	await makeAjaxRequest(
		`${corsAnywhereUrl}${sparqlEndpoint}?${queryParams}`, // Include query parameters in the URL
		"GET", // Change to GET method
		{
			Accept: "application/sparql-results+json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
		{}, // No data in the body for GET request
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

export async function formatDataGraphs(data, iUri, iYear, conceptId) {
  const bindings = data.results.bindings;

  const result = createGraphDataFromBindings(bindings, conceptId, iYear);

  globalNodes = globalNodes.concat(result.nodes);
  globalEdges = globalEdges.concat(result.edges);

  for (const target of result.targetIds) {
    if (target.targetYear < maxYear) {
      await renderGraphData(modifyYearInURL(iUri, true), target.targetYear, target.targetId);
    }
  }
}

function createGraphDataFromBindings(bindings, conceptId, iYear) {
  const nodes = [];
  const edges = [];
  const targetYear = iYear + 1;
  const targetIds = [];

  const nodeKey = `${conceptId}-${iYear}`;
  if (!processedNodes.has(nodeKey)) {
    createNode(conceptId, iYear, nodes);
    processedNodes.add(nodeKey);
  }

  bindings.forEach((record) => {
    const targetId = record.ID.value;

    const targetNodeKey = `${targetId}-${targetYear}`;
    if (!processedNodes.has(targetNodeKey)) {
      createNode(targetId, targetYear, nodes);
      processedNodes.add(targetNodeKey);
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
