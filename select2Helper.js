// File: select2Helper.js
export function initializeSelect2(callerId, data) {
  const elementId = { versions: 'concepts', categories: 'versions' }[callerId];
  $(`#${elementId}`).select2({
    placeholder: 'Select an option',
    allowClear: true,
    data: data
  });
  $(`#${elementId}`).prop('disabled', false);
}

import { composeGraphData } from './dataForGraphs.js';
import { renderChart } from './renderChart.js';
export function createDevDropdown() {

  const data = [
    ["32502180", ["2019"]],
    ["32502181", ["2024"]],
    ["854370900080", ["2018", "2022"]],
    ["382499920080", ["2018", "2022"]],
    ["760612200080", ["2019", "2022"]],
    ["760612920080", ["2019", "2022"]],
    ["190190990080", ["2020", "2022"]],
    ["392690970080", ["2020", "2021"]],
    ["846229100080", ["2021", "2022"]]
  ];

  const devData = data.flatMap(([id, years]) => {
    const code = id.slice(0, 4) + ' ' + id.slice(4, 6) + ' ' + id.slice(6, 8);

    return years.map(year => {
      return {
        id: id,
        text: code + ' (' + year + ')',
        data: {
          id: id,
          year: year,
          code: code
        }
      };
    });
  });

  $("#devData").select2({
    placeholder: "Select an option",
    allowClear: true,
    data: devData,
  }).on("select2:select", async function (e) {
    $("#visualization").empty();
    $("#errorContainer").empty();
    
    const conceptId = e.params.data.data.id;
    const category = conceptId === "32502180"? "prodcom":"cn";
    const dom = category === "prodcom" ? "qw1" : "xsp";
    const uri = "http://data.europa.eu/xsp/xx/";
    const conceptLabel = e.params.data.data.code;
    const year = e.params.data.data.year;
    const graphData = await composeGraphData("concepts", category, uri, (+year), conceptId, conceptLabel);
    renderChart(graphData);
  });
}