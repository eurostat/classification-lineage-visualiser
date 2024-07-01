import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { composeGraphData } from "./dataForGraphs.js";

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
		$("#versions").empty()
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
		// console.log("Button clicked", $("#concepts").select2('data')[0]);
		const conceptLabel = e.params.data.label;
		// console.log("label:", conceptLabel);
		// console.log("Concept selected:", callerId, category, uri, baseYear, conceptId);
		composeGraphData(callerId, category, uri, baseYear, conceptId, conceptLabel);
	});


	// Replace the select event handler with a click event handler for the button
	$("#submit-button").on("click", function () {
		// const callerId = $("#concepts").attr('id');
		// const category = $("#categories").val();
		// const baseYear = Number($("#versions").val());
		// const uri = $("#versions").select2("data")[0].data.uri;
		// const baseUri = getYearComparisonURI(uri, category, baseYear);
		// const conceptId = $("#concepts").select2('data')[0].id;

		// console.log("Button clicked:", callerId, category, baseUri, baseYear, conceptId);
		// composeGraphData(callerId, category, baseUri, baseYear, conceptId);
		// composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2022/CN2022_CN2023", 2020, "190190990080");
		composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2022/CN2022_CN2023", 2022, "846229100080", "8462 29 10");
		// composeGraphData("concepts", "cn", "http://data.europa.eu/xsp/cn2022/CN2022_CN2023", 2021, "846299200080");


	});
