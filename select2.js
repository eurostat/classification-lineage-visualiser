import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { getDataForGraphs } from "./dataForGraphs.js";

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

$("#concepts")
	.select2()
	.on("select2:select", function (e) {
		const conceptId = e.params.data.id;
		const version = $("#versions").val();
		const category = $("#categories").val();
		const uri = $("#versions").select2("data")[0].data.uri;
		getDataForGraphs(e.target.id, conceptId, version, category, uri);
	});
