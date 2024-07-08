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

function futureCorrespondenceQuery(family){
  return `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  SELECT DISTINCT ?NOTATION ?VERSION ?URI
  WHERE { 
    ?currentURI a skos:ConceptScheme ;
        skos:notation ?NOTATION;
        xkos:belongsTo <http://data.europa.eu/2en/class-series/${family}>;
        owl:versionInfo ?VERSION.
    
    ?FollowingURI a skos:ConceptScheme ;
        xkos:belongsTo <http://data.europa.eu/2en/class-series/${family}>;
        xkos:follows ?currentURI.
    
    ?URI xkos:compares ?currentURI;
        xkos:compares ?FollowingURI;
        xkos:madeOf ?Association.
        
        ?Association xkos:sourceConcept ?Concept.
        ?Concept skos:inScheme ?currentURI.
  }
`
}

function pastCorrespondenceQuery(family){
  return `
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
  PREFIX xkos: <http://rdf-vocabulary.ddialliance.org/xkos#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>

  SELECT DISTINCT ?NOTATION ?VERSION ?URI
  WHERE { 
    ?pastURI a skos:ConceptScheme ;
        skos:notation ?pastNotation;
        xkos:belongsTo <http://data.europa.eu/2en/class-series/${family}>;
        owl:versionInfo ?pastVersion.
    
    ?currentURI a skos:ConceptScheme ;
        xkos:belongsTo <http://data.europa.eu/2en/class-series/${family}>;
        xkos:follows ?pastURI.

    ?URI xkos:compares ?currentURI;
        xkos:compares ?pastURI;
        xkos:madeOf ?Association.
        
    ?currentURI skos:notation ?NOTATION;
        owl:versionInfo ?VERSION.

    ?Association xkos:sourceConcept ?Concept.
    ?Concept skos:inScheme ?currentURI.
  }
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
    return {future: futureCorrespondenceQuery(family), past: pastCorrespondenceQuery(family)};
	} else if (callerId === "concepts") {
    return queryForTargets(uri);
  }
}
