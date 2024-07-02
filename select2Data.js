export function populateYearOptions(elementId, startYear, endYear, category) {
  const selectElement = document.getElementById(elementId);
  const path = { cn: "xsp", prodcom: "qw1" }[category];

  // Clear any existing options
  selectElement.innerHTML = '';

  // Add a disabled selected placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.textContent = 'Select a year';
  selectElement.appendChild(placeholderOption);

  // Add options for each year from startYear to endYear
  for (let year = startYear; year <= endYear; year++) {
    const option = document.createElement('option');
    option.value = `<http://data.europa.eu/${path}/>`;
    option.textContent = year;
    selectElement.appendChild(option);
  }
}