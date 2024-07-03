// File: ajaxHelper.js
export async function makeAjaxRequest(url, method, headers, data, onSuccess, onError, memo) {
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
        const contentType = response.headers.get("content-type");
        
        if (contentType && (contentType.includes("application/json") || contentType.includes("application/sparql-results+json"))) {
          const data = await response.json();
          try {
            cache.put(url, new Response(JSON.stringify(data), response));
          } catch (cacheError) {
            console.error('Caching failed:', cacheError);
          }
          onSuccess(data);
        } else {
          $("#spinner").hide();
          const responseText = await response.text();
          const errMessage = `Response is not JSON [ref: ${memo}]
          Response text: ${responseText}`;
          document.getElementById('errorContainer').innerText = errMessage;
          throw new Error(errMessage); // Reject promise with error
        }
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
export class RequestQueue {
  constructor(maxConcurrent) {
    this.queue = [];
    this.activeCount = 0;
    this.maxConcurrent = maxConcurrent;
  }

  add(promiseFn) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => promiseFn().then(resolve).catch(reject));
      this.next();
    });
  }

  next() {
    if (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const promiseFn = this.queue.shift();
      this.activeCount++;
      promiseFn().finally(() => {
        this.activeCount--;
        this.next();
      });
    }
  }
}

