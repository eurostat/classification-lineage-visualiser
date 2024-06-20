// File: select2Helper.js
export function initializeSelect2(elementId, data) {
  $(`#${elementId}`).select2({
    placeholder: 'Select an option',
    allowClear: true,
    data: data
  });
}