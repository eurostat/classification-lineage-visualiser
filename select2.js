import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";

$("#categories")
	.select2({
		placeholder: "Select an option",
		allowClear: true,
		// minimumResultsForSearch: Infinity,
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
		const path = e.params.data.id;
		const category = $("#categories").val();
		getDataAndLoadSelect2(e.target.id, category, path);
	}).on("select2:clear", function (e) {
		$("#concepts").empty().prop("disabled", true);
	});

$("#concepts")
	.select2()
	.on("select2:select", function (e) {
		const path = e.params.data.id;
		const category = $("#categories").val();
	});
