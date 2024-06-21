import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
import { mainData } from './sampleMainData.js';

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
		const id = e.params.data.id;
		const version = $("#versions").val();
		const category = $("#categories").val();
		const uri = $("#versions").select2("data")[0].data.uri;
		queryBuilderForTargetMatch(id, version, category, uri);
	});

function createModifiedUrl(baseUrl, category) {
	const urlParts = new URL(baseUrl);
	const { pathname } = urlParts;
	const path = pathname.split('/');

	const currentVersionYear = path[path.length - 1];

	const yearMatch = currentVersionYear.match(/(\d{4})/);
	if (!yearMatch) {
		throw new Error("Invalid year format in URL");
	}

	const extractedYear = yearMatch[1];
	const nextVersionYear = (+extractedYear) + 1;

	const upperCaseCategory = category.toUpperCase();
	path[path.length - 1] = `${upperCaseCategory}${extractedYear}_${upperCaseCategory}${nextVersionYear}`;

	urlParts.pathname = path.join('/');

	return urlParts.toString();
}

function incrementYearInURL(url,category) {
  return url.replace(/(\d{4})(?=\D|$)/g, (match) => parseInt(match) + 1);
}

function decrementYearInURL(url, category) {
  const regex = new RegExp(`(${category})(\\d{4})(?=\\D|$)`, 'gi');
  return url.replace(regex, (match, p1, p2) => `${p1}${parseInt(p2) - 1}`);
}

	function queryBuilderForTargetMatch(id, version, category, uri) {
		try {
			const modifiedUrl = createModifiedUrl(uri, category, version) + '_' + id;
			console.log(modifiedUrl); // Output: http://data.europa.eu/qw1/prodcom2022/PRODCOM2022_PRODCOM2023
			console.log(incrementYearInURL(modifiedUrl,category)); // Output: http://data.europa.eu/qw1/prodcom2022/PRODCOM2022_PRODCOM2023
			console.log(decrementYearInURL(modifiedUrl,category)); // Output: http://data.europa.eu/qw1/prodcom2022/PRODCOM2022_PRODCOM2023
		} catch (error) {
			console.error("Error:", error.message);
		}
	}