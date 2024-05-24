export const nodes = [
      { id: 1, label: '1905 90 60', year: '2017', title: 'With added sweetening matter (en)', x: 200, y: 100 },
      { id: 2, label: '1905 90 70', year: '2018', title: 'Containing 5 % or more, by weight', x: 600, y: 100 },
      { id: 3, label: '1905 90 80', year: '2017', title: 'Other (en)', x: 200, y: 300 },
      { id: 4, label: '1905 90 90', year: '2018', title: 'Other (en)', x: 600, y: 300 },
      { id: 5, label: '1905 90 70', year: '2019', title: 'Containing 5 % or more, by weight', x: 600, y: 100 },
      { id: 6, label: '1905 90 70', year: '2020', title: 'Containing 5 % or more, by weight', x: 600, y: 100 },
      { id: 7, label: '1905 90 90', year: '2019', title: 'Other (en)', x: 600, y: 300 },
      { id: 8, label: '1905 90 50', year: '2020', title: 'Other (en)', x: 600, y: 300 },
      { id: 9, label: '1905 90 90', year: '2020', title: 'Other (en)', x: 600, y: 300 },
      { id: 13, label: '1905 90 40', year: '2021', title: 'Containing 5 % or more, by weight', x: 600, y: 100 },
      { id: 10, label: '1905 90 50', year: '2021', title: 'Other (en)', x: 600, y: 300 },
      { id: 11, label: '1905 90 90', year: '2021', title: 'Other (en)', x: 600, y: 300 },
    ];

export const edges = [
      { source: 1, target: 2 },
      { source: 1, target: 4 },
      { source: 3, target: 2 },
      { source: 2, target: 5 },
      { source: 5, target: 6 },
      // { source: 4, target: 5 },
      { source: 4, target: 7 },
      { source: 7, target: 8 },
      { source: 7, target: 9 },
      { source: 6, target: 13 },
      { source: 9, target: 11 },
      { source: 8, target: 13 },
    ];

export function getConnectedNodeIds() {
  return new Set(edges.flatMap((e) => [e.source, e.target]));
}

export function getFilteredNodes(connectedNodeIds) {
  return nodes.filter((node) => connectedNodeIds.has(node.id));
}