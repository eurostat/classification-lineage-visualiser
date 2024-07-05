import { composeGraphData } from './dataForGraphs.js';
import { renderChart } from './renderChart.js';

export function createDevDropdown() {
	const urlParams = new URLSearchParams(window.location.search);
	const isDev = urlParams.has("dev");

	if (isDev) {
		// Create a new select element
		const select = document.createElement("select");
		select.id = "devData";
		select.style.width = "270px";

		const option = document.createElement("option");
		option.value = "";
		option.text = "developer shortcuts";
		select.appendChild(option);

		// Append the select element to the header
		const header = document.querySelector("header");
		header.appendChild(select);
		_createDevDropdown();
	}
}

function _createDevDropdown() {

  const data = [
    ["32502180", ["2019"]],
    ["32502181", ["2021"]],
    ["21201380", ["2021"]],
    ["854370900080", ["2018", "2022"]],
    ["382499920080", ["2018", "2022"]],
    ["760612200080", ["2019", "2022"]],
    ["760612920080", ["2019", "2022"]],
    ["190190990080", ["2020", "2022"]],
    ["392690970080", ["2020", "2021"]],
    ["846229100080", ["2021", "2022"]]
  ];

  const devData = data.flatMap(([conceptId, years]) => {
    const category = /^\d{8}$/.test(conceptId) ? "prodcom" : "cn";
    const code =
			category === "cn"
				? conceptId.slice(0, 4) +
				  " " +
				  conceptId.slice(4, 6) +
				  " " +
				  conceptId.slice(6, 8)
				: conceptId.slice(0, 2) +
				  "." +
				  conceptId.slice(2, 4) +
				  "." +
				  conceptId.slice(4, 6) +
				  "." +
				  conceptId.slice(6, 8);

    return years.map(year => {
      return {
        id: conceptId,
        text: `${code} (${category} ${year})`,
        data: {
          id: conceptId,
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
    const category = /^\d{8}$/.test(conceptId) ? "prodcom" : "cn";
    const dom = category === "prodcom" ? "qw1" : "xsp";
    const uri = `http://data.europa.eu/${dom}/xx/`;
    const conceptLabel = e.params.data.data.code;
    const year = e.params.data.data.year;
    const graphData = await composeGraphData("concepts", category, uri, (+year), conceptId, conceptLabel);
    renderChart(graphData);
  });
}
