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