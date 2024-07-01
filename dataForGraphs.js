import { getYearComparisonURI } from "./uriHelper.js";
import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";

const maxYear = 2024;
const minYear = 2017;
export let callerId = "";
export let category = "";
let globalNodes = new Set();
let globalEdges = new Set();
let processedNodes = new Set();
let processedEdges = new Set();

export async function composeGraphData(id, cat, uri, iYear, conceptId, conceptLabel) {
  callerId = id;
  category = cat;

  globalNodes = new Set();
  globalEdges = new Set();
  processedNodes = new Set();
  processedEdges = new Set();

  await renderLineageData(uri, iYear, conceptId, conceptLabel)
    .catch((error) => {
      console.error("Error:", error.message);
      throw error; // Halting on error
    });

  const nodes = Array.from(globalNodes).map(node => JSON.parse(node));
  const edges = Array.from(globalEdges).map(edge => JSON.parse(edge));
  return { nodes, edges };
}


async function renderLineageData(iUri, iYear, conceptId, conceptLabel) {
  const positiveUri = getYearComparisonURI(iUri, category, iYear, true);
  const negativeUri = getYearComparisonURI(iUri, category, iYear, false);

  try {
    await renderGraphData(positiveUri, conceptId, conceptLabel, iYear, iYear + 1);
    await renderGraphData(negativeUri, conceptId, conceptLabel, iYear, iYear - 1);
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Halting on error
  };
}

const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  if (iYear < minYear || iYear > maxYear) return; // Stop recursion based on year bounds

  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

  try {
    const newTargets = await requestQueue.add(() => fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear));
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        // console.log("New concept:", nodeKey, iUri);
        return renderLineageData(iUri, target.targetYear, target.targetId, target.targetLabel);
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

export function getTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const bindings = data.results.bindings;

  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges);

  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));

  return result.targetIds; // Return target IDs for further processing
}

function logGraphData() {
  console.log("Global Nodes:", Array.from(globalNodes).map(node => JSON.parse(node)));
  console.log("Global Edges:", Array.from(globalEdges).map(edge => JSON.parse(edge)));
}