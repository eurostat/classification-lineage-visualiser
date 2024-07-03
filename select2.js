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
		$("#versions").empty();
		$("#concepts").empty().prop("disabled", true);
		$("#visualization").empty();

		const category = e.params.data.id;
		getDataAndLoadSelect2(e.target.id, category, category);
	})
	.on("select2:clear", function (e) {
		$("#versions").empty().prop("disabled", true);
		$("#concepts").empty().prop("disabled", true);
		$("#submit-button").prop("disabled", true);
		$("#errorContainer").empty();
		$("#visualization").empty();
	});

$("#versions")
	.select2()
	.on("select2:select", function (e) {
		$("#concepts").empty().prop("disabled", true);
		$("#submit-button").prop("disabled", true);
		$("#visualization").empty();
		$("#errorContainer").empty();

		const version = e.params.data.id;
		const category = $("#categories").val();
		const uri = e.params.data.data.uri;
		getDataAndLoadSelect2(e.target.id, category, uri, version);
	})
	.on("select2:clear", function (e) {
		$("#concepts").empty().prop("disabled", true);
		$("#submit-button").prop("disabled", true);
		$("#visualization").empty();
		$("#errorContainer").empty();
	});

$("#concepts").select2()
	.on("select2:select", function (e) {
		$("#submit-button").prop("disabled", false);
		$("#visualization").empty();
		$("#errorContainer").empty();
	})

$("#submit-button").on("click", async function () {
	$("#visualization").empty();
	$("#errorContainer").empty();

	const category = $("#categories").val();
	const baseYear = Number($("#versions").val());
	const uri = $("#versions").select2("data")[0].data.uri;
	const conceptId = $("#concepts").select2('data')[0].id;
	const conceptLabel = $("#concepts").select2('data')[0].code;
	
	try {
		const graphData = await composeGraphData("concepts", category, uri, baseYear, conceptId, conceptLabel);
		renderChart(graphData);
	} catch (error) {
		console.error("Error:", error.message);
	}
});

