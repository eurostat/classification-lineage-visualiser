import { getYearComparisonURI } from "./uriHelper.js";
import { createNode, createEdge } from "./nodesAndEdges.js";
import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";

const maxYear = 2024;
const minYear = 2017;
export let callerId = "";
export let category = "";
let globalNodes = [];
let globalEdges = [];
let processedNodes = new Set();
let processedEdges = new Set();

export async function composeGraphData(id, cat, uri, iYear, conceptId) {
  callerId = id;
  category = cat;

  globalNodes = [];
  globalEdges = [];
  processedNodes = new Set();
  processedEdges = new Set();

  // Start positive and negative recursion in parallel
  await renderLineageData(uri, iYear, conceptId);

  // Log nodes and edges once all recursion is completed
  logGraphData();
}

async function renderLineageData(iUri, iYear, conceptId) {
  const positiveUri = getYearComparisonURI(iUri, category, iYear, true);
  const negativeUri = getYearComparisonURI(iUri, category, iYear, false);

  await Promise.all([
    renderGraphData(positiveUri, conceptId, iYear, iYear + 1),
    renderGraphData(negativeUri, conceptId, iYear, iYear - 1),
  ]).catch((error) => {
    console.error("Error:", error.message);
    throw error; // Halting on error
  });
}

const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(iUri, conceptId, iYear, targetYear) {
  if (iYear < minYear || iYear > maxYear) return; // Stop recursion based on year bounds

  const nodeKey = `${conceptId}-${iYear}`;
  console.log(conceptId.substring(3, 9) + "-" + iYear, iUri, processedNodes.has(nodeKey));
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

  try {
    const newTargets = await requestQueue.add(() => fetchAndProcessData(iUri, conceptId, iYear, targetYear));
    console.log("New Targets:", newTargets);
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      console.warn("Node is processed:", nodeKey);
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        console.log("New Target:", target.targetId.substring(3, 9) + "-" + target.targetYear, iUri);
        return renderLineageData(iUri, target.targetYear, target.targetId);
      });
      await Promise.all(newPromises).catch((error) => {
        console.error("Error:", error.message);
        throw error; // Halting on error
      }); // Wait until all promises are resolved
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Halting on error
  }
}

export function getTargets(data, conceptId, iYear, targetYear) {
  const bindings = data.results.bindings;

  const result = createGraphDataFromBindings(bindings, conceptId, iYear, targetYear);

  globalNodes = globalNodes.concat(result.nodes);
  globalEdges = globalEdges.concat(result.edges);

  return result.targetIds; // Return target IDs for further processing
}

function createGraphDataFromBindings(bindings, conceptId, iYear, targetYear) {
  const nodes = [];
  const edges = [];
  const targetIds = [];

  const nodeKey = `${conceptId}-${iYear}`;
  if (!processedNodes.has(nodeKey)) {
    createNode(conceptId, iYear, nodes);
    processedNodes.add(nodeKey);
  }

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    processBindings(targetId, nodes, conceptId, iYear, targetYear, edges, targetIds);
  });

  return { nodes, edges, targetIds };
}

function processBindings(targetId, nodes, conceptId, iYear, targetYear, edges, targetIds) {
  const targetNodeKey = `${targetId}-${targetYear}`;
  if (!processedNodes.has(targetNodeKey)) {
    createNode(targetId, targetYear, nodes);
    // Processed nodes are not added here to ensure the recursion handles them correctly
		processedNodes.add(targetNodeKey);
  }

  const sourceNodeKey = `${conceptId}-${iYear}`;
  const edgeKey = `${sourceNodeKey}->${targetNodeKey}`;
  if (!processedEdges.has(edgeKey)) {
    createEdge(edges, sourceNodeKey, targetNodeKey);
    processedEdges.add(edgeKey);
  }

  targetIds.push({ targetId, targetYear });
}

function logGraphData() {
  console.log("Global Nodes:", globalNodes);
  console.log("Global Edges:", globalEdges);
}
