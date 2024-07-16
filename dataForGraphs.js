import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";
import { getCorrespondenceTable } from "./sessionStorage.js";

export let callerId = "";
export let family = "";

const globalNodes = new Set();
const globalEdges = new Set();
const processedNodes = new Set();
const processedEdges = new Set();

export async function composeGraphData(id, kin, iYear, conceptId, conceptLabel) {
  callerId = id;
  family = kin;

  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();

  await renderLineageData(iYear, conceptId, conceptLabel);

  const nodes = Array.from(globalNodes).map(JSON.parse);
  const edges = Array.from(globalEdges).map(JSON.parse);
  
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  
  return { nodes, edges };
}

// Fetch and process lineage data
async function renderLineageData(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri, pastYear } = targetItem;

  if (forwardYear) {
    await renderGraphData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
  }

  if (pastYear) {
    const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === pastYear);
    if (pastTargetItem) {
      const { correspUri: pastCorrespondenceUrl } = pastTargetItem;
      await renderBackwardGraphData(pastCorrespondenceUrl, conceptId, iYear, pastYear);
    }
  }
}

const requestQueue = new RequestQueue(5);

async function renderGraphData(correspondenceUri, conceptId, conceptLabel, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return;

  const conceptRDFUri = `${correspondenceUri}_${conceptId}`;
  const newTargets = await requestQueue.add(() => fetchAndProcessData(conceptRDFUri, conceptId, conceptLabel, iYear, targetYear));
  if (newTargets.length > 0) {
    processedNodes.add(nodeKey);
    await Promise.all(newTargets.map(target => processForwardLineage(parseInt(target.targetYear), target.targetId, target.targetLabel)));
  }
}

async function renderBackwardGraphData(correspondenceUri, conceptId, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return;

  const newSources = await requestQueue.add(() => fetchAndProcessData(correspondenceUri, conceptId, '', iYear, targetYear));
  if (newSources.length > 0) {
    processedNodes.add(nodeKey);
    await Promise.all(newSources.map(source => renderLineageData(parseInt(source.sourceYear), source.sourceId, source.sourceLabel)));
    await Promise.all(newSources.map(source => processBackwardLineage(parseInt(source.sourceYear), source.sourceId)));
  }
}

async function processForwardLineage(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri } = targetItem;
  if (forwardYear) {
    await renderGraphData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
  }
}

async function processBackwardLineage(iYear, conceptId) {
  const correspondenceTableData = await getCorrespondenceTable();
  const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!pastTargetItem) return;

  const { correspUri, pastYear } = pastTargetItem;
  if (pastYear) {
    await renderBackwardGraphData(correspUri, conceptId, iYear, pastYear);
  }
}

export function getTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const isBackward = iYear > targetYear;
  const bindings = data.results.bindings;
  const targets = isBackward
		? getBackwardTargets(bindings, targetYear)
		: getForwardTargets(bindings, conceptId, conceptLabel, iYear, targetYear);

  return targets;
}

function getForwardTargets(bindings, conceptId, conceptLabel, iYear, targetYear) {
  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges, false);
  
  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));

  return result.targetIds;
}

function getBackwardTargets(bindings, sourceYear) {
  return bindings.map(record => ({
    sourceId: record.sourceId.value,
    sourceYear: sourceYear,
    sourceLabel: record.sourceLabel.value,
  }));
}
