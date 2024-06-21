import { createConceptURL, modifyYearInURL } from "./uriHelper.js";
import { queryBuilder } from "./queryBuilder.js";


export function getDataForGraphs(callerId, conceptId, version, category, uri) {
  console.log("getDataForGraphs called with id:", conceptId, "version:", version, "category:", category, "uri:", uri); 
  try {
    const conceptRDFUrl = createConceptURL(uri, category) + '_' + conceptId;
    const query = queryBuilder(callerId, category, conceptRDFUrl);
    console.log("Query graph data:", query);

  } catch (error) {
    console.error("Error:", error.message);
  }
}
