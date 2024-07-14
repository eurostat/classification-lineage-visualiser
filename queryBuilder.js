function queryForConceptId(family, uri, version) {
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
            skos:inScheme :${family}${version};
            dc:identifier ?ID;
            skos:notation ?CODE;
            skos:altLabel ?LABEL.
        FILTER ( datatype(?CODE) = xsd:string  &&  LANG(?LABEL) = "en")
    }
`;
}

function correspondenceQuery(family){
  return `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?thisNotation ?thisYear ?nextYear ?comparison
WHERE { 
  ?currentURI a skos:ConceptScheme ;
              skos:notation ?thisNotation ;
              xkos:belongsTo ?classSeries ;
              owl:versionInfo ?thisYear .
  
  ?FollowingURI a skos:ConceptScheme ;
                xkos:belongsTo ?classSeries ;
                xkos:follows ?currentURI .
  
  ?comparison xkos:compares ?currentURI ;
       xkos:compares ?FollowingURI ;
       xkos:madeOf ?Association .
  
  ?Association xkos:sourceConcept ?Concept .
  ?Concept skos:inScheme ?currentURI .
  ?FollowingURI owl:versionInfo ?nextYear .
  
  VALUES ?classSeries { 
    <http://data.europa.eu/2en/class-series/${family}> 
    <http://data.europa.eu/2en/classification-series/${family}> 
  }
}
ORDER BY DESC(?thisYear)
`
}


function queryForTargets(uri){
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

export function queryBuilder(callerId, family, uri, year) {
	if (callerId === "versions") {
		return queryForConceptId(family, uri, year);
	} else if (callerId === "families") {
    return correspondenceQuery(family);
	} else if (callerId === "concepts") {
    return queryForTargets(uri);
  }
}
