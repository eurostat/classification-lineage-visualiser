// File: select2Helper.js
export function initializeSelect2(callerId, data) {
  const elementId = { versions: 'concepts', categories: 'versions' }[callerId];
  $(`#${elementId}`).select2({
    placeholder: 'Select an option',
    allowClear: true,
    data: data
  });
  $(`#${elementId}`).prop('disabled', false);
}