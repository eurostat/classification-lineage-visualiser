// scales.js
export function getXScale(years, width) {
  return d3
    .scaleBand()
    .domain(years)
    .range([50, width - 50])
    .padding(0,3);
}
