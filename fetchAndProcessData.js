import { toQueryParams } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest } from "./ajaxHelper.js";
import { callerId, family, getTargets } from "./dataForGraphs.js";

export async function fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  const corsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
  const conceptRDFUri = iUri + "_" + conceptId;

  $("#spinner").show();

  // Data to be sent as query parameters
  const data = { query: queryBuilder(callerId, family, conceptRDFUri, iYear, targetYear) };
  const queryParams = toQueryParams(data);

  return new Promise((resolve, reject) => {
    makeAjaxRequest(
      `${corsAnywhereUrl}${sparqlEndpoint}?${queryParams}`, // Include query parameters in the URL
      "GET", // Change to GET method
      {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      {}, // No data in the body for GET request
      function (data) {
        try {
          const newTargets = getTargets(data, conceptId, conceptLabel, iYear, targetYear);
          resolve(newTargets); // Resolve promise with new targets
        } catch (e) {
          console.error("Failed to process response data:", e, "Response data:", data, 
                        "Parameters:", {conceptId, conceptLabel, iYear, targetYear});
          reject(new Error(`Invalid JSON response for conceptId: ${conceptId}, conceptLabel: ${conceptLabel}, iYear: ${iYear}, targetYear: ${targetYear}`));
        } finally {
          $("#spinner").hide(); 
        }
      },
      function (fetchError) {
        console.error("AJAX request error:", conceptRDFUri);
        $("#spinner").hide();
        document.getElementById('errorContainer').innerText = fetchError;
        reject(new Error(fetchError)); // Reject promise with error
      },
      `${conceptId}-${iYear}-${targetYear}`
    );
  });
}
