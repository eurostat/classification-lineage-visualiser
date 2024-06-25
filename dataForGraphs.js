import { createConceptURL, modifyYearInURL } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest } from "./ajaxHelper.js";


export function getDataForGraphs(callerId, conceptId, baseYear, category, uri) {
  console.log("getDataForGraphs called with id:", conceptId, "version:", baseYear, "category:", category, "uri:", uri); 
  try {
    const conceptRDFUrl = createConceptURL(uri, category) + '_' + '846229100080';
    // const conceptRDFUrl = createConceptURL(uri, category) + '_' + conceptId;

    getDataAndLoad(callerId, category, conceptRDFUrl, baseYear, '846229100080');
    // getDataAndLoad(callerId, category, conceptRDFUrl, baseYear, conceptId);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

function getDataAndLoad(callerId, category, uri, baseYear, conceptId) {
  console.log("getDataAndLoad called with id:", callerId, "category:", category, "uri:", uri, "version:", baseYear, "conceptId:", conceptId)
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const query = queryBuilder(callerId, category, uri, baseYear);
  console.log('Query:', query);

  // throw new Error("getDataAndLoad not implemented yet");


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
			formatDataGraphs(data, baseYear, conceptId); // This is the callback function that will process the data
		},
		function (jqXHR, textStatus, errorThrown) {
			console.error("Error executing query:", errorThrown);
			$("#spinner").hide();
		},
		callerId
	);
}

export function formatDataGraphs(data, startYear, conceptId) {
  console.log("formatDataGraphs called with id:", conceptId, "year:", startYear, data);
	const bindings = data.results.bindings;

	// Function to create a node
	const createNode = (id, year, nodes, idToNodes) => {
		const node = {
			id: `${id}-${year}`,
			label: id,
			year: year,
		};
		nodes.push(node);
		idToNodes[node.id] = node;
		return node;
	};

	// Function to process children (ancestors)
	const processChildren = ( id, year, targetMap, idToNodes, edges, queue, processedEdges, nodes) => {
		if (targetMap[id]) {
			targetMap[id].forEach(({ sourceId, year }) => {
				const edgeKey = `${sourceId}-${year}->${id}-${year + 1}`;
				if (!processedEdges.has(edgeKey)) {
					if (!idToNodes[`${sourceId}-${year}`])
						createNode(sourceId, year, nodes, idToNodes);
					if (!idToNodes[`${id}-${year + 1}`])
						createNode(id, year + 1, nodes, idToNodes);

					edges.push({
						source: `${sourceId}-${year}`,
						target: `${id}-${year + 1}`,
					});
					processedEdges.add(edgeKey);
					console.log(
						"children",
						id.substring(4, 8),
						sourceId.substring(4, 8),
						year
					);

					queue.push({ id: sourceId, year: year });
				}
			});
		}
	};

	// Main function to process data
	const processData = (bindings, conceptId, startYear) => {
    console.log("processData called with id:", conceptId, "year:", startYear, bindings);
		const nodes = [];
		const edges = [];
		const idToNodes = {};
		const processedNodes = new Set(); // Set to keep track of processed nodes
		const processedEdges = new Set(); // Set to keep track of processed edges
		const queue = [{ id: conceptId, year: startYear }];

		// Map source IDs and target IDs to their records for quick lookup
		const targetMap = {};

		bindings.forEach((record) => {
			const targetId = record.ID.value;
      console.log("targetId", targetId, record);
			if (!targetMap[targetId]) targetMap[targetId] = [];
			targetMap[targetId].push({ conceptId, startYear});
		});

		// Processing loop for descendants and ancestors
		while (queue.length > 0) {
			const { id, year } = queue.shift();
			const currentNodeKey = `${id}-${year}`;
			console.log("queue", id.substring(4, 8), year);

			if (processedNodes.has(currentNodeKey)) {
				continue; // Skip if this node has already been processed
			}
			processedNodes.add(currentNodeKey);

			// processParents( id, year, sourceMap, idToNodes, edges, queue, processedEdges, nodes);
			processChildren( id, year, targetMap, idToNodes, edges, queue, processedEdges, nodes );
		}

		return { nodes, edges };
	};

	const result = processData(bindings, conceptId, startYear);
	console.log(result.nodes);
	console.log(result.edges);
}