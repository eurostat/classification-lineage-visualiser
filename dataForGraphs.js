import { getYearComparisonURI } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest as makeAjaxRequest } from "./ajaxHelper.js";

const maxYear = 2024;
const minYear = 2017;
let baseYear = 0;
let baseUri = "";
let callerId = "";
let category = "";
let baseConceptId = "";
let globalNodes = [];
let globalEdges = [];
let processedNodes = new Set();
let processedEdges = new Set();

export async function composeGraphData(id, cat, uri, iYear, conceptId) {
	callerId = id;
	category = cat;
	baseYear = iYear;
	baseUri = uri;
	baseConceptId = conceptId;
	const target = { isPositive: true };
	const iUri = getYearComparisonURI(
		baseUri,
		category,
		baseYear,
		target.isPositive
	);

	globalNodes = [];
	globalEdges = [];
	processedNodes = new Set();
	processedEdges = new Set();

	await renderGraphData(iUri, iYear, conceptId);
}

async function renderGraphData(iUri, iYear, conceptId) {
	if (iYear > maxYear || iYear < minYear) return; // Stop recursion based on year bounds

	console.log("Rendering graph data for:", conceptId, "in year:", iYear, iUri);
	try {
		const newTargets = await getDataAndLoad(iUri, iYear, conceptId);
		if (newTargets.length > 0) {
			const newPromises = newTargets.map((target) =>
				renderGraphData(
					getYearComparisonURI(baseUri, category, baseYear, target.isPositive),
					target.targetYear,
					target.targetId
				)
			);
			await Promise.all(newPromises); // Wait until all promises are resolved
		}
	} catch (error) {
		console.error("Error:", error.message);
		throw error; // Halting on error
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
	return new Promise((resolve, reject) => {
		makeAjaxRequest(
			`${corsAnywhereUrl}${sparqlEndpoint}?${queryParams}`, // Include query parameters in the URL
			"GET", // Change to GET method
			{
				Accept: "application/sparql-results+json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			{}, // No data in the body for GET request
			function (data) {
				const newTargets = formatDataGraphs(data, iUri, iYear, conceptId);
				$("#spinner").hide();
				resolve(newTargets); // Resolve promise with new targets
			},
			function (jqXHR, textStatus, errorThrown) {
				console.error("Error executing query:", errorThrown);
				$("#spinner").hide();
				reject(new Error(errorThrown)); // Reject promise with error
			},
			callerId
		);
	});
}

export function formatDataGraphs(data, iUri, iYear, conceptId) {
	const bindings = data.results.bindings;

	const result = createGraphDataFromBindings(bindings, conceptId, iYear);

	globalNodes = globalNodes.concat(result.nodes);
	globalEdges = globalEdges.concat(result.edges);

	return result.targetIds; // Return target IDs for further processing
}

function createGraphDataFromBindings(bindings, conceptId, iYear) {
	const nodes = [];
	const edges = [];
	const targetYearPositive = iYear + 1;
	const targetYearNegative = iYear - 1;
	const targetIds = [];

	const nodeKey = `${conceptId}-${iYear}`;
	if (!processedNodes.has(nodeKey)) {
		createNode(conceptId, iYear, nodes);
		processedNodes.add(nodeKey);
	}

	bindings.forEach((record) => {
		const targetId = record.ID.value;

		// Positive year direction
		const targetNodeKeyPositive = `${targetId}-${targetYearPositive}`;
		if (!processedNodes.has(targetNodeKeyPositive)) {
			createNode(targetId, targetYearPositive, nodes);
			processedNodes.add(targetNodeKeyPositive);
		}

		const edgeKeyPositive = `${conceptId}-${iYear}->${targetId}-${targetYearPositive}`;
		if (!processedEdges.has(edgeKeyPositive)) {
			edges.push({
				source: `${conceptId}-${iYear}`,
				target: `${targetId}-${targetYearPositive}`,
			});
			processedEdges.add(edgeKeyPositive);
		}

		targetIds.push({
			targetId,
			targetYear: targetYearPositive,
			isPositive: true,
		});

		// Negative year direction
		const targetNodeKeyNegative = `${targetId}-${targetYearNegative}`;
		if (!processedNodes.has(targetNodeKeyNegative)) {
			createNode(targetId, targetYearNegative, nodes);
			processedNodes.add(targetNodeKeyNegative);
		}

		const edgeKeyNegative = `${conceptId}-${iYear}->${targetId}-${targetYearNegative}`;
		if (!processedEdges.has(edgeKeyNegative)) {
			edges.push({
				source: `${conceptId}-${iYear}`,
				target: `${targetId}-${targetYearNegative}`,
			});
			processedEdges.add(edgeKeyNegative);
		}

		targetIds.push({
			targetId,
			targetYear: targetYearNegative,
			isPositive: false,
		});
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
