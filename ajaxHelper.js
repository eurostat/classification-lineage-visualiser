// File: ajaxHelper.js
export function makeAjaxRequest(url, method, headers, data, onSuccess, onError) {
  $.ajax({
    url: url,
    method: method,
    headers: headers,
    data: data,
    success: onSuccess,
    error: onError
  });
}
// Instead of making an AJAX request, read a local JSON file
export function fakeAjaxRequest(url, method, headers, data, onSuccess, onError, callerId) {
  console.warn('fakeAjaxRequest called with callerId:', callerId);
  const path = { versions: 'data/cn2019.json', categories: 'data/cn-versions.json', concepts:'data/CN2021_CN2022_846229100080.json' }[callerId];
  $.getJSON(path, function(data) {
    onSuccess(data);
  }).fail(function(jqxhr, textStatus, error) {
    onError(jqxhr, textStatus, error);
  });
}