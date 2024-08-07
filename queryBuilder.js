function queryForConceptId(family, uri, version) {
  const uriParts = uri.split('/');
  uriParts.pop();
  const newUri = uriParts.join('/') + '/';
  const depth = family === "prodcom" ? "3" : "5";

	return `
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX : <${newUri}>

    SELECT ?ID ?CODE ?LABEL 
    WHERE { 
        ?conceptUri a skos:Concept;
            skos:inScheme :${family}${version};
            dc:identifier ?ID;
            skos:notation ?CODE;
            skos:altLabel ?LABEL.
            
        FILTER (datatype(?CODE) = xsd:string && LANG(?LABEL) = "en")
        
        ?ClassLevel a xkos:ClassificationLevel;
            skos:member ?conceptUri;
            xkos:depth "${depth}"^^xsd:positiveInteger.
    }
    ORDER BY ASC(?ID)
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

SELECT DISTINCT ?thisNotation ?thisYear ?pastYear ?nextYear ?correspondenceUri ?conceptSchemeUri
WHERE { 
  ?conceptSchemeUri a skos:ConceptScheme ;
              skos:notation ?thisNotation ;
              xkos:belongsTo ?classSeries ;
              owl:versionInfo ?thisYear .

  OPTIONAL { 
    ?conceptSchemeUri xkos:follows ?previousURI .
    ?previousURI owl:versionInfo ?pastYear .
  }

  OPTIONAL { 
    ?nextURI xkos:follows ?conceptSchemeUri .
    ?nextURI owl:versionInfo ?nextYear .

    OPTIONAL {
      ?correspondenceUri xkos:compares ?conceptSchemeUri, ?nextURI ;
                  xkos:madeOf ?association .
      ?association xkos:sourceConcept ?concept .
      ?concept skos:inScheme ?conceptSchemeUri .
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


function forwardQuery(uri){
  return `
    PREFIX : <${uri}>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT  ?ID ?CODE
    WHERE {
      : xkos:targetConcept ?targetConcept .
      ?targetConcept skos:notation ?CODE;
                    dc:identifier ?ID.
      FILTER (DATATYPE(?CODE) = xsd:string)
    }
`
}

function backwardQuery(uri, conceptId) {
  return `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX : <${uri}>

    SELECT ?ID ?CODE
    WHERE {
      : xkos:madeOf ?Association.
      ?Association xkos:targetConcept ?Target.
      ?Target dc:identifier ?targetId.
      FILTER(?targetId= "${conceptId}")
      ?Association xkos:sourceConcept ?Source.
      ?Source dc:identifier ?ID;
              skos:notation ?CODE.
    }
`
}

export function queryBuilder(callerId, family, uri, year, conceptId) {
	if (callerId === "versions") {
		const res = queryForConceptId(family, uri, year);
    // console.log(res);
    return res;
	} else if (callerId === "families") {
    const res = correspondenceQuery(family);
    // console.log(res);
    return res;
	} else if (callerId === "pastConcepts") {
    const res = backwardQuery(uri, conceptId);
    // console.log(res);
    // console.trace();
    return res;
	} else if (callerId === "futureConcepts") {
    const res = forwardQuery(uri);
    // console.log(res);
    return res;
  }
}
