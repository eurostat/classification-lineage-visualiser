import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { composeGraphData } from "./dataForGraphs.js";
import { renderChart } from "./main.js";
import { getYearComparisonURI } from "./uriHelper.js";

$("#categories")
	.select2({
		placeholder: "Select an option",
		allowClear: true,
		minimumResultsForSearch: Infinity,
		data: [
			{ id: "cn", text: "Combined Nomenclature" },
			{ id: "prodcom", text: "Community Production" },
		],
	})
	.on("select2:select", function (e) {
		$("#versions").empty();
		$("#concepts").empty().prop("disabled", true);
		$("#visualization").empty();

		const category = e.params.data.id;
		getDataAndLoadSelect2(e.target.id, category, category);
	})
	.on("select2:clear", function (e) {
		$("#versions").empty().prop("disabled", true);
		$("#concepts").empty().prop("disabled", true);
		$("#visualization").empty();
	});

$("#versions")
	.select2()
	.on("select2:select", function (e) {
		$("#concepts").empty().prop("disabled", true);
		$("#visualization").empty();

		const version = e.params.data.id;
		const category = $("#categories").val();
		const uri = e.params.data.data.uri;
		getDataAndLoadSelect2(e.target.id, category, uri, version);
	})
	.on("select2:clear", function (e) {
		$("#concepts").empty().prop("disabled", true);
		$("#visualization").empty();
	});

$("#concepts").select2()
	.on("select2:select", function (e) {
		$("#visualization").empty();
	})

$("#submit-button").on("click", async function () {
	const category = $("#categories").val();
	const baseYear = Number($("#versions").val());
	const uri = $("#versions").select2("data")[0].data.uri;
	// const baseUri = getYearComparisonURI(uri, category, baseYear);
	const conceptId = $("#concepts").select2('data')[0].id;
	const conceptLabel = $("#concepts").select2('data')[0].text;
	
	try {
		// const graphData = await composeGraphData("concepts", category, baseUri, baseYear, conceptId, conceptLabel);
		const graphData = await composeGraphData("concepts", category, uri, baseYear, conceptId, conceptLabel);
		renderChart(graphData);
	} catch (error) {
		console.error("Error:", error.message);
	}
});

$("#dataOptions").on("change", async function () {
	$("#visualization").empty();
	const selectedOption = $(this).val(); // get the selected option

	let graphData;
	if (selectedOption === "1") {
		graphData = await composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2022/CN2022_CN2023", 2022, "846229100080", "8462 29 10");
	} else if (selectedOption === "2") {
		graphData = await composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2020/CN2020_CN2021", 2020, "190190990080", "1901 90 99");
	}

	renderChart(graphData);
});
