// scales.js
export function getXScale(years, width) {
  return d3
    .scaleBand()
    .domain(years)
    .range([50, width - 50])
    .padding(0,3);
}

export function getYScale(filteredNodes, height) {
  return d3
    .scaleLinear()
    .domain([0, filteredNodes.length])
    .range([50, height - 50]);
}