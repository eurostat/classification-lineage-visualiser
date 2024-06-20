import { populateYearOptions } from "./select2Data.js";
import { getDataAndLoadSelect2 } from "./getDataAndLoadSelect2.js";
document.getElementById("category").addEventListener("change", (event) => {
	const category = event.target.value;
	if (1) {
		const sYear = { cn: 2017, prodcom: 2021 }[category];
		const eYear = { cn: 2024, prodcom: 2024 }[category];
		populateYearOptions("versions", sYear, eYear, category);
		return;
	}
	populateVersionOptions("versions", category);
});
document.getElementById("versions").addEventListener("change", (event) => {
	const year = event.target.value;
	const category = document.getElementById("category").value;
	getDataAndLoadSelect2(category, year);
});
