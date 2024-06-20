export function populateYearOptions(elementId, startYear, endYear) {
  const selectElement = document.getElementById(elementId);

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
    option.value = year;
    option.textContent = year;
    selectElement.appendChild(option);
  }
}

export function getDataAndLoadSelect2(category, year) {
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const query = queryBuilderForId(category, year);
  console.log('Executing query:', query);

  $('#spinner').show();

  $.ajax({
    url: `${corsAnywhereUrl}${sparqlEndpoint}`,
    method: 'POST',
    headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      query: query
    },
    success: function (data) {
      const formattedData = data.results.bindings.map(item => ({
        id: item.ID.value,
        text: item.CODE.value
      }));

      // Initialize Select2 with the fetched data
      $('#code').select2({
        placeholder: 'Select an option',
        allowClear: true,
        data: formattedData
      });
      
      $('#spinner').hide();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error executing query:', errorThrown);
      
      $('#spinner').hide();
    }
  });
}

function queryBuilderForId(category,year) {
  const path = { cn: "xsp", prodcom: "qw1" }[category]; 
  return `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX : <http://data.europa.eu/${path}/${category}${year}/>

    SELECT ?ID ?CODE WHERE { 
        ?s a skos:Concept;
            skos:inScheme :${category}${year};
            dc:identifier ?ID;
            skos:notation ?CODE.
        FILTER ( datatype(?CODE) = xsd:string )
    }
`;
}
export function populateVersionOptions(elementId, category) {
  const selectElement = document.getElementById(elementId);

  // Clear any existing options
  selectElement.innerHTML = '';

  // Add a disabled selected placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.textContent = 'Select a version';
  selectElement.appendChild(placeholderOption);

  // Add options for each version
  const corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
  const sparqlEndpoint = "http://publications.europa.eu/webapi/rdf/sparql";

  const query = queryBuilderForVersion(category);
  console.log('Executing query:', query);

  $('#spinner').show();

  $.ajax({
    url: `${corsAnywhereUrl}${sparqlEndpoint}`,
    method: 'POST',
    headers: {
      'Accept': 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      query: query
    },
    success: function (data) {
      const formattedData = data.results.bindings.map(item => ({
        id: item.URI.value,
        text: item.notation.value
      }));

      // Initialize Select2 with the fetched data
      $('#version').select2({
        placeholder: 'Select a version',
        allowClear: true,
        data: formattedData
      });
      
      $('#spinner').hide();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error executing query:', errorThrown);
      
      $('#spinner').hide();
    }
  });
}

function queryBuilderForVersion(category){
  return `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?URI ?notation
WHERE { 
  ?URI a skos:ConceptScheme ;
       skos:prefLabel ?Title ;
       dct:creator <http://publications.europa.eu/resource/authority/corporate-body/ESTAT> ;
       skos:notation ?notation ;
       xkos:belongsTo ?classFamily ;
       owl:versionInfo ?version.
  FILTER (regex(?notation, "${category.toUpperCase()}.*") && regex(?version, "\\\\d{4}"))
}
ORDER BY DESC(?version)
`;
}