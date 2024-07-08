import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { composeGraphData } from "./dataForGraphs.js";
import { renderChart } from "./renderChart.js";

$("#families")
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

		const family = e.params.data.id;
		getDataAndLoadSelect2(e.target.id, family);
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
		const family = $("#families").val();
		const futureURI = e.params.data.data.futureURI;
		const pastURI = e.params.data.data.pastURI;
		console.log("Future URI:", futureURI);
		console.log("Past URI:", pastURI);

		getDataAndLoadSelect2(e.target.id, family, futureURI || pastURI, version);
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

	const family = $("#families").val();
	const baseYear = Number($("#versions").val());
	const futureURI = $("#versions").select2("data")[0].data.futureURI;
	const pastURI = $("#versions").select2("data")[0].data.pastURI;
	console.log("Future URI:", futureURI);
	console.log("Past URI:", pastURI);
	const conceptId = $("#concepts").select2('data')[0].id;
	const conceptLabel = $("#concepts").select2('data')[0].code;
	
	try {
		const graphData = await composeGraphData("concepts", family, futureURI, baseYear, conceptId, conceptLabel);
		renderChart(graphData);
	} catch (error) {
		console.error("Error:", error.message);
	}
});

