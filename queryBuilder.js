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
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?thisNotation ?thisYear ?pastYear ?nextYear ?correspondenceUri
WHERE { 
  ?currentURI a skos:ConceptScheme ;
              skos:notation ?thisNotation ;
              xkos:belongsTo ?classSeries ;
              owl:versionInfo ?thisYear .

  OPTIONAL { 
    ?currentURI xkos:follows ?previousURI .
    ?previousURI owl:versionInfo ?pastYear .
  }

  OPTIONAL { 
    ?nextURI xkos:follows ?currentURI .
    ?nextURI owl:versionInfo ?nextYear .

    OPTIONAL {
      ?correspondenceUri xkos:compares ?currentURI, ?nextURI ;
                  xkos:madeOf ?association .
      ?association xkos:sourceConcept ?concept .
      ?concept skos:inScheme ?currentURI .
    }
  }

  #FILTER(regex(?thisYear, "\\d{4}"))
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
		const res = queryForConceptId(family, uri, year);
    // console.log(res);
    return res;
	} else if (callerId === "families") {
    const res = correspondenceQuery(family);
    // console.log(res);
    return res;
	} else if (callerId === "concepts") {
    return queryForTargets(uri);
  }
}
