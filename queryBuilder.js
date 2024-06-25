function queryBuilderForCodeId(category, uri, version) {
  const uriParts = uri.split('/');
  uriParts.pop();
  const newUri = uriParts.join('/') + '/';

	return `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX : <${newUri}>

    SELECT ?ID ?CODE ?LABEL WHERE { 
        ?s a skos:Concept;
            skos:inScheme :${category}${version};
            dc:identifier ?ID;
            skos:notation ?CODE;
            skos:altLabel ?LABEL.
        FILTER ( datatype(?CODE) = xsd:string  &&  LANG(?LABEL) = "en")
    }
`;
}

function queryBuilderForVersion(category) {
	return `
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  SELECT DISTINCT ?URI ?NOTATION ?VERSION
  WHERE { 
    ?URI a skos:ConceptScheme ;
        skos:prefLabel ?Title ;
        dct:creator <http://publications.europa.eu/resource/authority/corporate-body/ESTAT> ;
        skos:notation ?NOTATION ;
        xkos:belongsTo ?classFamily ;
        owl:versionInfo ?VERSION.
    FILTER (regex(?NOTATION, "${category.toUpperCase()}.*") && regex(?VERSION, "\\\\d{4}"))
  }
  ORDER BY DESC(?VERSION)
`;
}

function queryBuilderForGraphs(uri){
  return`
    PREFIX ns2: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    prefix : <${uri}>

    SELECT ?CODE ?ID ?LABEL
    WHERE {
      : ns2:targetConcept ?targetConcept .
      ?targetConcept skos:notation ?CODE;
                    dc:identifier ?ID;
                    skos:altLabel ?LABEL.
      FILTER(DATATYPE(?CODE) = xsd:string && LANG(?LABEL) = "en")
    }
  `
}

export function queryBuilder(callerId, category, uri, year) {
	if (callerId === "versions") {
		return queryBuilderForCodeId(category, uri, year);
	} else if (callerId === "categories") {
		return queryBuilderForVersion(category);
	} else if (callerId === "concepts") {
    return queryBuilderForGraphs(uri);
  }
}