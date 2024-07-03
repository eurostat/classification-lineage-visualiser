import { toQueryParams } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";
import { makeAjaxRequest } from "./ajaxHelper.js";
import { callerId, category, getTargets } from "./dataForGraphs.js";

export async function fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  const corsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";
  const conceptRDFUri = iUri + "_" + conceptId;

  $("#spinner").show();

  // Data to be sent as query parameters
  const data = { query: queryBuilder(callerId, category, conceptRDFUri, iYear) };
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
        // console.log("Raw Response Data:", data); // Log the raw response data
        try {
          let parsedData;
          if (typeof data === "string") {
            try {
              parsedData = JSON.parse(data); // Attempt to parse the data as JSON
            } catch (jsonError) {
              // console.error("JSON parsing error:", jsonError, "Response data:", data);
              reject(new Error("Invalid JSON response"));
              return;
            }
          } else {
            parsedData = data;
          }
          // console.log("Parsed Response Data:", parsedData);
          const newTargets = getTargets(parsedData, conceptId, conceptLabel, iYear, targetYear);
          $("#spinner").hide();
          resolve(newTargets); // Resolve promise with new targets
        } catch (e) {
          console.error("Failed to process response data:", e, "Response data:", data);
          $("#spinner").hide();
          reject(new Error("Invalid JSON response"));
        }
      },
      function (jqXHR, textStatus, errorThrown) {
        console.error("AJAX request error:", textStatus, errorThrown, "Response text:", jqXHR.responseText, conceptRDFUri);
        $("#spinner").hide();
        reject(new Error(errorThrown)); // Reject promise with error
      },
      `${conceptId}-${iYear}-${targetYear}`
    );
  });
}
