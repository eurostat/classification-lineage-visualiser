// Global sets to keep track of nodes and edges

export const globalNodes = new Set();
export const globalEdges = new Set();
export const processedNodes = new Set();
export const processedEdges = new Set();// Function to clear global sets

export function resetGlobalData(id, kin) {
  // Set global identifiers
  callerId = id;
  family = kin;
  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();
}

export let callerId = "";
export let family = "";

export const proxy = "https://cors-anywhere.herokuapp.com/";
export const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
export const endpointURL = `${proxy}${sparqlEndpoint}`;