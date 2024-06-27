// File: ajaxHelper.js
export async function makeAjaxRequest(url, method, headers, data, onSuccess, onError) {
  if (method === "GET") {
    // Try to get the response from the cache
    const cache = await caches.open('classification-cache');
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      // If the response is in the cache, use it
      onSuccess(await cachedResponse.json());
    } else {
      // If the response is not in the cache, fetch it
      try {
        const response = await fetch(url, { headers });
        // Put the fetched response into the cache
        cache.put(url, response.clone());
        onSuccess(await response.json());
      } catch (error) {
        onError(error);
      }
    }
  } else {
    // For non-GET requests, use jQuery's $.ajax method
    $.ajax({
      url: url,
      method: method,
      headers: headers,
      data: data,
      success: onSuccess,
      error: onError
    });
  }
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

