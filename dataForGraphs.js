import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessTargets } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";
import { getCorrespondenceTable } from "./sessionStorage.js";

export let callerId = "";
export let family = "";

const globalNodes = new Set();
const globalEdges = new Set();
const processedNodes = new Set();
const processedEdges = new Set();
const requestQueue = new RequestQueue(5);

export async function composeGraphData(id, kin, iYear, conceptId, conceptLabel) {
  callerId = id;
  family = kin;

  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();

  await renderBothWaysLineageData(iYear, conceptId, conceptLabel, true);

  if (globalNodes.size === 0) {
    const nodes = [{ id: `${conceptId}-${iYear}`, label: conceptLabel, year: iYear }];
    return { nodes, edges: [] };
  }

  const nodes = Array.from(globalNodes).map(JSON.parse);
  const edges = Array.from(globalEdges).map(JSON.parse);

  console.log("Nodes:", nodes);
  console.log("Edges:", edges);

  return { nodes, edges };
}

async function renderBothWaysLineageData(iYear, conceptId, conceptLabel, directFamily = false) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri, pastYear } = targetItem;

  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear, directFamily);
  }

  if (pastYear) {
    const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === pastYear);
    if (pastTargetItem) {
      await renderBackwardGraphData(pastTargetItem.correspUri, conceptId, iYear, pastYear, directFamily);
    }
  }
}

async function renderForwardLineageData(correspondenceUri, conceptId, conceptLabel, iYear, targetYear, lookBack = false) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return;

  const conceptRDFUri = `${correspondenceUri}_${conceptId}`;
  const newTargets = await requestQueue.add(() => fetchAndProcessTargets(conceptRDFUri, conceptId, conceptLabel, iYear, targetYear));
  
  if (newTargets.length > 0) {
    processedNodes.add(nodeKey);
    await Promise.all(newTargets.map(target => processForwardLineage(parseInt(target.targetYear), target.targetId, target.targetLabel)));
  }
}

async function renderBackwardGraphData(correspondenceUri, conceptId, iYear, targetYear, lookForward = false) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return;

  const newSources = await requestQueue.add(() => fetchAndProcessTargets(correspondenceUri, conceptId, '', iYear, targetYear));

  if (newSources.length > 0) {
    processedNodes.add(nodeKey);
    await Promise.all(newSources.map(source => renderBothWaysLineageData(parseInt(source.sourceYear), source.sourceId, source.sourceLabel)));
    await Promise.all(newSources.map(source => processBackwardLineage(parseInt(source.sourceYear), source.sourceId)));
  }
}

async function processForwardLineage(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri } = targetItem;
  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
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

export function processTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const isBackward = iYear > targetYear;
  const bindings = data.results.bindings;
  return isBackward
    ? getBackwardTargets(bindings, targetYear)
    : getForwardTargets(bindings, conceptId, conceptLabel, iYear, targetYear);
}

function getForwardTargets(bindings, conceptId, conceptLabel, iYear, targetYear) {
  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges, false);

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
