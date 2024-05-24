// nodes.js
export function positionNodes(years, filteredNodes, xScale, yScale) {
  const nodeMap = new Map();
  years.forEach((year) => {
    const yearNodes = filteredNodes.filter((node) => node.year === year);
    yearNodes.forEach((node, i) => {
      node.x = xScale(year);
      node.y = yScale(i + 1);
      nodeMap.set(node.id, node);
    });
  });
  return nodeMap;
}
