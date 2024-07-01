import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { composeGraphData } from "./dataForGraphs.js";
import { renderChart } from "./main.js";

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
		const category = e.params.data.id;
		getDataAndLoadSelect2(e.target.id, category, category);
		$("#versions").empty();
		$("#concepts").empty().prop("disabled", true);
	})
	.on("select2:clear", function (e) {
		$("#versions").empty().prop("disabled", true);
		$("#concepts").empty().prop("disabled", true);
	});

$("#versions")
	.select2()
	.on("select2:select", function (e) {
		const version = e.params.data.id;
		const category = $("#categories").val();
		const uri = e.params.data.data.uri;
		getDataAndLoadSelect2(e.target.id, category, uri, version);
	}).on("select2:clear", function (e) {
		$("#concepts").empty().prop("disabled", true);
	});

$("#concepts").select2()
	.on("select2:select", function (e) {
		const callerId = e.target.id;
		const category = $("#categories").val();
		const uri = $("#versions").select2("data")[0].data.uri;
		const baseYear = Number($("#versions").val());
		const conceptId = e.params.data.id;
		const conceptLabel = e.params.data.label;
	});

$("#submit-button").on("click", async function () {
	// const category = $("#categories").val();
	// const baseYear = Number($("#versions").val());
	// const uri = $("#versions").select2("data")[0].data.uri;
	// const baseUri = getYearComparisonURI(uri, category, baseYear);
	// const conceptId = $("#concepts").select2('data')[0].id;
	// const conceptLabel = $("#concepts").select2('data')[0].text;
	
	try {
		const graphData = await composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2022/CN2022_CN2023", 2022, "846229100080", "8462 29 10");
		// const graphData = await composeGraphData("concepts", category, uri, baseYear, conceptId, conceptLabel);
		renderChart(graphData);
	} catch (error) {
		console.error("Error:", error.message);
	}
});
