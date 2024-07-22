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


function forwardQuery(uri, directFamily){
  return `
    PREFIX : <${uri}>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>

    SELECT ?CODE ?ID ?LABEL ?CLOSE_MATCH_ID ?CLOSE_MATCH_VERSION ?CLOSE_MATCH_CODE ?CLOSE_MATCH_FAMILY
    WHERE {
      # Define the target concept
      : xkos:targetConcept ?targetConcept .
      
      # Retrieve the code, identifier, and label of the target concept
      ?targetConcept skos:notation ?CODE;
                    dc:identifier ?ID;
                    skos:altLabel ?LABEL .
                    
      # Filter to ensure CODE is a string and LABEL is in English
      FILTER (DATATYPE(?CODE) = xsd:string && LANG(?LABEL) = "en")
      
      # Optionally retrieve the close match identifier if available and its code and version
      OPTIONAL { 
        ?targetConcept skos:closeMatch ?CLOSE_MATCH .
        ?CLOSE_MATCH dc:identifier ?CLOSE_MATCH_ID ;
                    owl:versionInfo ?CLOSE_MATCH_VERSION ;
                    skos:notation ?CLOSE_MATCH_CODE .
        FILTER (DATATYPE(?CLOSE_MATCH_CODE) = xsd:string)
      }
      BIND("${directFamily}" AS ?CLOSE_MATCH_FAMILY)
    }
`
}

function backwardQuery(uri, conceptId) {
  return `
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
    PREFIX : <${uri}>

    SELECT ?sourceId ?sourceLabel
    WHERE {
      : xkos:madeOf ?Association.
      ?Association xkos:targetConcept ?Target.
      ?Target dc:identifier ?targetId.
      FILTER(?targetId= "${conceptId}")
      ?Association xkos:sourceConcept ?Source.
      ?Source dc:identifier ?sourceId;
              skos:notation ?sourceLabel.
    }
`
}

export function queryBuilder(callerId, family, uri, year, conceptId, directFamily) {
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
    const res = forwardQuery(uri, directFamily);
    // console.log(res);
    return res;
  }
}
